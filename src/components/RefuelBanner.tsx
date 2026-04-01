"use client";
import { useState, useEffect } from "react";
import { useAccount, useConfig } from "wagmi";
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { ethers } from "ethers";
import { checkDestinationGas, getRefuelQuote, CHAIN_GAS_SYMBOL, MIN_GAS_USD } from "@/lib/lifi";
import type { Hex, Address } from "viem";

interface RefuelBannerProps {
  toChainId: number;
  toChainName: string;
  onDismiss: () => void;
}

type RefuelStep = "idle" | "loading" | "sending" | "waiting" | "done" | "failed";

export function RefuelBanner({ toChainId, toChainName, onDismiss }: RefuelBannerProps) {
  const { address } = useAccount();
  const config = useConfig();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<RefuelStep>("idle");
  const [error, setError] = useState("");

  const gasSymbol = CHAIN_GAS_SYMBOL[toChainId] ?? "ETH";
  const minUSD = MIN_GAS_USD[toChainId] ?? 0.20;

  useEffect(() => {
    if (!address || !toChainId) return;
    checkDestinationGas(address, toChainId).then(({ hasGas }) => {
      if (!hasGas) setShow(true);
    });
  }, [address, toChainId]);

  if (!show) return null;

  const handleRefuel = async () => {
    if (!address) return;
    setStep("loading");
    setError("");

    try {
      // Get user's current chain for refuel source
      // We refuel with a small amount of ETH from source chain
      const fromChainId = 1; // Default from Ethereum — most users have ETH
      const refuelAmountWei = ethers.parseEther("0.002").toString(); // ~$5 worth

      const quote = await getRefuelQuote({
        fromChainId,
        toChainId,
        fromAddress: address,
        toAddress: address,
        fromAmount: refuelAmountWei,
      });

      if (!quote?.transactionRequest) {
        throw new Error("Could not get refuel quote");
      }

      setStep("sending");
      const txHash = await sendTransaction(config, {
        to: quote.transactionRequest.to as Address,
        data: quote.transactionRequest.data as Hex,
        value: BigInt(quote.transactionRequest.value),
        chainId: quote.transactionRequest.chainId,
      });

      setStep("waiting");
      await waitForTransactionReceipt(config, { hash: txHash, confirmations: 1 });
      setStep("done");
      setTimeout(() => { setShow(false); onDismiss(); }, 3000);
    } catch (e: any) {
      setError(e?.message ?? "Refuel failed");
      setStep("failed");
    }
  };

  return (
    <div style={{
      marginTop: 12,
      padding: "14px 16px",
      background: "rgba(243,186,47,0.06)",
      border: "1px solid rgba(243,186,47,0.2)",
      borderRadius: 14,
      animation: "fadeIn 0.3s ease forwards",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F3BA2F", marginBottom: 4 }}>
            ⚡ Low gas on {toChainName}
          </div>
          <div style={{ fontSize: 12, color: "#A0B0C8", lineHeight: 1.5 }}>
            You might not have enough {gasSymbol} to do anything on {toChainName}.
            Add ~${minUSD} of gas to get started.
          </div>
        </div>
        <button
          onClick={() => { setShow(false); onDismiss(); }}
          style={{ background: "none", border: "none", color: "#3D4F6B", cursor: "pointer", fontSize: 16, flexShrink: 0, padding: 0 }}
        >
          ×
        </button>
      </div>

      {step === "idle" && (
        <button
          onClick={handleRefuel}
          style={{ marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 10, background: "rgba(243,186,47,0.15)", border: "1px solid rgba(243,186,47,0.3)", color: "#F3BA2F", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Add Gas to {toChainName} →
        </button>
      )}

      {step === "loading" && (
        <div style={{ marginTop: 10, fontSize: 12, fontFamily: "monospace", color: "#F3BA2F" }}>
          Getting refuel quote...
        </div>
      )}

      {step === "sending" && (
        <div style={{ marginTop: 10, fontSize: 12, fontFamily: "monospace", color: "#F3BA2F" }}>
          Confirm in wallet...
        </div>
      )}

      {step === "waiting" && (
        <div style={{ marginTop: 10, fontSize: 12, fontFamily: "monospace", color: "#F3BA2F" }}>
          Sending gas to {toChainName}...
        </div>
      )}

      {step === "done" && (
        <div style={{ marginTop: 10, fontSize: 12, fontFamily: "monospace", color: "#6B7FA3" }}>
          ✓ Gas added to {toChainName}
        </div>
      )}

      {step === "failed" && (
        <div style={{ marginTop: 10, fontSize: 11, fontFamily: "monospace", color: "#FC8181" }}>
          {error}
        </div>
      )}
    </div>
  );
}