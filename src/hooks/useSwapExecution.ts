"use client";
import { useState, useCallback, useRef } from "react";
import { useAccount, useConfig } from "wagmi";
import { readContract, writeContract, sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { erc20Abi } from "viem";
import type { Hex, Address } from "viem";

const NATIVE = "0x0000000000000000000000000000000000000000";

export type SwapStep = "idle" | "approving" | "waiting-approval" | "sending" | "waiting-tx" | "polling" | "done" | "failed";

export interface SwapState {
  step: SwapStep;
  txHash: Hex | null;
  destTxHash: Hex | null;
  explorerLink: string | null;
  error: string | null;
}

async function recordPoints(params: {
  wallet: string;
  txHash: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amountUSD: string;
  feeUSD: string;
}) {
  try {
    const referralCode = typeof window !== "undefined"
      ? localStorage.getItem("mm_referral_code") ?? undefined
      : undefined;
    await fetch("/api/points/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, referralCode }),
    });
  } catch {
    // Silent fail — points tracking should never break swap UX
  }
}

// Persist tx state to localStorage so it survives page refresh
function savePendingTx(data: { txHash: string; fromChain: number; toChain: number; bridge: string }) {
  try { localStorage.setItem("mm_pending_tx", JSON.stringify({ ...data, timestamp: Date.now() })); } catch {}
}

function clearPendingTx() {
  try { localStorage.removeItem("mm_pending_tx"); } catch {}
}

export function useSwapExecution() {
  const config = useConfig();
  const { address } = useAccount();
  const abortRef = useRef(false);

  const [state, setState] = useState<SwapState>({
    step: "idle",
    txHash: null,
    destTxHash: null,
    explorerLink: null,
    error: null,
  });

  const execute = useCallback(async (quote: any) => {
    if (!address) throw new Error("Wallet not connected");
    abortRef.current = false;

    setState({ step: "idle", txHash: null, destTxHash: null, explorerLink: null, error: null });

    try {
      const { transactionRequest, action, estimate } = quote;
      const isNative = action.fromToken.address.toLowerCase() === NATIVE.toLowerCase();

      // Step 1: ERC20 approval — EXACT AMOUNT ONLY (never MAX_UINT256)
      if (!isNative) {
        const allowance = await readContract(config, {
          address: action.fromToken.address as Address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, estimate.approvalAddress as Address],
        });

        const exactAmount = BigInt(action.fromAmount);

        if (BigInt(allowance as bigint) < exactAmount) {
          setState(s => ({ ...s, step: "approving" }));

          // Reset to 0 first if existing approval > 0 (prevents front-running attack)
          if (BigInt(allowance as bigint) > 0n) {
            const resetHash = await writeContract(config, {
              address: action.fromToken.address as Address,
              abi: erc20Abi,
              functionName: "approve",
              args: [estimate.approvalAddress as Address, 0n],
            });
            await waitForTransactionReceipt(config, { hash: resetHash, confirmations: 1 });
          }

          // Approve exact amount needed — never unlimited
          const approveHash = await writeContract(config, {
            address: action.fromToken.address as Address,
            abi: erc20Abi,
            functionName: "approve",
            args: [estimate.approvalAddress as Address, exactAmount],
          });

          setState(s => ({ ...s, step: "waiting-approval" }));
          const receipt = await waitForTransactionReceipt(config, { hash: approveHash, confirmations: 1 });
          if (receipt.status !== "success") throw new Error("Approval failed");
        }
      }

      const { switchChain } = await import("@wagmi/core").then(m => m);
      await switchChain(config, { chainId: transactionRequest.chainId });

      // Step 2: Send swap transaction
      setState(s => ({ ...s, step: "sending" }));
      const txHash = await sendTransaction(config, {
        to: transactionRequest.to as Address,
        data: transactionRequest.data as Hex,
        value: BigInt(transactionRequest.value),
        gas: BigInt(transactionRequest.gasLimit),
        chainId: transactionRequest.chainId,
      });

      setState(s => ({ ...s, step: "waiting-tx", txHash }));
      const swapReceipt = await waitForTransactionReceipt(config, { hash: txHash, confirmations: 1 });
      if (swapReceipt.status !== "success") throw new Error("Swap transaction failed");

      // Step 3: Poll status for cross-chain — persist to localStorage so refresh doesn't lose tracking
      const isCrossChain = action.fromChainId !== action.toChainId;
      if (isCrossChain) {
        savePendingTx({
          txHash,
          fromChain: action.fromChainId,
          toChain: action.toChainId,
          bridge: quote.tool,
        });

        setState(s => ({ ...s, step: "polling" }));
        let result: any;
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max

        do {
          await new Promise(r => setTimeout(r, 10000));
          if (abortRef.current) break;
          attempts++;

          try {
            const params = new URLSearchParams({
              txHash,
              bridge: quote.tool,
              fromChain: action.fromChainId.toString(),
              toChain: action.toChainId.toString(),
            });
            const res = await fetch(`https://li.quest/v1/status?${params}`);
            result = await res.json();

            if (result.status === "DONE") {
              setState(s => ({
                ...s,
                destTxHash: result.receiving?.txHash ?? null,
                explorerLink: result.lifiExplorerLink ?? null,
              }));
            }
          } catch {
            // Network error during polling — don't fail the swap, keep polling
            continue;
          }
        } while (
          result?.status !== "DONE" &&
          result?.status !== "FAILED" &&
          attempts < maxAttempts
        );

        clearPendingTx();

        if (result?.status === "FAILED") throw new Error("Bridge transfer failed");
        if (attempts >= maxAttempts) {
          // Timed out but don't show as failed — show explorer link
          setState(s => ({
            ...s,
            explorerLink: `https://scan.li.fi/tx/${txHash}`,
          }));
        }
      }

      // Step 4: Record points
      await recordPoints({
        wallet: address,
        txHash,
        fromChain: action.fromChainId.toString(),
        toChain: action.toChainId.toString(),
        fromToken: action.fromToken.symbol,
        toToken: action.toToken.symbol,
        amountUSD: estimate.fromAmountUSD ?? "0",
        feeUSD: estimate.gasCosts?.[0]?.amountUSD ?? "0",
      });

      setState(s => ({ ...s, step: "done" }));
    } catch (err) {
      clearPendingTx();
      const msg = err instanceof Error ? err.message : "Swap failed";
      setState(s => ({ ...s, step: "failed", error: msg }));
      throw err;
    }
  }, [address, config]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ step: "idle", txHash: null, destTxHash: null, explorerLink: null, error: null });
  }, []);

  return { execute, reset, ...state };
}