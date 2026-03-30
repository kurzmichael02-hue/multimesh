"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { getRefuelQuote, CHAIN_GAS_SYMBOL, MIN_GAS_USD } from "@/lib/lifi";
import { ethers } from "ethers";

const CHAINS = [
  { id: 1,     name: "Ethereum",  logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: 137,   name: "Polygon",   logo: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
  { id: 56,    name: "BNB Chain", logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: 42161, name: "Arbitrum",  logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
  { id: 10,    name: "Optimism",  logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
  { id: 8453,  name: "Base",      logo: "https://assets.coingecko.com/coins/images/35506/small/base.png" },
];

function Img({ src, size = 24 }: { src: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#1C2333", flexShrink: 0 }} />;
  return <img src={src} width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} onError={() => setErr(true)} />;
}

export default function RefuelPage() {
  const { address } = useAccount();
  const swap = useSwapExecution();
  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [toChain, setToChain] = useState(CHAINS[2]);
  const [amount, setAmount] = useState("0.002");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const gasSymbol = CHAIN_GAS_SYMBOL[toChain.id] ?? "ETH";
  const minUSD = MIN_GAS_USD[toChain.id] ?? 0.20;

  const fetchQuote = async () => {
    if (!address || !amount) return;
    setLoading(true); setError(""); setQuote(null);
    try {
      const amountWei = ethers.parseEther(amount).toString();
      const q = await getRefuelQuote({
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        fromAddress: address,
        toAddress: address,
        fromAmount: amountWei,
      });
      if (!q) throw new Error("No refuel route found");
      setQuote(q);
    } catch (e: any) {
      setError(e?.message ?? "Could not find a refuel route");
    }
    setLoading(false);
  };

  const executeRefuel = async () => {
    if (!quote) return;
    swap.execute(quote);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060810", fontFamily: "'DM Sans', sans-serif", color: "#F0F4FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <style>{`@keyframes mmSpin{to{transform:rotate(360deg)}} * { box-sizing: border-box; }`}</style>

      {/* Execution modals */}
      {swap.step !== "idle" && swap.step !== "done" && swap.step !== "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 12 }}>Sending Gas...</div>
            <div style={{ fontSize: 12, color: "#A0B0C8", fontFamily: "monospace" }}>
              {swap.step === "sending" && "Confirm in wallet..."}
              {swap.step === "waiting-tx" && "Waiting for confirmation..."}
              {swap.step === "polling" && "Bridging gas to destination..."}
            </div>
          </div>
        </div>
      )}

      {swap.step === "done" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0D1117", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#00E5FF", marginBottom: 8 }}>⚡ Gas Sent!</div>
            <div style={{ fontSize: 13, color: "#A0B0C8", marginBottom: 16 }}>{gasSymbol} is on its way to {toChain.name}.</div>
            {swap.explorerLink && <a href={swap.explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#00E5FF", fontFamily: "monospace" }}>View on LI.FI Explorer ↗</a>}
            <button onClick={swap.reset} style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 10, background: "transparent", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.3)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {swap.step === "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0D1117", border: "1px solid rgba(252,129,129,0.3)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FC8181", marginBottom: 8 }}>Refuel Failed</div>
            {swap.error && <div style={{ fontSize: 11, fontFamily: "monospace", color: "#A0B0C8", marginBottom: 14 }}>{swap.error}</div>}
            <button onClick={swap.reset} style={{ width: "100%", padding: 12, borderRadius: 10, background: "transparent", color: "#FC8181", border: "1px solid rgba(252,129,129,0.3)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Try Again</button>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 16, fontWeight: 700, color: "#F0F4FF", textDecoration: "none" }}>
            MULTI<span style={{ color: "#00E5FF" }}>MESH</span>
          </a>
          <ConnectButton chainStatus="none" showBalance={false} />
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>Gas Refuel</div>
          <div style={{ fontSize: 14, color: "#6B7FA3", lineHeight: 1.6 }}>
            Stuck on a chain without gas? Bridge native tokens in one click.
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(13,17,23,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20 }}>

          {/* From */}
          <div style={{ background: "rgba(6,8,16,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1.5, marginBottom: 10 }}>FROM</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setQuote(null); }}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 22, fontWeight: 700, color: "#F0F4FF" }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {CHAINS.map(c => (
                  <button key={c.id} onClick={() => { setFromChain(c); setQuote(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 8, background: fromChain.id === c.id ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)", border: fromChain.id === c.id ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                    <Img src={c.logo} size={16} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: fromChain.id === c.id ? "#00E5FF" : "#6B7FA3" }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: "center", padding: "4px 0", fontSize: 18, color: "#3D4F6B" }}>↓</div>

          {/* To */}
          <div style={{ background: "rgba(6,8,16,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1.5, marginBottom: 10 }}>TO (DESTINATION CHAIN)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CHAINS.filter(c => c.id !== fromChain.id).map(c => (
                <button key={c.id} onClick={() => { setToChain(c); setQuote(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 9, background: toChain.id === c.id ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)", border: toChain.id === c.id ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                  <Img src={c.logo} size={18} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: toChain.id === c.id ? "#00E5FF" : "#A0B0C8" }}>{c.name}</span>
                </button>
              ))}
            </div>
            {toChain && (
              <div style={{ marginTop: 10, fontSize: 11, fontFamily: "monospace", color: "#3D4F6B" }}>
                Min recommended: ~${minUSD} of {gasSymbol}
              </div>
            )}
          </div>

          {/* Quote info */}
          {quote && (
            <div style={{ padding: "10px 14px", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>YOU RECEIVE</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "#00E5FF", marginTop: 2 }}>
                    ~{parseFloat(ethers.formatEther(quote.toAmount ?? "0")).toFixed(4)} {gasSymbol}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>TIME</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>
                    {quote.executionDuration < 60 ? `~${quote.executionDuration}s` : `~${Math.ceil(quote.executionDuration / 60)}m`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1 }}>BRIDGE FEE</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>
                    ${parseFloat(quote.gasCostUSD ?? "0").toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#FC8181", padding: "8px 12px", background: "rgba(252,129,129,0.06)", borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* Button */}
          {!address ? (
            <div style={{ display: "flex", justifyContent: "center" }}><ConnectButton /></div>
          ) : !quote ? (
            <button onClick={fetchQuote} disabled={loading || !amount}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: loading || !amount ? "#0D1520" : "#00E5FF", color: loading || !amount ? "#2D3F52" : "#060810", border: "none", fontWeight: 700, fontSize: 14, cursor: loading || !amount ? "not-allowed" : "pointer" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(6,8,16,0.3)", borderTopColor: "#060810", borderRadius: "50%", animation: "mmSpin 0.7s linear infinite" }} />
                  Finding Route...
                </div>
              ) : "Get Refuel Quote"}
            </button>
          ) : (
            <button onClick={executeRefuel}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              ⚡ Send Gas to {toChain.name}
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, fontFamily: "monospace", color: "#1C2A3A" }}>
          Powered by MultiMesh · <a href="/" style={{ color: "#3D4F6B", textDecoration: "none" }}>Back to App</a>
        </div>
      </div>
    </div>
  );
}