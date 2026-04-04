"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SwapInterface } from "@/components/SwapInterface";

const STATS = [
  { label: "Supported Chains", value: "6", suffix: "" },
  { label: "Bridges & DEXes", value: "20", suffix: "+" },
  { label: "Protocol Fee", value: "0.15", suffix: "%" },
  { label: "Open Source", value: "100", suffix: "%" },
];

const FEATURES = [
  { icon: "⟁", title: "Cross-Chain Limit Orders", desc: "Set a target price and we execute when the market hits it — across any chain. No competitor offers this cross-chain.", tag: "UNIQUE" },
  { icon: "◎", title: "Best Route Engine", desc: "We scan 20+ bridges and DEXes simultaneously and pick the cheapest, fastest route — all in one transaction.", tag: null },
  { icon: "⬟", title: "Gas Refuel", desc: "Need ETH on Arbitrum? Bridge native gas tokens to any chain in one click — never get stranded without gas again.", tag: null },
  { icon: "◈", title: "Points & Referrals", desc: "Early users earn points on every swap. Refer friends and earn 25% more. Points convert at token launch.", tag: "OG REWARDS" },
  { icon: "⬡", title: "Widget Integration", desc: "Embed a full cross-chain swap interface in your app in 3 lines of code. Revenue share available for partners.", tag: "B2B" },
  { icon: "⟠", title: "Live Analytics", desc: "Full transparency — every swap, route, and fee is tracked on-chain and visible in our public analytics dashboard.", tag: null },
];

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function StatCard({ label, value, suffix, animate }: { label: string; value: string; suffix: string; animate: boolean }) {
  const num = parseFloat(value);
  const count = useCountUp(num * (suffix === "%" && num < 1 ? 100 : 1), 1200, animate);
  const display = suffix === "%" && num < 1 ? (count / 100).toFixed(2) : count.toString();
  return (
    <div style={{ padding: "24px 28px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 16, textAlign: "center", transition: "border-color 0.3s ease" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)")}>
      <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: "#EEF2FF", letterSpacing: -1 }}>{display}{suffix}</div>
      <div style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginTop: 6 }}>{label.toUpperCase()}</div>
    </div>
  );
}

