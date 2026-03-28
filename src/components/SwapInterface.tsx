"use client";
import { useState, useRef, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, Token } from "@/lib/wagmi";
import { getRoutes, getRiskLabel, RouteResult } from "@/lib/lifi";
import { ethers } from "ethers";
import { useSwapExecution } from "@/hooks/useSwapExecution";

const TOKEN_LOGOS: Record<string, string> = {
  ETH:   "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  WBTC:  "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
  USDC:  "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  USDT:  "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  BNB:   "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  ARB:   "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  OP:    "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
};

const CHAIN_LOGOS: Record<number, string> = {
  1:         "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  137:       "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  56:        "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  42161:     "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  10:        "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  11155111:  "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
};

type TxStatus = "idle" | "pending" | "bridging" | "swapping" | "done";
const TX_STEPS: TxStatus[] = ["pending", "bridging", "swapping", "done"];
const TX_META: Record<string, { label: string; detail: string; color: string }> = {
  pending:  { label: "Waiting for confirmation", detail: "Confirm the transaction in your wallet", color: "#A0B0C8" },
  bridging: { label: "Bridging assets",           detail: "Moving your tokens across chains...",    color: "#7B61FF" },
  swapping: { label: "Swapping tokens",            detail: "Executing swap on destination chain",   color: "#F3BA2F" },
  done:     { label: "Transaction complete",       detail: "Your tokens have arrived",              color: "#00E5FF" },
};

function Img({ src, size = 24 }: { src: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#1C2333", flexShrink: 0 }} />;
  return <img src={src} width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0 }} onError={() => setErr(true)} />;
}

