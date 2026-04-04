"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const supabase = createClient(
  "https://fommgavmoligvesyxbmx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW1nYXZtb2xpZ3Zlc3l4Ym14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjg5NzQsImV4cCI6MjA4ODY0NDk3NH0.0-7VmvjoqXUYQ2AoMFCgiJEI7X9xYxN0DAG2KrkOk0w"
);

const CHAIN_NAMES: Record<string, string> = {
  "1": "Ethereum", "137": "Polygon", "56": "BNB Chain",
  "42161": "Arbitrum", "10": "Optimism", "8453": "Base",
};

interface Stats {
  totalSwaps: number;
  uniqueWallets: number;
  totalVolumeUSD: number;
  totalFeesUSD: number;
  totalPointsIssued: number;
  totalReferrals: number;
  totalLimitOrders: number;
  topRoutes: { from_chain: string; to_chain: string; count: number }[];
  recentSwaps: { wallet: string; from_chain: string; to_chain: string; amount_usd: number; created_at: string }[];
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px" }}>
      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: accent ?? "#EEF2FF", letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#4B5A72", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function fmt(n: number, decimals = 2) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(decimals)}`;
}

function fmtTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function shortWallet(w: string) {
  return `${w.slice(0, 6)}...${w.slice(-4)}`;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [swapsRes, referralsRes, limitOrdersRes, routesRes, recentRes] = await Promise.all([
        supabase.from("mm_swaps").select("wallet, amount_usd, fee_usd, points, created_at").neq("from_chain", "referral"),
        supabase.from("mm_referrals").select("id", { count: "exact" }),
        supabase.from("mm_limit_orders").select("id", { count: "exact" }),
        supabase.from("mm_swaps").select("from_chain, to_chain").neq("from_chain", "referral"),
        supabase.from("mm_swaps").select("wallet, from_chain, to_chain, amount_usd, created_at").neq("from_chain", "referral").order("created_at", { ascending: false }).limit(10),
      ]);

      const swaps = swapsRes.data ?? [];
      const totalSwaps = swaps.length;
      const uniqueWallets = new Set(swaps.map((s: any) => s.wallet)).size;
      const totalVolumeUSD = swaps.reduce((a: number, s: any) => a + parseFloat(s.amount_usd ?? 0), 0);
      const totalFeesUSD = totalVolumeUSD * 0.0015;
      const totalPointsIssued = swaps.reduce((a: number, s: any) => a + (s.points ?? 0), 0);

      // Aggregate routes
      const routeMap: Record<string, number> = {};
      (routesRes.data ?? []).forEach((r: any) => {
        const key = `${r.from_chain}|${r.to_chain}`;
        routeMap[key] = (routeMap[key] ?? 0) + 1;
      });
      const topRoutes = Object.entries(routeMap)
        .map(([k, count]) => { const [from_chain, to_chain] = k.split("|"); return { from_chain, to_chain, count }; })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalSwaps,
        uniqueWallets,
        totalVolumeUSD,
        totalFeesUSD,
        totalPointsIssued,
        totalReferrals: referralsRes.count ?? 0,
        totalLimitOrders: limitOrdersRes.count ?? 0,
        topRoutes,
        recentSwaps: recentRes.data ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#04060E", fontFamily: "'DM Sans', sans-serif", color: "#EEF2FF" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .skeleton { background: rgba(255,255,255,0.04); border-radius: 8px; animation: pulse 1.5s infinite; }
      `}} />

      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)", backgroundSize: "72px 72px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -300, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 65%)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(4,6,14,0.95)", backdropFilter: "blur(12px)", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.jpg" width={36} height={36} style={{ borderRadius: "50%", mixBlendMode: "screen" }} />
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: "#EEF2FF" }}>MULTI<span style={{ color: "#818CF8" }}>MESH</span></span>
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[{ href: "/", label: "Swap" }, { href: "/limit-orders", label: "Limit Orders" }, { href: "/points", label: "Points ✦" }, { href: "/analytics", label: "Analytics" }].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 500, color: href === "/analytics" ? "#818CF8" : "#6B7FA3", textDecoration: "none" }}>{label}</Link>
          ))}
          <ConnectButton chainStatus="none" showBalance={false} />
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px 100px", position: "relative", zIndex: 1 }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "4px 14px", marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#818CF8", letterSpacing: 0.5 }}>Live · Updates in real-time</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -1, margin: "0 0 8px" }}>Protocol Analytics</h1>
          <p style={{ fontSize: 13, color: "#6B7FA3" }}>All swap activity on MultiMesh — transparent and on-chain.</p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
              <StatCard label="TOTAL SWAPS" value={String(stats!.totalSwaps)} sub="On mainnet" />
              <StatCard label="UNIQUE WALLETS" value={String(stats!.uniqueWallets)} sub="Connected users" accent="#818CF8" />
              <StatCard label="TOTAL VOLUME" value={fmt(stats!.totalVolumeUSD)} sub="USD equivalent" accent="#22C55E" />
              <StatCard label="PROTOCOL FEES" value={`$${stats!.totalFeesUSD.toFixed(2)}`} sub="0.15% per swap" accent="#F59E0B" />
              <StatCard label="POINTS ISSUED" value={stats!.totalPointsIssued.toLocaleString()} sub="To early users" accent="#818CF8" />
              <StatCard label="REFERRALS" value={String(stats!.totalReferrals)} sub="Active codes" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
              {/* Top Routes */}
              <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 16 }}>TOP ROUTES</div>
                {stats!.topRoutes.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#4B5A72", textAlign: "center", padding: "24px 0" }}>No swaps yet — be the first!</div>
                ) : stats!.topRoutes.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < stats!.topRoutes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize: 13, color: "#EEF2FF" }}>
                      {CHAIN_NAMES[r.from_chain] ?? r.from_chain} → {CHAIN_NAMES[r.to_chain] ?? r.to_chain}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "#818CF8", background: "rgba(99,102,241,0.1)", padding: "2px 8px", borderRadius: 6 }}>{r.count}x</span>
                  </div>
                ))}
              </div>

              {/* Protocol Info */}
              <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 16 }}>PROTOCOL INFO</div>
                {[
                  { label: "Supported Chains", value: "6" },
                  { label: "Bridges & DEXes", value: "20+" },
                  { label: "Protocol Fee", value: "0.15%" },
                  { label: "Limit Orders", value: String(stats!.totalLimitOrders) },
                  { label: "Status", value: "Beta Mainnet" },
                  { label: "Treasury", value: "2-of-2 Safe" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: 8 }}>
  <span style={{ fontSize: 12, color: "#6B7FA3", flexShrink: 0 }}>{label}</span>
  <span style={{ fontSize: 12, fontWeight: 600, color: "#EEF2FF", fontFamily: "monospace", textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Swaps */}
            <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5 }}>RECENT SWAPS</div>
              </div>
              {stats!.recentSwaps.length === 0 ? (
                <div style={{ fontSize: 13, color: "#4B5A72", textAlign: "center", padding: "40px 0" }}>
                  No swaps yet — go to <Link href="/" style={{ color: "#818CF8", textDecoration: "none" }}>themultimesh.com</Link> and be the first!
                </div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 70px 90px", padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {["Wallet", "Route", "Volume", "Time"].map(h => (
                      <div key={h} style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>{h}</div>
                    ))}
                  </div>
                  {stats!.recentSwaps.map((s: any, i: number) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 70px 90px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#818CF8" }}>{shortWallet(s.wallet)}</span>
                      <span style={{ fontSize: 12, color: "#EEF2FF" }}>{CHAIN_NAMES[s.from_chain] ?? s.from_chain} → {CHAIN_NAMES[s.to_chain] ?? s.to_chain}</span>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#22C55E" }}>{fmt(parseFloat(s.amount_usd ?? 0))}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72" }}>{fmtTime(s.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: 12, fontSize: 12, color: "#6B7FA3", lineHeight: 1.6, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span>All data sourced from on-chain transactions and Supabase. Treasury: <span style={{ fontFamily: "monospace", color: "#818CF8" }}>0x4070...e28A8</span></span>
              <a href="https://github.com/kurzmichael02-hue/multimesh" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#818CF8", textDecoration: "none" }}>View Source ↗</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}