export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const swapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#04060E", color: "#EEF2FF", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.25s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.4s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.55s ease both; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #04060E; }
        ::-webkit-scrollbar-thumb { background: #1A1F2E; border-radius: 2px; }
        .nav-links { display: flex; align-items: center; gap: 20px; }
        @media (max-width: 640px) { .nav-links { display: none !important; } }
      `}} />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "fixed", top: -300, left: "50%", transform: "translateX(-50%)", width: 1000, height: 800, background: "radial-gradient(ellipse,rgba(99,102,241,0.06) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(4,6,14,0.9)", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.jpg" width={36} height={36} style={{ borderRadius: "50%", background: "#fff" }} />
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>MULTI<span style={{ color: "#818CF8" }}>MESH</span></span>
          <span style={{ fontSize: 9, fontFamily: "monospace", color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "2px 6px", borderRadius: 4, letterSpacing: 1 }}>BETA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="nav-links">
            {[{ href: "/limit-orders", label: "Limit Orders" }, { href: "/points", label: "Points ✦" }, { href: "/analytics", label: "Analytics" }].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 500, color: "#6B7FA3", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#EEF2FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6B7FA3")}>{label}</Link>
            ))}
          </div>
          <ConnectButton chainStatus="none" showBalance={false} />
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px 60px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#818CF8", letterSpacing: 0.5 }}>Live on Mainnet · 6 Chains · 20+ Protocols</span>
        </div>
        <h1 className="fade-up-1" style={{ fontSize: "clamp(40px,7vw,80px)", fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -3, lineHeight: 1.05, textAlign: "center", margin: "0 0 20px", maxWidth: 900 }}>
          The best route across<span style={{ color: "#818CF8" }}> any chain</span>,<br />in one click.
        </h1>
        <p className="fade-up-2" style={{ fontSize: "clamp(14px,2vw,18px)", color: "#6B7FA3", textAlign: "center", maxWidth: 560, lineHeight: 1.7, margin: "0 0 40px" }}>
          MultiMesh scans 20+ bridges and DEXes simultaneously to find the cheapest, fastest route for your cross-chain swap — and executes it in one transaction.
        </p>
        <div className="fade-up-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => swapRef.current?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "14px 28px", borderRadius: 12, background: "#6366F1", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#4F46E5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#6366F1"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Start Swapping ↓
          </button>
          <Link href="/limit-orders" style={{ padding: "14px 28px", borderRadius: 12, background: "transparent", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)", fontWeight: 700, fontSize: 15, textDecoration: "none", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            Limit Orders →
          </Link>
        </div>
        <div className="fade-up-4" style={{ display: "flex", gap: 8, marginTop: 48, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>SUPPORTED</span>
          {["https://assets.coingecko.com/coins/images/279/small/ethereum.png","https://assets.coingecko.com/coins/images/4713/small/polygon.png","https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png","https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg","https://assets.coingecko.com/coins/images/25244/small/Optimism.png","https://assets.coingecko.com/coins/images/35506/small/base.png"].map((src, i) => (
            <img key={i} src={src} width={24} height={24} style={{ borderRadius: "50%", opacity: 0.7 }} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{ padding: "60px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {STATS.map(s => <StatCard key={s.label} {...s} animate={statsVisible} />)}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 2, marginBottom: 12 }}>WHAT WE BUILT</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -1, margin: 0 }}>
              Everything you need.<br /><span style={{ color: "#818CF8" }}>Nothing you don't.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: "24px", background: "rgba(10,12,22,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, position: "relative", overflow: "hidden", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(10,12,22,0.8)"; }}>
                {f.tag && <div style={{ position: "absolute", top: 16, right: 16, fontSize: 9, fontFamily: "monospace", color: "#818CF8", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", padding: "2px 7px", borderRadius: 4, letterSpacing: 1 }}>{f.tag}</div>}
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#6B7FA3", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swap */}
      <section ref={swapRef} id="swap" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", padding: "40px 20px 0" }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 2, marginBottom: 12 }}>START SWAPPING</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -1, margin: "0 0 8px" }}>Find the best route now</h2>
          <p style={{ color: "#6B7FA3", fontSize: 14, margin: 0 }}>Live on mainnet. Non-custodial. 0.15% fee.</p>
        </div>
        <SwapInterface />
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "48px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <img src="/logo.jpg" width={28} height={28} style={{ borderRadius: "50%", mixBlendMode: "screen" }} />
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>MULTI<span style={{ color: "#818CF8" }}>MESH</span></span>
            </div>
            <p style={{ fontSize: 12, color: "#4B5A72", margin: 0, maxWidth: 220, lineHeight: 1.6 }}>Cross-chain swap aggregator. Non-custodial, open source, live on mainnet.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <a href="https://twitter.com/MultiMeshXYZ" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", textDecoration: "none" }}>Twitter ↗</a>
              <a href="https://github.com/kurzmichael02-hue/multimesh" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", textDecoration: "none" }}>GitHub ↗</a>
            </div>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 14 }}>PRODUCT</div>
              {[{ href: "/limit-orders", label: "Limit Orders" }, { href: "/points", label: "Points" }, { href: "/analytics", label: "Analytics" }, { href: "/refuel", label: "Gas Refuel" }].map(({ href, label }) => (
                <div key={href} style={{ marginBottom: 8 }}><Link href={href} style={{ fontSize: 13, color: "#6B7FA3", textDecoration: "none" }}>{label}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 14 }}>DEVELOPERS</div>
              {[{ href: "/widget", label: "Widget" }, { href: "/docs", label: "Docs" }, { href: "https://github.com/kurzmichael02-hue/multimesh", label: "Source Code" }].map(({ href, label }) => (
                <div key={href} style={{ marginBottom: 8 }}><Link href={href} style={{ fontSize: 13, color: "#6B7FA3", textDecoration: "none" }}>{label}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1.5, marginBottom: 14 }}>LEGAL</div>
              {[{ href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms of Service" }].map(({ href, label }) => (
                <div key={href} style={{ marginBottom: 8 }}><Link href={href} style={{ fontSize: 13, color: "#6B7FA3", textDecoration: "none" }}>{label}</Link></div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#1A2030" }}>© 2026 MultiMesh. MIT License.</span>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#1A2030" }}>Treasury: 0x4070665b35b032A27413dd19BEB5C81b687e28A8</span>
        </div>
      </footer>
    </div>
  );
}