function useOutsideClick(ref: React.RefObject<HTMLDivElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

function ChainDropdown({ value, onChange }: { value: typeof SUPPORTED_CHAINS[0]; onChange: (c: typeof SUPPORTED_CHAINS[0]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "5px 10px 5px 6px", cursor: "pointer" }}>
        <Img src={CHAIN_LOGOS[value.id]} size={16} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#A0B0C8" }}>{value.name}</span>
        <span style={{ fontSize: 9, color: "#3D4F6B" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 100, minWidth: 170, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          {SUPPORTED_CHAINS.map(c => (
            <button key={c.id} onClick={() => { onChange(c); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: c.id === value.id ? "rgba(0,229,255,0.06)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <Img src={CHAIN_LOGOS[c.id]} size={18} />
              <span style={{ fontSize: 13, fontWeight: 600, color: c.id === value.id ? "#00E5FF" : "#E0EAF4" }}>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenDropdown({ value, tokens, onChange }: { value: Token; tokens: Token[]; onChange: (t: Token) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "7px 10px 7px 8px", cursor: "pointer", whiteSpace: "nowrap" }}>
        <Img src={TOKEN_LOGOS[value.symbol] ?? ""} size={22} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>{value.symbol}</span>
        <span style={{ fontSize: 9, color: "#3D4F6B" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 100, minWidth: 180, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          {tokens.map(t => (
            <button key={t.address} onClick={() => { onChange(t); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", background: t.address === value.address ? "rgba(0,229,255,0.06)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <Img src={TOKEN_LOGOS[t.symbol] ?? ""} size={24} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.address === value.address ? "#00E5FF" : "#F0F4FF" }}>{t.symbol}</div>
                <div style={{ fontSize: 11, color: "#3D4F6B" }}>{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonRoute() {
  return (
    <div style={{ background: "#0D1117", border: "1px solid #1C2333", borderRadius: 14, padding: 16, overflow: "hidden", position: "relative", marginBottom: 6 }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(0,229,255,0.03),transparent)", animation: "shimmer 1.5s infinite" }} />
      {[80, 130, 55].map((w, i) => (
        <div key={i} style={{ height: 11, borderRadius: 6, background: "#1C2333", marginBottom: i < 2 ? 10 : 0, width: w }} />
      ))}
    </div>
  );
}

function TxModal({ route, fromToken, toToken, amount, onClose }: { route: RouteResult; fromToken: Token; toToken: Token; amount: string; onClose: () => void }) {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [step, setStep] = useState(0);
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  const fmt = (raw: string, dec: number) => { try { return parseFloat(ethers.formatUnits(raw, dec)).toFixed(6); } catch { return "—"; } };

  const simulate = async () => {
    setStatus("pending"); setStep(0); await delay(1800);
    setStatus("bridging"); setStep(1); await delay(2400);
    setStatus("swapping"); setStep(2); await delay(1800);
    setStatus("done"); setStep(3);
  };

  const meta = status !== "idle" ? TX_META[status] : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>Confirm Swap</span>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#F3BA2F", background: "rgba(243,186,47,0.1)", padding: "2px 8px", borderRadius: 5 }}>SIMULATED</span>
          </div>
          {(status === "idle" || status === "done") && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#3D4F6B", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>

        <div style={{ background: "rgba(6,8,16,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1, marginBottom: 4 }}>YOU SEND</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#F0F4FF" }}>{amount} {fromToken.symbol}</div>
            </div>
            <div style={{ fontSize: 20, color: "#3D4F6B" }}>→</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1, marginBottom: 4 }}>YOU RECEIVE</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#00E5FF" }}>{fmt(route.toAmount, toToken.decimals)} {toToken.symbol}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16 }}>
            {[["FEE", `$${parseFloat(route.gasCostUSD || "0").toFixed(2)}`], ["TIME", route.executionDuration < 60 ? `~${route.executionDuration}s` : `~${Math.ceil(route.executionDuration / 60)}m`], ["VALUE", `~$${parseFloat(route.toAmountUSD || "0").toFixed(2)}`]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>{l}</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {status !== "idle" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", padding: "0 4px" }}>
              <div style={{ position: "absolute", top: 11, left: "calc(4px + 11px)", right: "calc(4px + 11px)", height: 2, background: "#1C2333", borderRadius: 2 }}>
                <div style={{ height: "100%", background: "#00E5FF", borderRadius: 2, transition: "width 0.6s ease", width: `${(step / 3) * 100}%` }} />
              </div>
              {TX_STEPS.map((s, i) => {
                const done = i < step || status === "done";
                const active = i === step && status !== "done";
                return (
                  <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#00E5FF" : active ? "#0D1117" : "#1C2333", border: active ? "2px solid #00E5FF" : done ? "none" : "2px solid #1C2333", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", flexShrink: 0 }}>
                      {done && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#060810" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00E5FF", animation: "mmPulse 1s ease-in-out infinite" }} />}
                    </div>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: done ? "#00E5FF" : active ? "#A0B0C8" : "#3D4F6B", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                      {["Pending","Bridging","Swapping","Done"][i]}
                    </div>
                  </div>
                );
              })}
            </div>
            {meta && (
              <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(6,8,16,0.6)", border: `1px solid ${meta.color}22`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                {status !== "done" && <div style={{ width: 13, height: 13, border: `2px solid ${meta.color}44`, borderTopColor: meta.color, borderRadius: "50%", animation: "mmSpin 0.8s linear infinite", flexShrink: 0 }} />}
                {status === "done" && <span style={{ color: "#00E5FF", fontSize: 13 }}>✓</span>}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "#3D4F6B", fontFamily: "monospace", marginTop: 1 }}>{meta.detail}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {status === "idle" && (
          <button onClick={simulate} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Confirm Swap · Simulated
          </button>
        )}
        {status === "done" && (
          <button onClick={onClose} style={{ width: "100%", padding: 15, borderRadius: 14, background: "transparent", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.3)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Done
          </button>
        )}
        {status !== "idle" && status !== "done" && (
          <button disabled style={{ width: "100%", padding: 15, borderRadius: 14, background: "#0D1520", color: "#2D3F52", border: "none", fontWeight: 700, fontSize: 14, cursor: "not-allowed" }}>
            Processing...
          </button>
        )}
      </div>
    </div>
  );
}

export function SwapInterface() {
  const { address } = useAccount();
  const [fromChain, setFromChain] = useState(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain]     = useState(SUPPORTED_CHAINS[1]);
  const [fromToken, setFromToken] = useState(SUPPORTED_TOKENS[1][0]);
  const [toToken, setToToken]     = useState(SUPPORTED_TOKENS[137][0]);
  const [amount, setAmount]       = useState("");
  const [routes, setRoutes]       = useState<RouteResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [routesVisible, setRoutesVisible] = useState(false);
  const [showTx, setShowTx]       = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const swap = useSwapExecution();

  // Wallet balance for the selected from token
  const isNativeToken = fromToken.address === "0x0000000000000000000000000000000000000000";
  const { data: balanceData } = useBalance({
    address,
    token: isNativeToken ? undefined : fromToken.address as `0x${string}`,
    chainId: fromChain.id,
  });

  const fromTokens = SUPPORTED_TOKENS[fromChain.id] ?? [];
  const toTokens   = SUPPORTED_TOKENS[toChain.id]   ?? [];
  const reset = () => { setRoutes([]); setSelectedRoute(null); setRoutesVisible(false); setShowDetails(false); };

  const switchChains = () => {
    const [fc, tc, ft, tt] = [fromChain, toChain, fromToken, toToken];
    setFromChain(tc); setToChain(fc); setFromToken(tt); setToToken(ft); reset();
  };

  const findRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true); setError(""); reset();
    try {
      const fromAmount = ethers.parseUnits(amount, fromToken.decimals).toString();
      const result = await getRoutes({ fromChainId: fromChain.id, toChainId: toChain.id, fromTokenAddress: fromToken.address, toTokenAddress: toToken.address, fromAmount, fromAddress: address });
      if (result.length === 0) setError("No routes found. Try a different amount or pair.");
      else { setRoutes(result); setSelectedRoute(result[0]); setTimeout(() => setRoutesVisible(true), 50); }
    } catch (e: any) {
      setError(e?.message ?? "Could not fetch routes. Check your connection.");
    }
    finally { setLoading(false); }
  };

  const fmt = (raw: string, dec: number) => { try { return parseFloat(ethers.formatUnits(raw, dec)).toFixed(6); } catch { return "—"; } };
  const fmtTime = (s: number) => s < 60 ? `~${s}s` : `~${Math.ceil(s / 60)}m`;

  const S = {
    page: { minHeight: "100vh", background: "#060810", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "24px 12px", position: "relative" as const, overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
    card: { width: "100%", maxWidth: 468, position: "relative" as const, zIndex: 1 },
    swapCard: { background: "rgba(13,17,23,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "14px 12px", backdropFilter: "blur(20px)", boxShadow: "0 0 0 1px rgba(0,229,255,0.04), 0 24px 64px rgba(0,0,0,0.5)" },
    box: { background: "rgba(6,8,16,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 14px" },
    boxLabel: { fontSize: 11, color: "#3D4F6B", fontFamily: "monospace", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" },
    row: { display: "flex", alignItems: "center", gap: 8 },
    input: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 24, fontWeight: 700, color: "#F0F4FF", fontFamily: "'DM Sans', sans-serif", minWidth: 0, maxWidth: "100%" },
  };

  return (
    <>
      <style>{`@keyframes mmSpin{to{transform:rotate(360deg)}}@keyframes mmPulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>

      {/* Executing swap modal */}
      {swap.step !== "idle" && swap.step !== "done" && swap.step !== "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF", marginBottom: 16 }}>Executing Swap</div>
            <div style={{ fontSize: 13, color: "#A0B0C8", fontFamily: "monospace" }}>
              {swap.step === "approving" && "Approve token in wallet..."}
              {swap.step === "waiting-approval" && "Waiting for approval..."}
              {swap.step === "sending" && "Confirm swap in wallet..."}
              {swap.step === "waiting-tx" && "Waiting for confirmation..."}
              {swap.step === "polling" && "Bridge transfer in progress..."}
            </div>
            {swap.txHash && <div style={{ fontSize: 11, color: "#3D4F6B", fontFamily: "monospace", marginTop: 8, wordBreak: "break-all" }}>{swap.txHash}</div>}
          </div>
        </div>
      )}

      {/* Swap complete modal */}
      {swap.step === "done" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0D1117", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#00E5FF", marginBottom: 8 }}>Swap Complete ✓</div>
            {swap.explorerLink && <a href={swap.explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#00E5FF", fontFamily: "monospace" }}>View on LI.FI Explorer</a>}
            <button onClick={swap.reset} style={{ width: "100%", marginTop: 16, padding: 14, borderRadius: 12, background: "transparent", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.3)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {/* Swap failed modal */}
      {swap.step === "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0D1117", border: "1px solid rgba(252,129,129,0.3)", borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#FC8181", marginBottom: 8 }}>Swap Failed</div>
            {swap.error && <div style={{ fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", marginBottom: 16, lineHeight: 1.5 }}>{swap.error}</div>}
            <button onClick={swap.reset} style={{ width: "100%", padding: 14, borderRadius: 12, background: "transparent", color: "#FC8181", border: "1px solid rgba(252,129,129,0.3)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Try Again</button>
          </div>
        </div>
      )}

      {showTx && selectedRoute && (
        <TxModal route={selectedRoute} fromToken={fromToken} toToken={toToken} amount={amount} onClose={() => setShowTx(false)} />
      )}

      <div style={S.page}>
        {showBanner && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, background: "rgba(243,186,47,0.08)", borderBottom: "1px solid rgba(243,186,47,0.15)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#F3BA2F" }}>⚠ MultiMesh is in beta. Use small amounts and proceed with caution.</span>
            <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", color: "#3D4F6B", cursor: "pointer", fontSize: 16, padding: 0, marginLeft: 12 }}>×</button>
          </div>
        )}
        <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, background: "radial-gradient(circle,rgba(0,229,255,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: -200, right: -200, width: 500, height: 500, background: "radial-gradient(circle,rgba(123,97,255,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F0F4FF", letterSpacing: -0.5 }}>MULTI<span style={{ color: "#00E5FF" }}>MESH</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ fontSize: 11, color: "#3D4F6B", fontFamily: "monospace", letterSpacing: 1 }}>Cross-Chain Swap Aggregator</div>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "#F3BA2F", background: "rgba(243,186,47,0.1)", padding: "1px 6px", borderRadius: 4, letterSpacing: 1 }}>BETA</span>
              </div>
            </div>
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>

          <div style={S.swapCard}>
            <div style={S.box}>
              <div style={S.boxLabel}>
                <span>From</span>
                <ChainDropdown value={fromChain} onChange={c => { setFromChain(c); setFromToken(SUPPORTED_TOKENS[c.id][0]); reset(); }} />
              </div>
              <div style={S.row}>
                <input style={S.input} type="number" placeholder="0.00" value={amount} onChange={e => { setAmount(e.target.value); reset(); }} />
                <TokenDropdown value={fromToken} tokens={fromTokens} onChange={t => { setFromToken(t); reset(); }} />
              </div>
              {/* Wallet balance */}
              {address && balanceData && (
                <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B" }}>Balance:</span>
                  <button onClick={() => setAmount(parseFloat(balanceData.formatted).toFixed(6))} style={{ fontSize: 11, fontFamily: "monospace", color: "#00E5FF", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
              <button onClick={switchChains} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#3D4F6B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⇅</button>
            </div>

            <div style={S.box}>
              <div style={S.boxLabel}>
                <span>To</span>
                <ChainDropdown value={toChain} onChange={c => { setToChain(c); setToToken(SUPPORTED_TOKENS[c.id][0]); reset(); }} />
              </div>
              <div style={S.row}>
                <div style={{ flex: 1, fontSize: 28, fontWeight: 700, color: selectedRoute ? "#00E5FF" : "#1C2A3A" }}>
                  {selectedRoute ? fmt(selectedRoute.toAmount, toToken.decimals) : "0.00"}
                </div>
                <TokenDropdown value={toToken} tokens={toTokens} onChange={t => { setToToken(t); reset(); }} />
              </div>

              {selectedRoute && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>FEE</div>
                        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>${parseFloat(selectedRoute.gasCostUSD || "0").toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>TIME</div>
                        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>{fmtTime(selectedRoute.executionDuration)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>RISK</div>
                        <div style={{ fontSize: 12, fontFamily: "monospace", color: getRiskLabel(selectedRoute.tags).color, marginTop: 2 }}>{getRiskLabel(selectedRoute.tags).label}</div>
                      </div>
                    </div>
                    <button onClick={() => setShowDetails(d => !d)} style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                      {showDetails ? "Hide ▲" : "Details ▾"}
                    </button>
                  </div>

                  {showDetails && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1, marginBottom: 6 }}>ROUTE</div>
                      {selectedRoute.steps?.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                          {selectedRoute.steps.map((s, si) => (
                            <span key={si} style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 5 }}>{s.tool}</span>
                          ))}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>VALUE OUT</div>
                        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>~${parseFloat(selectedRoute.toAmountUSD || "0").toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={findRoutes} disabled={loading || !amount} style={{ width: "100%", padding: 15, borderRadius: 14, background: loading || !amount ? "#0D1520" : "#00E5FF", color: loading || !amount ? "#2D3F52" : "#060810", border: "none", fontWeight: 700, fontSize: 14, cursor: loading || !amount ? "not-allowed" : "pointer", marginTop: 8 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(6,8,16,0.3)", borderTopColor: "#060810", borderRadius: "50%", animation: "mmSpin 0.7s linear infinite" }} />
                  Scanning Routes...
                </div>
              ) : "Find Best Route"}
            </button>

            {error && <div style={{ fontSize: 12, fontFamily: "monospace", color: "#FC8181", textAlign: "center", padding: 10, background: "rgba(252,129,129,0.06)", borderRadius: 10, border: "1px solid rgba(252,129,129,0.15)", marginTop: 8 }}>{error}</div>}
          </div>

          {loading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Scanning...</div>
              {[0,1,2].map(i => <SkeletonRoute key={i} />)}
            </div>
          )}

          {!loading && routes.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { if (address && selectedRoute?.transactionRequest) { swap.execute(selectedRoute); } else { setShowTx(true); } }} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                {address ? "Swap Now" : "Connect Wallet to Swap"}
              </button>
            </div>
          )}

          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#1C2A3A", textAlign: "center", marginTop: 20 }}>Powered by LI.FI &nbsp;·&nbsp; ETH &nbsp;·&nbsp; MATIC &nbsp;·&nbsp; BNB &nbsp;·&nbsp; ARB &nbsp;·&nbsp; OP</div>
        </div>
      </div>
    </>
  );
}