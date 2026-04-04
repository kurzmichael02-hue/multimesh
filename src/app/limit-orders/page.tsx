"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from "@/lib/wagmi";

const supabase = createClient(
  "https://fommgavmoligvesyxbmx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW1nYXZtb2xpZ3Zlc3l4Ym14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjg5NzQsImV4cCI6MjA4ODY0NDk3NH0.0-7VmvjoqXUYQ2AoMFCgiJEI7X9xYxN0DAG2KrkOk0w"
);

const DLN_CHAIN_MAP: Record<number, number> = {
  1: 1, 137: 137, 56: 56, 42161: 42161, 10: 10, 8453: 8453,
  999999: 7565164, // Solana
};

const SOLANA_CHAIN = { id: 999999, name: "Solana" };
const SOLANA_TOKENS = [
  { address: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana", decimals: 9 },
  { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin", decimals: 6 },
  { address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", symbol: "USDT", name: "Tether", decimals: 6 },
];

const CHAIN_LOGOS: Record<number, string> = {
  1:      "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  137:    "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  56:     "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  42161:  "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  10:     "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  8453:   "https://assets.coingecko.com/coins/images/35506/small/base.png",
  999999: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

interface LimitOrder {
  id: string; wallet: string; src_chain_id: number; dst_chain_id: number;
  src_token_symbol: string; dst_token_symbol: string; src_amount: string;
  dst_amount: string; status: string; tx_hash?: string; created_at: string;
}

interface DLNQuote {
  tx: { to: string; data: string; value: string; gasLimit?: string };
  estimation: {
    srcChainTokenIn: { amount: string; decimals: number; symbol: string };
    dstChainTokenOut: { amount: string; decimals: number; symbol: string; recommendedAmount: string };
  };
}

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

const ALL_CHAINS = [...SUPPORTED_CHAINS.filter(c => c.id !== 11155111), SOLANA_CHAIN];

function ChainSelect({ value, onChange, excludeSolana }: { value: number; onChange: (id: number) => void; excludeSolana?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));
  const chains = excludeSolana ? ALL_CHAINS.filter(c => c.id !== 999999) : ALL_CHAINS;
  const chain = chains.find(c => c.id === value);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 10px", cursor: "pointer" }}>
        <Img src={CHAIN_LOGOS[value]} size={16} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#A0B0C8" }}>{chain?.name}</span>
        <span style={{ fontSize: 8, color: "#4B5A72" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 100, minWidth: 160, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          {chains.map(c => (
            <button key={c.id} onClick={() => { onChange(c.id); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: c.id === value ? "rgba(99,102,241,0.08)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <Img src={CHAIN_LOGOS[c.id]} size={18} />
              <span style={{ fontSize: 13, fontWeight: 600, color: c.id === value ? "#818CF8" : "#E0EAF4" }}>{c.name}</span>
              {c.id === 999999 && <span style={{ fontSize: 9, fontFamily: "monospace", color: "#22C55E", background: "rgba(34,197,94,0.1)", padding: "1px 5px", borderRadius: 4 }}>NEW</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenSelect({ value, chainId, onChange }: { value: string; chainId: number; onChange: (addr: string, symbol: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  useOutsideClick(ref, () => setOpen(false));
  const tokens = chainId === 999999 ? SOLANA_TOKENS : (SUPPORTED_TOKENS[chainId] ?? []);
  const token = tokens.find(t => t.address === value) ?? tokens[0];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 10px", cursor: "pointer" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#EEF2FF" }}>{token?.symbol ?? "?"}</span>
        <span style={{ fontSize: 8, color: "#4B5A72" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#0A0C16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 100, minWidth: 160, boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
          {tokens.map(t => (
            <button key={t.address} onClick={() => { onChange(t.address, t.symbol); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: t.address === value ? "rgba(99,102,241,0.08)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.address === value ? "#818CF8" : "#EEF2FF" }}>{t.symbol}</div>
                <div style={{ fontSize: 10, color: "#4B5A72" }}>{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending:   { bg: "rgba(245,158,11,0.1)",  text: "#F59E0B" },
    filled:    { bg: "rgba(34,197,94,0.1)",   text: "#22C55E" },
    cancelled: { bg: "rgba(239,68,68,0.1)",   text: "#EF4444" },
    expired:   { bg: "rgba(107,114,128,0.1)", text: "#6B7280" },
  };
  const c = colors[status] ?? colors.pending;
  return <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 0.5, padding: "3px 8px", borderRadius: 6, background: c.bg, color: c.text }}>{status.toUpperCase()}</span>;
}

export default function LimitOrdersPage() {
  const { address } = useAccount();
  const [srcChain, setSrcChain] = useState(1);
  const [dstChain, setDstChain] = useState(137);
  const [srcToken, setSrcToken] = useState({ address: "0x0000000000000000000000000000000000000000", symbol: "ETH" });
  const [dstToken, setDstToken] = useState({ address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC" });
  const [srcAmount, setSrcAmount] = useState("");
  const [dstAmount, setDstAmount] = useState("");
  const [solanaAddress, setSolanaAddress] = useState("");
  const [quote, setQuote] = useState<DLNQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [tab, setTab] = useState<"create" | "my-orders">("create");

  const isSolanaDestination = dstChain === 999999;

  useEffect(() => { if (address) fetchOrders(); }, [address]);

  async function fetchOrders() {
    if (!address) return;
    setOrdersLoading(true);
    const { data } = await supabase.from("mm_limit_orders").select("*").ilike("wallet", address).order("created_at", { ascending: false }).limit(20);
    setOrders(data ?? []);
    setOrdersLoading(false);
  }

  function handleDstChainChange(id: number) {
    setDstChain(id);
    if (id === 999999) {
      setDstToken({ address: SOLANA_TOKENS[0].address, symbol: SOLANA_TOKENS[0].symbol });
    } else {
      setDstToken({ address: SUPPORTED_TOKENS[id][0].address, symbol: SUPPORTED_TOKENS[id][0].symbol });
    }
    setQuote(null);
  }

  async function getQuote() {
    if (!srcAmount || !address) return;
    if (isSolanaDestination && !solanaAddress) { setError("Please enter your Solana wallet address"); return; }
    setLoading(true); setError(""); setQuote(null);
    try {
      const srcDecimals = SUPPORTED_TOKENS[srcChain]?.find(t => t.address === srcToken.address)?.decimals ?? 18;
      const dstDecimals = isSolanaDestination
        ? (SOLANA_TOKENS.find(t => t.address === dstToken.address)?.decimals ?? 6)
        : (SUPPORTED_TOKENS[dstChain]?.find(t => t.address === dstToken.address)?.decimals ?? 18);

      const srcAmountWei = ethers.parseUnits(srcAmount, srcDecimals).toString();
      const dstAmountWei = dstAmount ? ethers.parseUnits(dstAmount, dstDecimals).toString() : undefined;
      const recipient = isSolanaDestination ? solanaAddress : address;

      const params = new URLSearchParams({
        srcChainId: String(DLN_CHAIN_MAP[srcChain]),
        srcChainTokenIn: srcToken.address,
        srcChainTokenInAmount: srcAmountWei,
        dstChainId: String(DLN_CHAIN_MAP[dstChain]),
        dstChainTokenOut: dstToken.address,
        dstChainTokenOutAmount: dstAmountWei ?? "auto",
        prependOperatingExpenses: "true",
        affiliateFeePercent: "0.15",
        affiliateFeeRecipient: "0x4070665b35b032A27413dd19BEB5C81b687e28A8",
        senderAddress: address,
        srcChainOrderAuthorityAddress: address,
        dstChainTokenOutRecipient: recipient,
        dstChainOrderAuthorityAddress: recipient,
        referralCode: "multimesh",
      });

      const res = await fetch(`https://dln.debridge.finance/v1.0/dln/order/create-tx?${params}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Could not get quote from deBridge");
      setQuote(data);
      if (!dstAmount && data.estimation?.dstChainTokenOut?.recommendedAmount) {
        setDstAmount(parseFloat(ethers.formatUnits(data.estimation.dstChainTokenOut.recommendedAmount, dstDecimals)).toFixed(4));
      }
    } catch (e: any) { setError(e?.message ?? "Failed to get quote"); }
    setLoading(false);
  }

  async function submitOrder() {
    if (!quote || !address) return;
    setSubmitting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: quote.tx.to, data: quote.tx.data,
        value: BigInt(quote.tx.value ?? "0"),
        gasLimit: quote.tx.gasLimit ? BigInt(quote.tx.gasLimit) : undefined,
      });
      await tx.wait();

      const srcDecimals = SUPPORTED_TOKENS[srcChain]?.find(t => t.address === srcToken.address)?.decimals ?? 18;
      const dstDecimals = isSolanaDestination
        ? (SOLANA_TOKENS.find(t => t.address === dstToken.address)?.decimals ?? 6)
        : (SUPPORTED_TOKENS[dstChain]?.find(t => t.address === dstToken.address)?.decimals ?? 18);

      await supabase.from("mm_limit_orders").insert({
        id: tx.hash, wallet: address,
        src_chain_id: srcChain, dst_chain_id: dstChain,
        src_token_address: srcToken.address, dst_token_address: dstToken.address,
        src_token_symbol: srcToken.symbol, dst_token_symbol: dstToken.symbol,
        src_amount: ethers.formatUnits(quote.estimation.srcChainTokenIn.amount, srcDecimals),
        dst_amount: ethers.formatUnits(quote.estimation.dstChainTokenOut.recommendedAmount, dstDecimals),
        status: "pending", tx_hash: tx.hash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setQuote(null); setSrcAmount(""); setDstAmount("");
      await fetchOrders(); setTab("my-orders");
    } catch (e: any) { setError(e?.message ?? "Transaction failed"); }
    setSubmitting(false);
  }

  const srcChainName = ALL_CHAINS.find(c => c.id === srcChain)?.name ?? "";
  const dstChainName = ALL_CHAINS.find(c => c.id === dstChain)?.name ?? "";

  return (
    <div style={{ minHeight: "100vh", background: "#04060E", fontFamily: "'DM Sans', sans-serif", color: "#EEF2FF" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .tab-btn { transition: all 0.15s; cursor: pointer; }
        .tab-btn:hover { border-color: rgba(99,102,241,0.3) !important; }
        .order-row:hover { background: rgba(99,102,241,0.03) !important; }
      `}} />

      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)", backgroundSize: "72px 72px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -300, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)", pointerEvents: "none" }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(4,6,14,0.95)", backdropFilter: "blur(12px)", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.jpg" width={36} height={36} style={{ borderRadius: "50%" }} />
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: "#EEF2FF" }}>MULTI<span style={{ color: "#818CF8" }}>MESH</span></span>
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[{ href: "/", label: "Swap" }, { href: "/limit-orders", label: "Limit Orders" }, { href: "/points", label: "Points ✦" }].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 500, color: href === "/limit-orders" ? "#818CF8" : "#6B7FA3", textDecoration: "none" }}>{label}</Link>
          ))}
          <ConnectButton chainStatus="none" showBalance={false} />
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "52px 20px 100px", position: "relative", zIndex: 1 }}>
        <div className="fade-in" style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "4px 14px", marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8" }} />
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#818CF8", letterSpacing: 0.5 }}>Powered by deBridge DLN · Now with Solana</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -1, lineHeight: 1.1, margin: "0 0 14px" }}>Cross-Chain Limit Orders</h1>
          <p style={{ fontSize: 14, color: "#6B7FA3", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Set your target price and we execute automatically — now supporting EVM ↔ Solana swaps.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["create", "my-orders"] as const).map(t => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)}
              style={{ padding: "8px 18px", borderRadius: 10, background: tab === t ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: tab === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)", color: tab === t ? "#818CF8" : "#6B7FA3", fontSize: 13, fontWeight: 600 }}>
              {t === "create" ? "Create Order" : `My Orders${orders.length > 0 ? ` (${orders.length})` : ""}`}
            </button>
          ))}
        </div>

        {tab === "create" && (
          <div className="fade-in">
            <div style={{ background: "rgba(10,12,22,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20 }}>

              {/* FROM */}
              <div style={{ background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: "#4B5A72", fontFamily: "monospace", letterSpacing: 1.5 }}>YOU SELL</span>
                  <ChainSelect excludeSolana value={srcChain} onChange={id => { setSrcChain(id); setSrcToken({ address: SUPPORTED_TOKENS[id][0].address, symbol: SUPPORTED_TOKENS[id][0].symbol }); setQuote(null); }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" placeholder="0.00" value={srcAmount} onChange={e => { setSrcAmount(e.target.value); setQuote(null); }}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 24, fontWeight: 700, color: "#EEF2FF", fontFamily: "'DM Sans',sans-serif", minWidth: 0 }} />
                  <TokenSelect value={srcToken.address} chainId={srcChain} onChange={(addr, sym) => { setSrcToken({ address: addr, symbol: sym }); setQuote(null); }} />
                </div>
              </div>

              <div style={{ textAlign: "center", padding: "4px 0", fontSize: 16, color: "#4B5A72" }}>↓</div>

              {/* TO */}
              <div style={{ background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: "#4B5A72", fontFamily: "monospace", letterSpacing: 1.5 }}>YOU WANT (minimum)</span>
                  <ChainSelect value={dstChain} onChange={handleDstChainChange} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" placeholder="0.00 (leave empty for market)" value={dstAmount} onChange={e => { setDstAmount(e.target.value); setQuote(null); }}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 24, fontWeight: 700, color: dstAmount ? "#818CF8" : "#2D3A50", fontFamily: "'DM Sans',sans-serif", minWidth: 0 }} />
                  <TokenSelect value={dstToken.address} chainId={dstChain} onChange={(addr, sym) => { setDstToken({ address: addr, symbol: sym }); setQuote(null); }} />
                </div>
                {isSolanaDestination && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 6 }}>YOUR SOLANA WALLET ADDRESS</div>
                    <input value={solanaAddress} onChange={e => setSolanaAddress(e.target.value)} placeholder="Enter your Solana address..."
                      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${solanaAddress ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "monospace", color: "#EEF2FF", outline: "none" }} />
                    <div style={{ fontSize: 10, color: "#4B5A72", marginTop: 4 }}>You need a Solana wallet (Phantom, Backpack) to receive tokens</div>
                  </div>
                )}
                {!isSolanaDestination && (
                  <div style={{ fontSize: 11, color: "#4B5A72", marginTop: 8 }}>Leave empty = market price · Set a number = limit order</div>
                )}
              </div>

              {quote && (
                <div style={{ padding: "12px 16px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 10 }}>ORDER SUMMARY</div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>SELL</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#EEF2FF", marginTop: 2 }}>{srcAmount} {srcToken.symbol}</div>
                      <div style={{ fontSize: 10, color: "#4B5A72", marginTop: 1 }}>{srcChainName}</div>
                    </div>
                    <div style={{ fontSize: 18, color: "#4B5A72" }}>→</div>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>RECEIVE (min)</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#818CF8", marginTop: 2 }}>
                        {dstAmount || parseFloat(ethers.formatUnits(quote.estimation.dstChainTokenOut.recommendedAmount, quote.estimation.dstChainTokenOut.decimals)).toFixed(6)} {dstToken.symbol}
                      </div>
                      <div style={{ fontSize: 10, color: "#4B5A72", marginTop: 1 }}>{dstChainName}</div>
                    </div>
                  </div>
                  {isSolanaDestination && (
                    <div style={{ marginTop: 10, fontSize: 11, color: "#22C55E", fontFamily: "monospace" }}>→ Solana: {solanaAddress.slice(0, 8)}...{solanaAddress.slice(-6)}</div>
                  )}
                  <div style={{ marginTop: 10, fontSize: 11, color: "#6B7FA3" }}>Order remains open until filled by a solver or cancelled. Max validity: 7 days.</div>
                </div>
              )}

              {error && (
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#F87171", padding: "8px 12px", background: "rgba(239,68,68,0.06)", borderRadius: 8, marginBottom: 12 }}>{error}</div>
              )}

              {!address ? (
                <div style={{ display: "flex", justifyContent: "center" }}><ConnectButton /></div>
              ) : !quote ? (
                <button onClick={getQuote} disabled={loading || !srcAmount}
                  style={{ width: "100%", padding: 14, borderRadius: 12, background: loading || !srcAmount ? "#0D1020" : "#6366F1", color: loading || !srcAmount ? "#2D3A50" : "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: loading || !srcAmount ? "not-allowed" : "pointer" }}>
                  {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Getting Quote...
                    </div>
                  ) : "Preview Order"}
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setQuote(null); setError(""); }} style={{ flex: 1, padding: 14, borderRadius: 12, background: "transparent", color: "#6B7FA3", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Edit</button>
                  <button onClick={submitOrder} disabled={submitting}
                    style={{ flex: 2, padding: 14, borderRadius: 12, background: submitting ? "#0D1020" : "#6366F1", color: submitting ? "#2D3A50" : "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Submitting...
                      </div>
                    ) : "Place Order"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: 12, fontSize: 12, color: "#6B7FA3", lineHeight: 1.6 }}>
              <strong style={{ color: "#818CF8" }}>How it works:</strong> Your order is submitted on-chain via deBridge DLN. Solvers compete to fill it at your price. EVM → Solana swaps are fully supported — you receive tokens directly to your Solana wallet.
            </div>
          </div>
        )}

        {tab === "my-orders" && (
          <div className="fade-in">
            {!address ? (
              <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Connect your wallet</div>
                <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 20 }}>Connect to see your limit orders.</div>
                <ConnectButton />
              </div>
            ) : ordersLoading ? (
              <div style={{ textAlign: "center", padding: 40, fontSize: 13, fontFamily: "monospace", color: "#4B5A72" }}>Loading...</div>
            ) : orders.length === 0 ? (
              <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No orders yet</div>
                <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 20 }}>Create your first cross-chain limit order.</div>
                <button onClick={() => setTab("create")} style={{ padding: "10px 22px", borderRadius: 10, background: "#6366F1", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Create Order →</button>
              </div>
            ) : (
              <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto" }}>
                  {["Order", "Route", "Status", ""].map(h => (
                    <div key={h} style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>{h}</div>
                  ))}
                </div>
                {orders.map(o => {
                  const srcName = ALL_CHAINS.find(c => c.id === o.src_chain_id)?.name ?? String(o.src_chain_id);
                  const dstName = ALL_CHAINS.find(c => c.id === o.dst_chain_id)?.name ?? String(o.dst_chain_id);
                  return (
                    <div key={o.id} className="order-row" style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "center", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#EEF2FF" }}>{parseFloat(o.src_amount).toFixed(4)} {o.src_token_symbol}</div>
                        <div style={{ fontSize: 11, color: "#818CF8", marginTop: 2 }}>→ {parseFloat(o.dst_amount).toFixed(4)} {o.dst_token_symbol}</div>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Img src={CHAIN_LOGOS[o.src_chain_id] ?? ""} size={14} />
                          <span style={{ fontSize: 11, color: "#A0B0C8" }}>{srcName}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                          <Img src={CHAIN_LOGOS[o.dst_chain_id] ?? ""} size={14} />
                          <span style={{ fontSize: 11, color: "#A0B0C8" }}>{dstName}</span>
                        </div>
                      </div>
                      <StatusBadge status={o.status} />
                      {o.tx_hash && (
                        <a href={`https://app.debridge.finance/order?orderId=${o.tx_hash}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 10, fontFamily: "monospace", color: "#818CF8", textDecoration: "none" }}>View ↗</a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}