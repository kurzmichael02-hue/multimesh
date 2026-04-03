"use client";
import { useState, useEffect, useRef } from "react";
import { SwapInterface } from "@/components/SwapInterface";

const FAQS = [
  { q: "What is MultiMesh?", a: "MultiMesh is a cross-chain swap aggregator. Connect your wallet, pick your tokens and chains, and we find the best route across 20+ bridges and DEXes — in one click." },
  { q: "Which chains are supported?", a: "Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, and Base. More chains coming." },
  { q: "How does routing work?", a: "We use LI.FI's engine which scans every available bridge and DEX simultaneously to find the optimal path based on output amount, fees, and execution time." },
  { q: "Is MultiMesh non-custodial?", a: "Yes. MultiMesh never touches your funds. All swaps execute directly between your wallet and smart contracts on-chain." },
  { q: "What fees does MultiMesh charge?", a: "0.15% protocol fee per swap, collected automatically. Network gas fees apply separately." },
  { q: "Can I swap any token?", a: "Any token with liquidity on a supported DEX. Paste any contract address into the token selector and we search for available routes." },
];

const CHAINS = [
  { name: "Ethereum", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { name: "Polygon",  logo: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
  { name: "BNB",      logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { name: "Arbitrum", logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
  { name: "Optimism", logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
  { name: "Base",     logo: "https://assets.coingecko.com/coins/images/35506/small/base.png" },
];

const STEPS = [
  { n: "01", title: "Connect Wallet", desc: "MetaMask, Phantom, WalletConnect — any EVM wallet works." },
  { n: "02", title: "Pick Your Tokens", desc: "Choose source and destination chain, any token pair." },
  { n: "03", title: "Find Best Route", desc: "We scan 20+ bridges and DEXes in real time." },
  { n: "04", title: "Confirm & Done", desc: "One transaction. Funds arrive on the destination chain." },
];

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cookieAccepted, setCookieAccepted] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
const ref = params.get("ref");
if (ref) localStorage.setItem("mm_referral_code", ref.toUpperCase());
    const consent = localStorage.getItem("mm_cookie_consent");
    if (!consent) setCookieAccepted(false);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("mm_cookie_consent", "true");
    setCookieAccepted(true);
  };

  if (showApp) return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowApp(false)} style={{
        position: "fixed", top: 52, left: 16, zIndex: 400,
        background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "6px 14px", color: "#A0B0C8",
        fontSize: 12, fontFamily: "monospace", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(10px)",
      }}>← Home</button>
      <SwapInterface />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#04060E", fontFamily: "'DM Sans', sans-serif", color: "#EEF2FF", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04060E; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.05); } }
        @keyframes scrollX { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-1 { animation-delay:0.1s; }
        .fade-up-2 { animation-delay:0.25s; }
        .fade-up-3 { animation-delay:0.4s; }
        .fade-up-4 { animation-delay:0.55s; }
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(99,102,241,0.4); }
        .btn-primary:active { transform:translateY(0); }
        .step-card { transition: border-color 0.2s, transform 0.2s; }
        .step-card:hover { border-color: rgba(99,102,241,0.3) !important; transform:translateY(-4px); }
        .faq-row { transition: background 0.15s; cursor:pointer; }
        .faq-row:hover { background: rgba(255,255,255,0.03) !important; }
        .nav-link { transition: color 0.15s; color: #6B7FA3; text-decoration:none; font-size:14px; font-weight:500; }
        .nav-link:hover { color: #EEF2FF; }
        .chain-badge { transition: all 0.2s; }
        .chain-badge:hover { background: rgba(99,102,241,0.12) !important; border-color: rgba(99,102,241,0.3) !important; transform:translateY(-2px); }
        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .hero-sub { font-size: 15px !important; }
          .nav-links { display: none !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-buttons { flex-direction: column !important; align-items: center !important; }
          .stats-row { gap: 24px !important; flex-wrap: wrap !important; justify-content: center !important; }
          .section-pad { padding: 60px 20px !important; }
          .team-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .chains-wrap { gap: 8px !important; }
        }
      `}} />

      {/* Cookie Banner */}
      {!cookieAccepted && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:500, background:"rgba(10,12,22,0.98)", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", backdropFilter:"blur(12px)" }}>
          <div style={{ fontSize:12, color:"#6B7FA3", maxWidth:560, lineHeight:1.6 }}>
            We use analytics to improve MultiMesh. By continuing you agree to our <a href="/privacy" style={{ color:"#818CF8", textDecoration:"none" }}>Privacy Policy</a>.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={acceptCookies} style={{ padding:"7px 18px", borderRadius:8, background:"#6366F1", color:"#fff", border:"none", fontWeight:600, fontSize:12, cursor:"pointer" }}>Accept</button>
            <button onClick={acceptCookies} style={{ padding:"7px 18px", borderRadius:8, background:"transparent", color:"#6B7FA3", border:"1px solid rgba(255,255,255,0.07)", fontWeight:600, fontSize:12, cursor:"pointer" }}>Decline</button>
          </div>
        </div>
      )}

      {/* Background Effects */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)", width:900, height:900, background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)", animation:"pulse 8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-10%", right:"-10%", width:600, height:600, background:"radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)", backgroundSize:"72px 72px" }} />
      </div>

      {/* Nav */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(4,6,14,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition:"all 0.3s",
        padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:32 }}>
          <div>
            <img src="/logo.jpg" width={48} height={48} style={{ borderRadius: "50%", mixBlendMode: "screen", marginRight: 8 }} />
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#EEF2FF" }}>MULTI</span>
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#818CF8" }}>MESH</span>
          </div>
          <div className="nav-links" style={{ display:"flex", gap:24 }}>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#why" className="nav-link">Why MultiMesh</a>
            <a href="/points" className="nav-link">Points</a>
            <a href="/docs" className="nav-link">Docs</a>
            <a href="/analytics" className="nav-link">Analytics</a>
            <a href="/limit-orders" className="nav-link">Limit Orders</a>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:10, fontFamily:"monospace", color:"#F59E0B", background:"rgba(245,158,11,0.1)", padding:"3px 8px", borderRadius:5, letterSpacing:1 }}>BETA</span>
          <button className="btn-primary" onClick={() => setShowApp(true)} style={{ padding:"9px 20px", borderRadius:10, background:"#6366F1", color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position:"relative", zIndex:1, paddingTop:140, paddingBottom:80, textAlign:"center", padding:"140px 24px 80px" }}>
        <div className="fade-up fade-up-1" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:100, padding:"6px 16px", marginBottom:28 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E" }} />
          <span style={{ fontSize:12, fontFamily:"monospace", color:"#818CF8", letterSpacing:0.5 }}>Live on Mainnet · Beta</span>
        </div>

        <h1 className="fade-up fade-up-2 hero-title" style={{ fontSize:"clamp(40px,6vw,72px)", fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", letterSpacing:-2, lineHeight:1.05, marginBottom:24, maxWidth:760, margin:"0 auto 24px" }}>
          Swap any token.<br />
          <span style={{ background:"linear-gradient(135deg, #818CF8, #C084FC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Across any chain.</span>
        </h1>

        <p className="fade-up fade-up-3 hero-sub" style={{ fontSize:17, color:"#6B7FA3", maxWidth:500, margin:"0 auto 40px", lineHeight:1.75 }}>
          MultiMesh finds the best cross-chain route in seconds — scanning 20+ bridges and DEXes simultaneously. One click. Done.
        </p>

        <div className="fade-up fade-up-4 hero-buttons" style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:64 }}>
          <button className="btn-primary" onClick={() => setShowApp(true)} style={{ padding:"15px 36px", borderRadius:12, background:"#6366F1", color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer" }}>
            Start Swapping →
          </button>
          <a href="/widget" style={{ padding:"15px 28px", borderRadius:12, background:"transparent", color:"#818CF8", border:"1px solid rgba(99,102,241,0.3)", fontWeight:600, fontSize:15, cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center" }}>
            Embed Widget
          </a>
        </div>

        {/* Stats */}
        <div className="fade-up stats-row" style={{ display:"flex", justifyContent:"center", gap:48, animationDelay:"0.6s", opacity:0 }}>
          {[["6", "Chains"], ["20+", "Bridges & DEXes"], ["15bps", "Fee"], ["Live", "Status"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize:22, fontWeight:700, color:"#EEF2FF", fontFamily:"'Space Grotesk',sans-serif" }}>{v}</div>
              <div style={{ fontSize:11, fontFamily:"monospace", color:"#4B5A72", letterSpacing:1, marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Chain badges */}
      <section style={{ position:"relative", zIndex:1, padding:"0 24px 80px" }}>
        <div className="chains-wrap" style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
          {CHAINS.map(c => (
            <div key={c.name} className="chain-badge" style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:100 }}>
              <img src={c.logo} width={20} height={20} style={{ borderRadius:"50%" }} />
              <span style={{ fontSize:13, fontWeight:500, color:"#A0B0C8" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section-pad" style={{ position:"relative", zIndex:1, maxWidth:1040, margin:"0 auto", padding:"80px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, fontFamily:"monospace", color:"#4B5A72", letterSpacing:2, marginBottom:12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:-1 }}>Four steps to any chain.</h2>
        </div>
        <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {STEPS.map(s => (
            <div key={s.n} className="step-card" style={{ background:"rgba(10,12,22,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"24px 20px" }}>
              <div style={{ fontSize:12, fontFamily:"monospace", color:"#6366F1", marginBottom:16, letterSpacing:1 }}>{s.n}</div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:8, fontFamily:"'Space Grotesk',sans-serif" }}>{s.title}</div>
              <div style={{ fontSize:13, color:"#6B7FA3", lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why MultiMesh */}
      <section id="why" className="section-pad" style={{ position:"relative", zIndex:1, maxWidth:1040, margin:"0 auto", padding:"80px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, fontFamily:"monospace", color:"#4B5A72", letterSpacing:2, marginBottom:12 }}>WHY MULTIMESH</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:-1 }}>Built for real users.</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {[
            { icon:"◈", title:"Best route, every time", desc:"We don't just check one bridge. We scan all of them simultaneously and pick the path with the best output after fees." },
            { icon:"◉", title:"Risk labels on every route", desc:"Before you confirm, we show you bridge reliability, number of steps, and execution time. You decide with full context." },
            { icon:"⬡", title:"Any token, any pair", desc:"Paste any contract address and we search for available routes. Not limited to a preset list." },
            { icon:"✦", title:"Points for every swap", desc:"Early users earn OG points per swap. Check your balance and referral link at themultimesh.com/points." },
            { icon:"⚡", title:"Gas refuel built in", desc:"Need native gas on a new chain? Use the refuel feature to bridge small amounts of native tokens in one click." },
            { icon:"◻", title:"Embed anywhere", desc:"Integrate MultiMesh into your app in 3 lines of code with our embeddable widget. Revenue share available." },
          ].map(f => (
            <div key={f.title} className="step-card" style={{ background:"rgba(10,12,22,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"24px" }}>
              <div style={{ fontSize:22, marginBottom:14, color:"#818CF8" }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:8, fontFamily:"'Space Grotesk',sans-serif" }}>{f.title}</div>
              <div style={{ fontSize:13, color:"#6B7FA3", lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="section-pad" style={{ position:"relative", zIndex:1, maxWidth:800, margin:"0 auto", padding:"80px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:11, fontFamily:"monospace", color:"#4B5A72", letterSpacing:2, marginBottom:12 }}>TEAM</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:-1 }}>Who builds MultiMesh.</h2>
        </div>
        <div className="team-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[
            { name:"Michael Kurz", role:"Co-Founder & Engineer", desc:"Full-stack developer building MultiMesh's infrastructure, routing engine, and product." },
{ name:"Tomide Akinrodoye", role:"Founder & Product", desc:"Product direction, community, and business development. Based in Angola." },
          ].map(m => (
            <div key={m.name} style={{ background:"rgba(10,12,22,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"24px" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#6366F1,#8B5CF6)", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#fff", fontFamily:"'Space Grotesk',sans-serif" }}>
                {m.name[0]}
              </div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:4, fontFamily:"'Space Grotesk',sans-serif" }}>{m.name}</div>
              <div style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1", marginBottom:10, letterSpacing:0.5 }}>{m.role}</div>
              <div style={{ fontSize:13, color:"#6B7FA3", lineHeight:1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad" style={{ position:"relative", zIndex:1, maxWidth:680, margin:"0 auto", padding:"80px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:11, fontFamily:"monospace", color:"#4B5A72", letterSpacing:2, marginBottom:12 }}>FAQ</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:-1 }}>Common questions.</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="faq-row" style={{ background:"rgba(10,12,22,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:14, fontWeight:500, color:"#EEF2FF" }}>{f.q}</span>
                <span style={{ color:"#4B5A72", fontSize:18, flexShrink:0, transition:"transform 0.2s", display:"block", transform:openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ padding:"0 20px 16px", fontSize:13, color:"#6B7FA3", lineHeight:1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad" style={{ position:"relative", zIndex:1, textAlign:"center", padding:"80px 24px 120px" }}>
        <div style={{ maxWidth:480, margin:"0 auto", padding:40, background:"rgba(10,12,22,0.9)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:20 }}>
          <h2 style={{ fontSize:26, fontWeight:700, marginBottom:10, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:-0.5 }}>Ready to swap?</h2>
          <p style={{ fontSize:13, color:"#6B7FA3", marginBottom:28, lineHeight:1.7 }}>Connect your wallet and find the best cross-chain route in seconds.</p>
          <button className="btn-primary" onClick={() => setShowApp(true)} style={{ width:"100%", padding:15, borderRadius:12, background:"#6366F1", color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer" }}>
            Launch MultiMesh →
          </button>
          <div style={{ marginTop:16, display:"flex", justifyContent:"center", gap:20 }}>
            <a href="/points" style={{ fontSize:12, color:"#818CF8", textDecoration:"none" }}>Points Program ✦</a>
            <a href="/docs" style={{ fontSize:12, color:"#6B7FA3", textDecoration:"none" }}>Embed Widget</a>
            <a href="https://t.me/multi_mesh" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"#6B7FA3", textDecoration:"none" }}>Telegram</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,0.04)", padding:"24px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:13, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>MULTI<span style={{ color:"#818CF8" }}>MESH</span></span>
          <span style={{ fontSize:11, fontFamily:"monospace", color:"#2D3A50" }}>Beta v0.1</span>
        </div>
        <div style={{ fontSize:11, fontFamily:"monospace", color:"#2D3A50", display:"flex", gap:16, flexWrap:"wrap" }}>
          <a href="/privacy" style={{ color:"#2D3A50", textDecoration:"none" }}>Privacy</a>
          <a href="/terms" style={{ color:"#2D3A50", textDecoration:"none" }}>Terms</a>
          <a href="/points" style={{ color:"#818CF8", textDecoration:"none" }}>Points ✦</a>
          
          <a href="/refuel" style={{ color:"#2D3A50", textDecoration:"none" }}>Refuel</a>
          <a href="/limit-orders" style={{ color:"#818CF8", textDecoration:"none" }}>Limit Orders ↗</a>
          <a href="https://t.me/multi_mesh" target="_blank" rel="noopener noreferrer" style={{ color:"#2D3A50", textDecoration:"none" }}>Telegram</a>
          <span style={{ color:"#2D3A50" }}>Powered by LI.FI</span>
        </div>
      </footer>
    </div>
  );
}