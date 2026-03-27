"use client";
import { useState } from "react";
import { RouteResult } from "@/lib/lifi";
import { ethers } from "ethers";
import { Token } from "@/lib/wagmi";

type TxStatus = "idle" | "pending" | "bridging" | "swapping" | "done" | "error";

interface TxSimProps {
  route: RouteResult;
  fromToken: Token;
  toToken: Token;
  amount: string;
  onClose: () => void;
}

const STATUS_STEPS: TxStatus[] = ["pending", "bridging", "swapping", "done"];

const STATUS_META: Record<string, { label: string; detail: string; color: string }> = {
  pending:  { label: "Waiting for confirmation", detail: "Confirm the transaction in your wallet", color: "#A0B0C8" },
  bridging: { label: "Bridging assets",          detail: "Moving your tokens across chains...",   color: "#7B61FF" },
  swapping: { label: "Swapping tokens",           detail: "Executing the swap on destination chain", color: "#F3BA2F" },
  done:     { label: "Transaction complete",      detail: "Your tokens have arrived",              color: "#00E5FF" },
  error:    { label: "Transaction failed",        detail: "Something went wrong. Please try again.", color: "#FC8181" },
};

export function TxSimulation({ route, fromToken, toToken, amount, onClose }: TxSimProps) {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [currentStep, setCurrentStep] = useState(0);

  const fmt = (raw: string, dec: number) => {
    try { return parseFloat(ethers.formatUnits(raw, dec)).toFixed(6); } catch { return "—"; }
  };

  const simulate = async () => {
    setStatus("pending");
    setCurrentStep(0);
    await delay(1800);
    setStatus("bridging");
    setCurrentStep(1);
    await delay(2400);
    setStatus("swapping");
    setCurrentStep(2);
    await delay(1800);
    setStatus("done");
    setCurrentStep(3);
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const meta = status !== "idle" ? STATUS_META[status] : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF", fontFamily: "'DM Sans', sans-serif" }}>Confirm Swap</span>
          {status === "idle" && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#3D4F6B", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* Swap Summary */}
        <div style={{ background: "rgba(6,8,16,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1, marginBottom: 4 }}>YOU SEND</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#F0F4FF", fontFamily: "'DM Sans', sans-serif" }}>{amount} {fromToken.symbol}</div>
            </div>
            <div style={{ fontSize: 22, color: "#3D4F6B" }}>→</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1, marginBottom: 4 }}>YOU RECEIVE</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#00E5FF", fontFamily: "'DM Sans', sans-serif" }}>{fmt(route.toAmount, toToken.decimals)} {toToken.symbol}</div>
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

        {/* Progress Steps */}
        {status !== "idle" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "0 8px" }}>
              {/* Line */}
              <div style={{ position: "absolute", top: 12, left: "calc(8px + 12px)", right: "calc(8px + 12px)", height: 2, background: "#1C2333", borderRadius: 2 }}>
                <div style={{ height: "100%", background: "#00E5FF", borderRadius: 2, transition: "width 0.6s ease", width: `${(currentStep / 3) * 100}%` }} />
              </div>
              {STATUS_STEPS.map((step, i) => {
                const done = i < currentStep || status === "done";
                const active = i === currentStep && status !== "done";
                return (
                  <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "#00E5FF" : active ? "#0D1117" : "#1C2333", border: active ? "2px solid #00E5FF" : done ? "none" : "2px solid #1C2333", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", flexShrink: 0 }}>
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#060810" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : active ? (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E5FF", animation: "pulse 1s ease-in-out infinite" }} />
                      ) : null}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: done ? "#00E5FF" : active ? "#A0B0C8" : "#3D4F6B", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                      {["Pending", "Bridging", "Swapping", "Done"][i]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Message */}
            {meta && (
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(6,8,16,0.6)", border: `1px solid ${meta.color}22`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                {status !== "done" && status !== "error" && (
                  <div style={{ width: 14, height: 14, border: `2px solid ${meta.color}44`, borderTopColor: meta.color, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                )}
                {status === "done" && <div style={{ color: "#00E5FF", fontSize: 14 }}>✓</div>}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: meta.color, fontFamily: "'DM Sans', sans-serif" }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "#3D4F6B", fontFamily: "monospace", marginTop: 2 }}>{meta.detail}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {status === "idle" && (
          <button onClick={simulate} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#00E5FF", color: "#060810", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Confirm & Swap
          </button>
        )}

        {status === "done" && (
          <button onClick={onClose} style={{ width: "100%", padding: 15, borderRadius: 14, background: "transparent", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Done
          </button>
        )}

        {status !== "idle" && status !== "done" && (
          <button disabled style={{ width: "100%", padding: 15, borderRadius: 14, background: "#0D1520", color: "#2D3F52", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "not-allowed" }}>
            Processing...
          </button>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}