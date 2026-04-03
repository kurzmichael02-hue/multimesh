"use client";
import { useState } from "react";
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
  if (err) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#1A1F2E", flexShrink: 0 }} />;
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
      const q = await getRefuelQuote({ fromChainId: fromChain.id, toChainId: toChain.id, fromAddress: address, toAddress: address, fromAmount: amountWei });
      if (!q) throw new Error("No refuel route found");
      setQuote(q);
    } catch (e: any) { setError(e?.message ?? "Could not find a refuel route"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#04060E", fontFamily: "'DM Sans', sans-serif", color: "#EEF2FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .chain-btn { transition: all 0.15s; }
        .chain-btn:hover { border-color: rgba(99,102,241,0.4) !important; }
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
      `}} />

      {/* Modals */}
      {swap.step !== "idle" && swap.step !== "done" && swap.step !== "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Sending Gas...</div>
            <div style={{ fontSize: 12, color: "#6B7FA3", fontFamily: "monospace" }}>
              {swap.step === "sending" && "Confirm in wallet..."}
              {swap.step === "waiting-tx" && "Waiting for confirmation..."}
              {swap.step === "polling" && "Bridging to destination..."}
            </div>
          </div>
        </div>
      )}

      {swap.step === "done" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0A0C16", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#818CF8", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Gas Sent!</div>
            <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 16 }}>{gasSymbol} is on its way to {toChain.name}.</div>
            {swap.explorerLink && <a href={swap.explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#818CF8", fontFamily: "monospace" }}>View on LI.FI Explorer ↗</a>}
            <button onClick={swap.reset} style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 10, background: "transparent", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {swap.step === "failed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 360, background: "#0A0C16", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F87171", marginBottom: 8 }}>Refuel Failed</div>
            {swap.error && <div style={{ fontSize: 11, fontFamily: "monospace", color: "#6B7FA3", marginBottom: 14 }}>{swap.error}</div>}
            <button onClick={swap.reset} style={{ width: "100%", padding: 12, borderRadius: 10, background: "transparent", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Try Again</button>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.jpg" width={48} height={48} style={{ borderRadius: "50%", mixBlendMode: "screen", marginRight: 8 }} />
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#EEF2FF" }}>MULTI</span>
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#818CF8" }}>MESH</span>
          </a>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="/points" style={{ fontSize: 13, color: "#6B7FA3", textDecoration: "none" }}>Points</a>
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 2, marginBottom: 12 }}>GAS REFUEL</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -0.5, marginBottom: 10 }}>
            Stuck without gas?
          </h1>
          <p style={{ fontSize: 14, color: "#6B7FA3", lineHeight: 1.7 }}>
            Bridge native tokens to any chain in one click.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(10,12,22,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20 }}>

          {/* From */}
          <div style={{ background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 10 }}>FROM</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setQuote(null); }}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 22, fontWeight: 700, color: "#EEF2FF", fontFamily: "'DM Sans',sans-serif" }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {CHAINS.map(c => (
                  <button key={c.id} className="chain-btn" onClick={() => { setFromChain(c); setQuote(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 8, background: fromChain.id === c.id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: fromChain.id === c.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                    <Img src={c.logo} size={16} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: fromChain.id === c.id ? "#818CF8" : "#6B7FA3" }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "4px 0", fontSize: 18, color: "#4B5A72" }}>↓</div>

          {/* To */}
          <div style={{ background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 10 }}>TO</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CHAINS.filter(c => c.id !== fromChain.id).map(c => (
                <button key={c.id} className="chain-btn" onClick={() => { setToChain(c); setQuote(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 9, background: toChain.id === c.id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: toChain.id === c.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                  <Img src={c.logo} size={18} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: toChain.id === c.id ? "#818CF8" : "#A0B0C8" }}>{c.name}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, fontFamily: "monospace", color: "#4B5A72" }}>
              Min recommended: ~${minUSD} of {gasSymbol}
            </div>
          </div>

          {/* Quote */}
          {quote && (
            <div style={{ padding: "10px 14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>YOU RECEIVE</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "#818CF8", marginTop: 2 }}>
                    ~{parseFloat(ethers.formatEther(quote.toAmount ?? "0")).toFixed(4)} {gasSymbol}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>TIME</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>
                    {quote.executionDuration < 60 ? `~${quote.executionDuration}s` : `~${Math.ceil(quote.executionDuration / 60)}m`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>FEE</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "#A0B0C8", marginTop: 2 }}>
                    ${parseFloat(quote.gasCostUSD ?? "0").toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#F87171", padding: "8px 12px", background: "rgba(239,68,68,0.06)", borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {!address ? (
            <div style={{ display: "flex", justifyContent: "center" }}><ConnectButton /></div>
          ) : !quote ? (
            <button className="btn-primary" onClick={fetchQuote} disabled={loading || !amount}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: loading || !amount ? "#0D1020" : "#6366F1", color: loading || !amount ? "#2D3A50" : "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: loading || !amount ? "not-allowed" : "pointer" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Finding Route...
                </div>
              ) : "Get Refuel Quote"}
            </button>
          ) : (
            <button className="btn-primary" onClick={() => swap.execute(quote)}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: "#6366F1", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Send Gas to {toChain.name} →
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, fontFamily: "monospace", color: "#2D3A50" }}>
          Powered by MultiMesh · <a href="/" style={{ color: "#4B5A72", textDecoration: "none" }}>Back to App</a>
        </div>
      </div>
    </div>
  );
}