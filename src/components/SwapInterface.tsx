"use client";
import { useState, useRef, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, Token } from "@/lib/wagmi";
import { getRoutes, getRiskLabel, RouteResult } from "@/lib/lifi";
import { ethers } from "ethers";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { RefuelBanner } from "@/components/RefuelBanner";

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
  8453:      "https://assets.coingecko.com/coins/images/35506/small/base.png",
  11155111:  "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
};

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum", 137: "Polygon", 56: "BNB Chain", 42161: "Arbitrum", 10: "Optimism", 8453: "Base", 11155111: "Sepolia",
};

interface SwapHistoryEntry {
  id: string; timestamp: number; fromChain: string; toChain: string;
  fromToken: string; toToken: string; fromAmount: string; toAmount: string;
  txHash: string; explorerLink?: string;
}

const HISTORY_KEY = "multimesh_swap_history";
function loadHistory(): SwapHistoryEntry[] {
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveHistory(entries: SwapHistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50))); } catch {}
}

const SLIPPAGE_OPTIONS = [0.5, 1, 3, 5];

function Img({ src, size = 24 }: { src: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#1A1F2E", flexShrink: 0 }} />;
  return <img src={src} width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0 }} onError={() => setErr(true)} />;
}

function useOutsideClick(ref: React.RefObject<HTMLDivElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

function SlippagePanel({ slippage, onChange, onClose }: { slippage: number; onChange: (v: number) => void; onClose: () => void }) {
  const [custom, setCustom] = useState("");
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, onClose);
  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, zIndex: 150, width: 220, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
      <div style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 10 }}>SLIPPAGE</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {SLIPPAGE_OPTIONS.map(opt => (
          <button key={opt} onClick={() => { onChange(opt); setCustom(""); }}
            style={{ flex: 1, padding: "6px 0", borderRadius: 8, background: slippage === opt ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: slippage === opt ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)", color: slippage === opt ? "#818CF8" : "#A0B0C8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {opt}%
          </button>
        ))}
      </div>
      <input value={custom} onChange={e => { setCustom(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0 && v <= 50) onChange(v); }} placeholder="Custom %"
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: "monospace", color: "#EEF2FF", outline: "none" }} />
      {slippage > 5 && <div style={{ fontSize: 10, fontFamily: "monospace", color: "#F59E0B", marginTop: 6 }}>⚠ High slippage</div>}
    </div>
  );
}

