"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, Token } from "@/lib/wagmi";
import { getRoutes, getRiskLabel, RouteResult } from "@/lib/lifi";
import { ethers } from "ethers";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import Link from "next/link";

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
  1:        "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  137:      "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  56:       "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  42161:    "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  10:       "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  8453:     "https://assets.coingecko.com/coins/images/35506/small/base.png",
  11155111: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
};

const SLIPPAGE_OPTIONS = [0.5, 1, 3, 5];

function Img({ src, size = 20 }: { src: string; size?: number }) {
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

function ChainDropdown({ value, onChange, accentColor }: { value: typeof SUPPORTED_CHAINS[0]; onChange: (c: typeof SUPPORTED_CHAINS[0]) => void; accentColor: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 8px 4px 6px", cursor: "pointer" }}>
        <Img src={CHAIN_LOGOS[value.id]} size={14} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#A0B0C8", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.name}</span>
        <span style={{ fontSize: 8, color: "#4B5A72" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 4, zIndex: 100, minWidth: 150, boxShadow: "0 12px 32px rgba(0,0,0,0.7)" }}>
          {SUPPORTED_CHAINS.map(c => (
            <button key={c.id} onClick={() => { onChange(c); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px", background: c.id === value.id ? `${accentColor}12` : "transparent", border: "none", borderRadius: 7, cursor: "pointer" }}>
              <Img src={CHAIN_LOGOS[c.id]} size={16} />
              <span style={{ fontSize: 12, fontWeight: 600, color: c.id === value.id ? accentColor : "#E0EAF4" }}>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenDropdown({ value, tokens, onChange, chainId, accentColor }: { value: Token; tokens: Token[]; onChange: (t: Token) => void; chainId: number; accentColor: string }) {
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
    } catch { setCustomError("Not found"); }
    setCustomLoading(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 8px 6px 7px", cursor: "pointer", whiteSpace: "nowrap" }}>
        <Img src={TOKEN_LOGOS[value.symbol] ?? ""} size={18} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#F0F4FF" }}>{value.symbol}</span>
        <span style={{ fontSize: 8, color: "#4B5A72" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 4, zIndex: 100, minWidth: 180, boxShadow: "0 12px 32px rgba(0,0,0,0.7)" }}>
          {tokens.map(t => (
            <button key={t.address} onClick={() => { onChange(t); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px", background: t.address === value.address ? `${accentColor}12` : "transparent", border: "none", borderRadius: 7, cursor: "pointer" }}>
              <Img src={TOKEN_LOGOS[t.symbol] ?? ""} size={20} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.address === value.address ? accentColor : "#F0F4FF" }}>{t.symbol}</div>
                <div style={{ fontSize: 10, color: "#4B5A72" }}>{t.name}</div>
              </div>
            </button>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0", padding: "6px 4px 2px" }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 5 }}>PASTE CONTRACT</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input value={customAddress} onChange={e => { setCustomAddress(e.target.value); setCustomError(""); }} onKeyDown={e => e.key === "Enter" && handleCustomToken()} placeholder="0x..."
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 7px", fontSize: 10, fontFamily: "monospace", color: "#F0F4FF", outline: "none", minWidth: 0 }} />
              <button onClick={handleCustomToken} disabled={customLoading} style={{ padding: "5px 8px", borderRadius: 6, background: `${accentColor}18`, border: `1px solid ${accentColor}33`, color: accentColor, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
                {customLoading ? "..." : "Add"}
              </button>
            </div>
            {customError && <div style={{ fontSize: 9, color: "#F87171", marginTop: 3 }}>{customError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function WidgetInner() {
  const params = useSearchParams();
  const accentColor = params.get("accent") ?? "#6366F1";
  const theme = params.get("theme") ?? "dark";
  const hideBranding = params.get("hideBranding") === "true";

  const isDark = theme !== "light";
  const bg = isDark ? "#04060E" : "#F8FAFF";
  const cardBg = isDark ? "rgba(10,12,22,0.98)" : "#FFFFFF";
  const boxBg = isDark ? "rgba(4,6,14,0.8)" : "#F3F6FF";
  const textPrimary = isDark ? "#EEF2FF" : "#0D1117";
  const textSecondary = isDark ? "#6B7FA3" : "#6B7FA3";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  const { address } = useAccount();
  const [fromChain, setFromChain] = useState(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain] = useState(SUPPORTED_CHAINS[1]);
  const [fromToken, setFromToken] = useState(SUPPORTED_TOKENS[1][0]);
  const [toToken, setToToken] = useState(SUPPORTED_TOKENS[137][0]);
  const [amount, setAmount] = useState("");
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [slippage, setSlippage] = useState(5);
  const [showSlippage, setShowSlippage] = useState(false);
  const [fromTokenUnverified, setFromTokenUnverified] = useState(false);
  const [toTokenUnverified, setToTokenUnverified] = useState(false);
  const slippageRef = useRef<HTMLDivElement>(null!);
  const swap = useSwapExecution();

  useOutsideClick(slippageRef, () => setShowSlippage(false));

  const isNativeToken = fromToken.address === "0x0000000000000000000000000000000000000000";
  const { data: balanceData } = useBalance({
    address,
    token: isNativeToken ? undefined : fromToken.address as `0x${string}`,
    chainId: fromChain.id,
  });

  const fromTokens = SUPPORTED_TOKENS[fromChain.id] ?? [];
  const toTokens = SUPPORTED_TOKENS[toChain.id] ?? [];
  const reset = () => { setRoutes([]); setSelectedRoute(null); };

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
      if (result.length === 0) setError("No routes found.");
      else { setRoutes(result); setSelectedRoute(result[0]); }
    } catch (e: any) { setError(e?.message ?? "Could not fetch routes."); }
    finally { setLoading(false); }
  };

  const fmt = (raw: string, dec: number) => { try { return parseFloat(ethers.formatUnits(raw, dec)).toFixed(4); } catch { return "—"; } };
  const fmtTime = (s: number) => s < 60 ? `~${s}s` : `~${Math.ceil(s / 60)}m`;

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}} />

      {/* Nav with back button */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: isDark ? "rgba(4,6,14,0.95)" : "rgba(248,250,255,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${border}`, padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textSecondary, fontWeight: 500 }}>
          ← Back
        </Link>
        <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, fontFamily: "'Space Grotesk',sans-serif" }}>
          MULTI<span style={{ color: accentColor }}>MESH</span>
          <span style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", marginLeft: 6, letterSpacing: 1 }}>WIDGET DEMO</span>
        </div>
        <Link href="/docs" style={{ textDecoration: "none", fontSize: 12, color: accentColor, fontWeight: 600 }}>
          Docs →
        </Link>
      </div>

      {/* Execution modals */}
      {swap.step !== "idle" && swap.step !== "done" && swap.step !== "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#EEF2FF", marginBottom: 12 }}>Executing Swap</div>
            <div style={{ fontSize: 12, color: "#6B7FA3", fontFamily: "monospace" }}>
              {swap.step === "approving" && "Approve token in wallet..."}
              {swap.step === "waiting-approval" && "Waiting for approval..."}
              {swap.step === "sending" && "Confirm swap in wallet..."}
              {swap.step === "waiting-tx" && "Waiting for confirmation..."}
              {swap.step === "polling" && "Bridge transfer in progress..."}
            </div>
          </div>
        </div>
      )}

      {swap.step === "done" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0A0C16", border: `1px solid ${accentColor}44`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, marginBottom: 8 }}>Swap Complete ✓</div>
            {swap.explorerLink && <a href={swap.explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: accentColor, fontFamily: "monospace" }}>View on LI.FI Explorer ↗</a>}
            <button onClick={swap.reset} style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 10, background: "transparent", color: accentColor, border: `1px solid ${accentColor}44`, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {swap.step === "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0A0C16", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F87171", marginBottom: 8 }}>Swap Failed</div>
            {swap.error && <div style={{ fontSize: 11, fontFamily: "monospace", color: "#6B7FA3", marginBottom: 14, lineHeight: 1.5 }}>{swap.error}</div>}
            <button onClick={swap.reset} style={{ width: "100%", padding: 12, borderRadius: 10, background: "transparent", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Try Again</button>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 400, marginTop: 52 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          {!hideBranding && (
            <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, fontFamily: "'Space Grotesk',sans-serif" }}>
              MULTI<span style={{ color: accentColor }}>MESH</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: hideBranding ? "auto" : 0 }}>
            <div ref={slippageRef} style={{ position: "relative" }}>
              <button onClick={() => setShowSlippage(s => !s)} style={{ padding: "4px 8px", borderRadius: 7, background: showSlippage ? `${accentColor}15` : "rgba(255,255,255,0.04)", border: `1px solid ${showSlippage ? accentColor + "33" : border}`, color: slippage !== 5 ? accentColor : textSecondary, fontSize: 10, fontFamily: "monospace", cursor: "pointer" }}>
                ⚙ {slippage}%
              </button>
              {showSlippage && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, zIndex: 150, width: 200, boxShadow: "0 12px 32px rgba(0,0,0,0.6)" }}>
                  <div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 8 }}>SLIPPAGE</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {SLIPPAGE_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setSlippage(opt)}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 6, background: slippage === opt ? `${accentColor}22` : "rgba(255,255,255,0.04)", border: slippage === opt ? `1px solid ${accentColor}55` : "1px solid rgba(255,255,255,0.07)", color: slippage === opt ? accentColor : "#A0B0C8", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                        {opt}%
                      </button>
                    ))}
                  </div>
                  <input placeholder="Custom %" onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0 && v <= 50) setSlippage(v); }}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 10, fontFamily: "monospace", color: "#F0F4FF", outline: "none" }} />
                </div>
              )}
            </div>
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>
        </div>

        {/* Swap Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 18, padding: "12px 11px", backdropFilter: "blur(20px)", boxShadow: isDark ? `0 0 0 1px ${accentColor}08, 0 20px 48px rgba(0,0,0,0.5)` : "0 4px 24px rgba(0,0,0,0.08)" }}>

          <div style={{ background: boxBg, border: `1px solid ${border}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: textSecondary, fontFamily: "monospace", letterSpacing: 1.5 }}>FROM</span>
              <ChainDropdown value={fromChain} onChange={c => { setFromChain(c); setFromToken(SUPPORTED_TOKENS[c.id][0]); reset(); }} accentColor={accentColor} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" placeholder="0.00" value={amount} onChange={e => { setAmount(e.target.value); reset(); }}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 22, fontWeight: 700, color: textPrimary, fontFamily: "'DM Sans', sans-serif", minWidth: 0 }} />
              <TokenDropdown value={fromToken} tokens={fromTokens} onChange={t => { setFromToken(t); setFromTokenUnverified(!SUPPORTED_TOKENS[fromChain.id]?.find(x => x.address === t.address)); reset(); }} chainId={fromChain.id} accentColor={accentColor} />
            </div>
            {address && balanceData && (
              <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: textSecondary }}>Balance:</span>
                <button onClick={() => setAmount(parseFloat(balanceData.formatted).toFixed(6))} style={{ fontSize: 10, fontFamily: "monospace", color: accentColor, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
            <button onClick={switchChains} style={{ width: 30, height: 30, borderRadius: 9, background: boxBg, border: `1px solid ${border}`, color: textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⇅</button>
          </div>

          <div style={{ background: boxBg, border: `1px solid ${border}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: textSecondary, fontFamily: "monospace", letterSpacing: 1.5 }}>TO</span>
              <ChainDropdown value={toChain} onChange={c => { setToChain(c); setToToken(SUPPORTED_TOKENS[c.id][0]); reset(); }} accentColor={accentColor} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, fontSize: 22, fontWeight: 700, color: selectedRoute ? accentColor : (isDark ? "#1C2A3A" : "#C8D4F0") }}>
                {selectedRoute ? fmt(selectedRoute.toAmount, toToken.decimals) : "0.00"}
              </div>
              <TokenDropdown value={toToken} tokens={toTokens} onChange={t => { setToToken(t); setToTokenUnverified(!SUPPORTED_TOKENS[toChain.id]?.find(x => x.address === t.address)); reset(); }} chainId={toChain.id} accentColor={accentColor} />
            </div>
            {selectedRoute && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${border}`, display: "flex", gap: 12 }}>
                {[["FEE", `$${parseFloat(selectedRoute.gasCostUSD || "0").toFixed(2)}`], ["TIME", fmtTime(selectedRoute.executionDuration)], ["RISK", getRiskLabel(selectedRoute.tags).label]].map(([l, v], i) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: textSecondary, letterSpacing: 1 }}>{l}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: i === 2 ? getRiskLabel(selectedRoute.tags).color : (isDark ? "#A0B0C8" : "#4A5568"), marginTop: 1 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={findRoutes} disabled={loading || !amount}
            style={{ width: "100%", padding: 13, borderRadius: 12, background: loading || !amount ? (isDark ? "#0D1020" : "#E8EEF8") : accentColor, color: loading || !amount ? (isDark ? "#2D3A50" : "#8899BB") : "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: loading || !amount ? "not-allowed" : "pointer", marginTop: 8 }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Scanning...
              </div>
            ) : "Find Best Route"}
          </button>

          {(fromTokenUnverified || toTokenUnverified) && (
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#F59E0B", padding: "6px 10px", background: "rgba(245,158,11,0.06)", borderRadius: 7, marginTop: 6 }}>
              ⚠ Unverified token — verify contract before swapping.
            </div>
          )}
          {error && <div style={{ fontSize: 11, fontFamily: "monospace", color: "#F87171", textAlign: "center", padding: 8, background: "rgba(239,68,68,0.06)", borderRadius: 8, marginTop: 6 }}>{error}</div>}

          {!loading && routes.length > 0 && (
            <button onClick={() => { if (address && selectedRoute) { swap.execute(selectedRoute); } }}
              style={{ width: "100%", padding: 13, borderRadius: 12, background: accentColor, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}>
              {address ? "Swap Now" : "Connect Wallet to Swap"}
            </button>
          )}
        </div>

        {!hideBranding && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, fontFamily: "monospace", color: isDark ? "#2D3A50" : "#B0BEC5" }}>
            Powered by <a href="https://themultimesh.com" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: "none" }}>MultiMesh</a> · LI.FI
          </div>
        )}
      </div>
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div style={{ background: "#04060E", minHeight: "100vh" }} />}>
      <WidgetInner />
    </Suspense>
  );
}