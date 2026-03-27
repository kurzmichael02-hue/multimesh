"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, Token } from "@/lib/wagmi";
import { getRoutes, getRiskLabel, RouteResult } from "@/lib/lifi";
import { ethers } from "ethers";

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

  const fromTokens = SUPPORTED_TOKENS[fromChain.id] ?? [];
  const toTokens   = SUPPORTED_TOKENS[toChain.id]   ?? [];

  const switchChains = () => {
    const tmp = fromChain; setFromChain(toChain); setToChain(tmp);
    setFromToken(toTokens[0]); setToToken(fromTokens[0]);
    setRoutes([]); setSelectedRoute(null);
  };

  const findRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true); setError(""); setRoutes([]); setSelectedRoute(null);
    try {
      const decimals = fromToken.decimals;
      const fromAmount = ethers.parseUnits(amount, decimals).toString();
      const result = await getRoutes({
        fromChainId: fromChain.id, toChainId: toChain.id,
        fromTokenAddress: fromToken.address, toTokenAddress: toToken.address,
        fromAmount, fromAddress: address,
      });
      if (result.length === 0) { setError("No routes found. Try a different amount or token pair."); }
      else { setRoutes(result); setSelectedRoute(result[0]); }
    } catch (e) {
      setError("Could not fetch routes. Check your connection and try again.");
    } finally { setLoading(false); }
  };

  const formatAmount = (raw: string, decimals: number) => {
    try { return parseFloat(ethers.formatUnits(raw, decimals)).toFixed(6); }
    catch { return "—"; }
  };

  const formatTime = (secs: number) => {
    if (secs < 60) return `~${secs}s`;
    return `~${Math.ceil(secs / 60)}m`;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-800 text-mesh-text tracking-tight">
            MULTI<span className="text-mesh-accent">MESH</span>
          </h1>
          <p className="text-xs text-mesh-muted font-mono mt-0.5">Cross-Chain Swap Aggregator</p>
        </div>
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>

      {/* Swap Card */}
      <div className="glow-border rounded-2xl bg-mesh-surface p-5 space-y-3">

        {/* FROM */}
        <div className="bg-mesh-bg rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-mesh-muted uppercase tracking-widest">From</span>
            <ChainSelect chains={SUPPORTED_CHAINS} value={fromChain} onChange={(c) => { setFromChain(c); setFromToken(SUPPORTED_TOKENS[c.id][0]); setRoutes([]); }} />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number" placeholder="0.00" value={amount}
              onChange={(e) => { setAmount(e.target.value); setRoutes([]); }}
              className="flex-1 bg-transparent text-2xl font-display font-bold text-mesh-text outline-none placeholder:text-mesh-muted/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <TokenSelect tokens={fromTokens} value={fromToken} onChange={(t) => { setFromToken(t); setRoutes([]); }} />
          </div>
        </div>

        {/* SWITCH */}
        <div className="flex justify-center">
          <button onClick={switchChains}
            className="w-9 h-9 rounded-xl bg-mesh-border border border-mesh-border hover:border-mesh-accent/40 flex items-center justify-center text-mesh-muted hover:text-mesh-accent transition-all duration-200 font-mono text-sm">
            ⇅
          </button>
        </div>

        {/* TO */}
        <div className="bg-mesh-bg rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-mesh-muted uppercase tracking-widest">To</span>
            <ChainSelect chains={SUPPORTED_CHAINS} value={toChain} onChange={(c) => { setToChain(c); setToToken(SUPPORTED_TOKENS[c.id][0]); setRoutes([]); }} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-display font-bold text-mesh-accent/80">
              {selectedRoute ? formatAmount(selectedRoute.toAmount, toToken.decimals) : <span className="text-mesh-muted/30">0.00</span>}
            </div>
            <TokenSelect tokens={toTokens} value={toToken} onChange={(t) => { setToToken(t); setRoutes([]); }} />
          </div>
        </div>

        {/* FIND ROUTE BUTTON */}
        <button onClick={findRoutes} disabled={loading || !amount}
          className="w-full py-4 rounded-xl font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
            bg-mesh-accent text-mesh-bg hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] active:scale-[0.99]">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-mesh-bg/30 border-t-mesh-bg rounded-full animate-spin"/>
              Scanning Routes...
            </span>
          ) : "Find Best Route"}
        </button>

        {/* ERROR */}
        {error && (
          <div className="text-xs font-mono text-red-400/80 text-center py-2 px-3 bg-red-900/10 rounded-lg border border-red-900/20">
            {error}
          </div>
        )}
      </div>

      {/* ROUTES */}
      {routes.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-mono text-mesh-muted uppercase tracking-widest px-1">
            {routes.length} route{routes.length > 1 ? "s" : ""} found
          </p>
          {routes.slice(0, 3).map((route, i) => {
            const risk = getRiskLabel(route.tags);
            const isSelected = selectedRoute?.id === route.id;
            return (
              <button key={route.id} onClick={() => setSelectedRoute(route)}
                className={`w-full text-left rounded-xl p-4 border transition-all duration-200 ${
                  isSelected ? "border-mesh-accent/40 bg-mesh-surface shadow-[0_0_20px_rgba(0,229,255,0.07)]" : "border-mesh-border bg-mesh-surface hover:border-mesh-border/80"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-mesh-muted">{i === 0 ? "★ BEST" : `#${i + 1}`}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: risk.color, background: `${risk.color}15` }}>
                      {risk.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-mesh-muted">{formatTime(route.executionDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-mesh-text">{formatAmount(route.toAmount, toToken.decimals)} {toToken.symbol}</p>
                    <p className="text-xs font-mono text-mesh-muted mt-0.5">≈ ${parseFloat(route.toAmountUSD || "0").toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-mesh-muted">Gas</p>
                    <p className="text-xs font-mono text-mesh-text">${parseFloat(route.gasCostUSD || "0").toFixed(2)}</p>
                  </div>
                </div>
                {route.steps?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {route.steps.map((s, si) => (
                      <span key={si} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-mesh-border text-mesh-muted capitalize">
                        {s.tool}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Confirm CTA */}
      {selectedRoute && (
        <button className="w-full mt-3 py-4 rounded-xl font-display font-bold text-sm tracking-wider uppercase bg-mesh-accent/10 border border-mesh-accent/30 text-mesh-accent hover:bg-mesh-accent hover:text-mesh-bg transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]">
          {address ? "Confirm Swap" : "Connect Wallet to Swap"}
        </button>
      )}
    </div>
  );
}

function ChainSelect({ chains, value, onChange }: { chains: typeof SUPPORTED_CHAINS; value: typeof SUPPORTED_CHAINS[0]; onChange: (c: typeof SUPPORTED_CHAINS[0]) => void }) {
  return (
    <select value={value.id} onChange={(e) => onChange(chains.find(c => c.id === Number(e.target.value))!)}
      className="bg-mesh-border text-mesh-text text-xs font-mono rounded-lg px-2 py-1.5 border border-mesh-border/50 outline-none cursor-pointer hover:border-mesh-accent/30 transition-colors">
      {chains.map(c => <option key={c.id} value={c.id}>{c.logo} {c.name}</option>)}
    </select>
  );
}

function TokenSelect({ tokens, value, onChange }: { tokens: Token[]; value: Token; onChange: (t: Token) => void }) {
  return (
    <select value={value.address} onChange={(e) => onChange(tokens.find(t => t.address === e.target.value)!)}
      className="bg-mesh-border text-mesh-text text-sm font-display font-bold rounded-xl px-3 py-2 border border-mesh-border/50 outline-none cursor-pointer hover:border-mesh-accent/30 transition-colors min-w-[90px]">
      {tokens.map(t => <option key={t.address} value={t.address}>{t.logo} {t.symbol}</option>)}
    </select>
  );
}