function ChainDropdown({ value, onChange }: { value: typeof SUPPORTED_CHAINS[0]; onChange: (c: typeof SUPPORTED_CHAINS[0]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "4px 8px 4px 5px", cursor: "pointer" }}>
        <Img src={CHAIN_LOGOS[value.id]} size={14} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#A0B0C8", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.name}</span>
        <span style={{ fontSize: 8, color: "#4B5A72" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 100, minWidth: 160, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          {SUPPORTED_CHAINS.map(c => (
            <button key={c.id} onClick={() => { onChange(c); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: c.id === value.id ? "rgba(99,102,241,0.08)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <Img src={CHAIN_LOGOS[c.id]} size={18} />
              <span style={{ fontSize: 13, fontWeight: 600, color: c.id === value.id ? "#818CF8" : "#E0EAF4" }}>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenDropdown({ value, tokens, onChange, chainId }: { value: Token; tokens: Token[]; onChange: (t: Token) => void; chainId: number }) {
  const [open, setOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState("");
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => { setOpen(false); setCustomAddress(""); setCustomError(""); });

  const handleCustomToken = async () => {
    if (!customAddress || customAddress.length < 10) return;
    setCustomLoading(true); setCustomError("");
    try {
      const res = await fetch(`https://li.quest/v1/token?chain=${chainId}&token=${customAddress}`);
      if (!res.ok) throw new Error("Token not found");
      const data = await res.json();
      onChange({ symbol: data.symbol ?? "???", name: data.name ?? customAddress.slice(0, 8), address: customAddress, decimals: data.decimals ?? 18, logo: "" });
      setOpen(false); setCustomAddress("");
    } catch { setCustomError("Token not found on this chain"); }
    setCustomLoading(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "6px 8px 6px 7px", cursor: "pointer", whiteSpace: "nowrap" }}>
        <Img src={TOKEN_LOGOS[value.symbol] ?? ""} size={20} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#EEF2FF" }}>{value.symbol}</span>
        <span style={{ fontSize: 8, color: "#4B5A72" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 100, minWidth: 200, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          {tokens.map(t => (
            <button key={t.address} onClick={() => { onChange(t); setOpen(false); setCustomAddress(""); setCustomError(""); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", background: t.address === value.address ? "rgba(99,102,241,0.08)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <Img src={TOKEN_LOGOS[t.symbol] ?? ""} size={22} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.address === value.address ? "#818CF8" : "#EEF2FF" }}>{t.symbol}</div>
                <div style={{ fontSize: 10, color: "#4B5A72" }}>{t.name}</div>
              </div>
            </button>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 6, padding: "8px 6px 4px" }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 6 }}>PASTE CONTRACT ADDRESS</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={customAddress} onChange={e => { setCustomAddress(e.target.value); setCustomError(""); }} onKeyDown={e => e.key === "Enter" && handleCustomToken()} placeholder="0x..."
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 8px", fontSize: 11, fontFamily: "monospace", color: "#EEF2FF", outline: "none", minWidth: 0 }} />
              <button onClick={handleCustomToken} disabled={customLoading} style={{ padding: "6px 10px", borderRadius: 8, background: customLoading ? "#1A1F2E" : "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818CF8", fontSize: 11, cursor: customLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                {customLoading ? "..." : "Add"}
              </button>
            </div>
            {customError && <div style={{ fontSize: 10, fontFamily: "monospace", color: "#F87171", marginTop: 4 }}>{customError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonRoute() {
  return (
    <div style={{ background: "#0A0C16", border: "1px solid #1A1F2E", borderRadius: 14, padding: 16, overflow: "hidden", position: "relative", marginBottom: 6 }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.04),transparent)", animation: "shimmer 1.5s infinite" }} />
      {[80, 130, 55].map((w, i) => (
        <div key={i} style={{ height: 11, borderRadius: 6, background: "#1A1F2E", marginBottom: i < 2 ? 10 : 0, width: w }} />
      ))}
    </div>
  );
}

function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<SwapHistoryEntry[]>([]);
  useEffect(() => { setHistory(loadHistory()); }, []);
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 460, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#EEF2FF" }}>Swap History</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4B5A72", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, fontSize: 13, fontFamily: "monospace", color: "#4B5A72" }}>No swaps yet</div>
          ) : history.map(h => (
            <div key={h.id} style={{ padding: "12px 14px", background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#EEF2FF" }}>{h.fromAmount} {h.fromToken} → {h.toAmount} {h.toToken}</div>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", flexShrink: 0, marginLeft: 8 }}>{fmtDate(h.timestamp)}</span>
              </div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", marginBottom: 6 }}>{h.fromChain} → {h.toChain}</div>
              {h.explorerLink && <a href={h.explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontFamily: "monospace", color: "#818CF8", textDecoration: "none" }}>View on LI.FI Explorer ↗</a>}
            </div>
          ))}
        </div>
        {history.length > 0 && (
          <button onClick={() => { saveHistory([]); setHistory([]); }} style={{ marginTop: 14, width: "100%", padding: 10, borderRadius: 10, background: "transparent", color: "#4B5A72", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
            Clear History
          </button>
        )}
      </div>
    </div>
  );
}

function PriceImpactWarning({ route, amount, toToken }: { route: RouteResult; amount: string; toToken: Token }) {
  const toUSD = parseFloat(route.toAmountUSD || "0");
  const toAmt = parseFloat(ethers.formatUnits(route.toAmount, toToken.decimals));
  const pricePerToken = toAmt > 0 ? toUSD / toAmt : 0;
  const inputUSD = parseFloat(amount || "0") * pricePerToken;
  const priceImpact = toUSD > 0 && inputUSD > 0 ? ((inputUSD - toUSD) / inputUSD) * 100 : 0;
  if (priceImpact <= 5) return null;
  const isHigh = priceImpact > 15;
  return (
    <div style={{ fontSize: 11, fontFamily: "monospace", color: isHigh ? "#F87171" : "#F59E0B", padding: "8px 12px", background: isHigh ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)", borderRadius: 8, border: `1px solid ${isHigh ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`, marginTop: 8 }}>
      {isHigh ? "🔴" : "⚠"} Price impact: ~{priceImpact.toFixed(1)}% — {isHigh ? "HIGH RISK." : "Consider splitting."}
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
  const [showDetails, setShowDetails] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSlippage, setShowSlippage] = useState(false);
  const [slippage, setSlippage]   = useState(5);
  const [fromTokenUnverified, setFromTokenUnverified] = useState(false);
  const [toTokenUnverified, setToTokenUnverified] = useState(false);
  const swap = useSwapExecution();
  const settingsRef = useRef<HTMLDivElement>(null!);

  const isNativeToken = fromToken.address === "0x0000000000000000000000000000000000000000";
  const { data: balanceData } = useBalance({
    address,
    token: isNativeToken ? undefined : fromToken.address as `0x${string}`,
    chainId: fromChain.id,
  });

  useEffect(() => {
    if (swap.step === "done" && swap.txHash && selectedRoute) {
      const entry: SwapHistoryEntry = {
        id: swap.txHash, timestamp: Date.now(),
        fromChain: CHAIN_NAMES[fromChain.id] ?? fromChain.name,
        toChain: CHAIN_NAMES[toChain.id] ?? toChain.name,
        fromToken: fromToken.symbol, toToken: toToken.symbol,
        fromAmount: parseFloat(amount).toFixed(4),
        toAmount: parseFloat(ethers.formatUnits(selectedRoute.toAmount, toToken.decimals)).toFixed(4),
        txHash: swap.txHash, explorerLink: swap.explorerLink ?? undefined,
      };
      saveHistory([entry, ...loadHistory()]);
    }
  }, [swap.step]);

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
      const result = await getRoutes({ fromChainId: fromChain.id, toChainId: toChain.id, fromTokenAddress: fromToken.address, toTokenAddress: toToken.address, fromAmount, fromAddress: address, slippage: slippage / 100 });
      if (result.length === 0) setError("No routes found. Try a different amount or pair.");
      else { setRoutes(result); setSelectedRoute(result[0]); setTimeout(() => setRoutesVisible(true), 50); }
    } catch (e: any) {
      setError(e?.message ?? "Could not fetch routes. Check your connection.");
    } finally { setLoading(false); }
  };

  const fmt = (raw: string, dec: number) => { try { return parseFloat(ethers.formatUnits(raw, dec)).toFixed(6); } catch { return "—"; } };
  const fmtTime = (s: number) => s < 60 ? `~${s}s` : `~${Math.ceil(s / 60)}m`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mmSpin{to{transform:rotate(360deg)}}
        @keyframes mmPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        * { box-sizing: border-box; }
        .mm-page {
          min-height: 100vh;
          background: #04060E;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 70px 12px 24px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .mm-card { width: 100%; max-width: 468px; position: relative; z-index: 1; }
        .mm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
        .mm-header-right { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .mm-swap-card {
          background: rgba(10,12,22,0.95);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 14px 12px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.05), 0 24px 64px rgba(0,0,0,0.5);
        }
        .mm-box { background: rgba(4,6,14,0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 12px 14px; }
        .mm-box-label { font-size: 11px; color: #4B5A72; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .mm-input-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .mm-amount-input { flex: 1; background: transparent; border: none; outline: none; font-size: 24px; font-weight: 700; color: #EEF2FF; font-family: 'DM Sans', sans-serif; min-width: 0; width: 100%; }
        @media (max-width: 400px) { .mm-amount-input { font-size: 20px; } .mm-logo-sub { display: none; } }
        @media (max-width: 360px) { .mm-amount-input { font-size: 18px; } }
      `}} />

      {/* Execution modals */}
      {swap.step !== "idle" && swap.step !== "done" && swap.step !== "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#EEF2FF", marginBottom: 16 }}>Executing Swap</div>
            <div style={{ fontSize: 13, color: "#A0B0C8", fontFamily: "monospace" }}>
              {swap.step === "approving" && "Approve token in wallet..."}
              {swap.step === "waiting-approval" && "Waiting for approval..."}
              {swap.step === "sending" && "Confirm swap in wallet..."}
              {swap.step === "waiting-tx" && "Waiting for confirmation..."}
              {swap.step === "polling" && "Bridge transfer in progress..."}
            </div>
            {swap.txHash && <div style={{ fontSize: 11, color: "#4B5A72", fontFamily: "monospace", marginTop: 8, wordBreak: "break-all" }}>{swap.txHash}</div>}
          </div>
        </div>
      )}

      {swap.step === "done" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0A0C16", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#818CF8", marginBottom: 8 }}>Swap Complete ✓</div>
            {swap.explorerLink && <a href={swap.explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#818CF8", fontFamily: "monospace" }}>View on LI.FI Explorer</a>}
            {selectedRoute && <RefuelBanner toChainId={toChain.id} toChainName={toChain.name} onDismiss={swap.reset} />}
            <button onClick={swap.reset} style={{ width: "100%", marginTop: 16, padding: 14, borderRadius: 12, background: "transparent", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {swap.step === "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0A0C16", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F87171", marginBottom: 8 }}>Swap Failed</div>
            {swap.error && <div style={{ fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", marginBottom: 16, lineHeight: 1.5 }}>{swap.error}</div>}
            <button onClick={swap.reset} style={{ width: "100%", padding: 14, borderRadius: 12, background: "transparent", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Try Again</button>
          </div>
        </div>
      )}

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}

      <div className="mm-page">
        {showBanner && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.15)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#F59E0B", lineHeight: 1.4 }}>⚠ MultiMesh is in beta. Use small amounts.</span>
            <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", color: "#4B5A72", cursor: "pointer", fontSize: 16, padding: 0, marginLeft: 8, flexShrink: 0 }}>×</button>
          </div>
        )}

        <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, background: "radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: -200, right: -200, width: 500, height: 500, background: "radial-gradient(circle,rgba(139,92,246,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)", backgroundSize: "72px 72px", pointerEvents: "none" }} />

        <div className="mm-card">
          <div className="mm-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/logo.jpg" width={48} height={48} style={{ borderRadius: "50%", mixBlendMode: "screen" }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#EEF2FF", fontFamily: "'Space Grotesk',sans-serif" }}>MULTI<span style={{ color: "#818CF8" }}>MESH</span></div>
                  <div className="mm-logo-sub" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                    <div style={{ fontSize: 10, color: "#4B5A72", fontFamily: "monospace", letterSpacing: 1 }}>Cross-Chain Aggregator</div>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "1px 5px", borderRadius: 4, letterSpacing: 1 }}>BETA</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mm-header-right">
              <button onClick={() => setShowHistory(true)} style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#4B5A72", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1 }}>
                HISTORY
              </button>
              <a href="/points" style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1, textDecoration: "none" }}>
                POINTS ✦
              </a>
              <div ref={settingsRef} style={{ position: "relative" }}>
                <button onClick={() => setShowSlippage(s => !s)} style={{ padding: "5px 8px", borderRadius: 8, background: showSlippage ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)", border: showSlippage ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.07)", color: slippage !== 5 ? "#818CF8" : "#4B5A72", fontSize: 10, fontFamily: "monospace", cursor: "pointer" }}>
                  ⚙ {slippage}%
                </button>
                {showSlippage && <SlippagePanel slippage={slippage} onChange={v => { setSlippage(v); reset(); }} onClose={() => setShowSlippage(false)} />}
              </div>
              <ConnectButton chainStatus="none" showBalance={false} />
            </div>
          </div>

          <div className="mm-swap-card">
            <div className="mm-box">
              <div className="mm-box-label">
                <span>From</span>
                <ChainDropdown value={fromChain} onChange={c => { setFromChain(c); setFromToken(SUPPORTED_TOKENS[c.id][0]); reset(); }} />
              </div>
              <div className="mm-input-row">
                <input className="mm-amount-input" type="number" placeholder="0.00" value={amount} onChange={e => { setAmount(e.target.value); reset(); }} />
                <TokenDropdown value={fromToken} tokens={fromTokens} onChange={t => { setFromToken(t); setFromTokenUnverified(!SUPPORTED_TOKENS[fromChain.id]?.find(x => x.address === t.address)); reset(); }} chainId={fromChain.id} />
              </div>
              {address && balanceData && (
                <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72" }}>Balance:</span>
                  <button onClick={() => setAmount(parseFloat(balanceData.formatted).toFixed(6))} style={{ fontSize: 11, fontFamily: "monospace", color: "#818CF8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
              <button onClick={switchChains} style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#4B5A72", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⇅</button>
            </div>

            <div className="mm-box">
              <div className="mm-box-label">
                <span>To</span>
                <ChainDropdown value={toChain} onChange={c => { setToChain(c); setToToken(SUPPORTED_TOKENS[c.id][0]); reset(); }} />
              </div>
              <div className="mm-input-row">
                <div style={{ flex: 1, fontSize: 26, fontWeight: 700, color: selectedRoute ? "#818CF8" : "#1A1F2E", minWidth: 0 }}>
                  {selectedRoute ? fmt(selectedRoute.toAmount, toToken.decimals) : "0.00"}
                </div>
                <TokenDropdown value={toToken} tokens={toTokens} onChange={t => { setToToken(t); setToTokenUnverified(!SUPPORTED_TOKENS[toChain.id]?.find(x => x.address === t.address)); reset(); }} chainId={toChain.id} />
              </div>
              {selectedRoute && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div><div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>FEE</div><div style={{ fontSize: 11, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>${parseFloat(selectedRoute.gasCostUSD || "0").toFixed(2)}</div></div>
                      <div><div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>TIME</div><div style={{ fontSize: 11, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>{fmtTime(selectedRoute.executionDuration)}</div></div>
                      <div><div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>RISK</div><div style={{ fontSize: 11, fontFamily: "monospace", color: getRiskLabel(selectedRoute.tags).color, marginTop: 2 }}>{getRiskLabel(selectedRoute.tags).label}</div></div>
                    </div>
                    <button onClick={() => setShowDetails(d => !d)} style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                      {showDetails ? "Hide ▲" : "Details ▾"}
                    </button>
                  </div>
                  {showDetails && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      {selectedRoute.steps?.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                          {selectedRoute.steps.map((s, si) => (
                            <span key={si} style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 5 }}>{s.tool}</span>
                          ))}
                        </div>
                      )}
                      <div><div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>VALUE OUT</div><div style={{ fontSize: 11, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>~${parseFloat(selectedRoute.toAmountUSD || "0").toFixed(2)}</div></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={findRoutes} disabled={loading || !amount} style={{ width: "100%", padding: 14, borderRadius: 14, background: loading || !amount ? "#0D1020" : "#6366F1", color: loading || !amount ? "#2D3A50" : "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: loading || !amount ? "not-allowed" : "pointer", marginTop: 8 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "mmSpin 0.7s linear infinite" }} />
                  Scanning Routes...
                </div>
              ) : "Find Best Route"}
            </button>

            {(fromTokenUnverified || toTokenUnverified) && (
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#F59E0B", padding: "8px 12px", background: "rgba(245,158,11,0.06)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.15)", marginTop: 8 }}>
                ⚠ Unverified token — check contract before swapping.
              </div>
            )}

            {selectedRoute && <PriceImpactWarning route={selectedRoute} amount={amount} toToken={toToken} />}

            {error && <div style={{ fontSize: 12, fontFamily: "monospace", color: "#F87171", textAlign: "center", padding: 10, background: "rgba(239,68,68,0.06)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.15)", marginTop: 8 }}>{error}</div>}
          </div>

          {loading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Scanning...</div>
              {[0,1,2].map(i => <SkeletonRoute key={i} />)}
            </div>
          )}

          {!loading && routes.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { if (address && selectedRoute) { swap.execute(selectedRoute); } else if (!address) { alert("Connect your wallet first"); } }} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#6366F1", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                {address ? "Swap Now" : "Connect Wallet to Swap"}
              </button>
            </div>
          )}

          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#1A2030", textAlign: "center", marginTop: 16 }}>Powered by LI.FI · ETH · MATIC · BNB · ARB · OP · BASE</div>
        </div>
      </div>
    </>
  );
}