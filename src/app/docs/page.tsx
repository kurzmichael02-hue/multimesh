"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CODE_EXAMPLES = [
  {
    label: "Quick Start",
    lang: "html",
    code: `<div id="multimesh-widget"></div>
<script src="https://themultimesh.com/multimesh-widget.js"></script>
<script>MultiMesh.init({ container: '#multimesh-widget' })</script>`,
  },
  {
    label: "Light Theme",
    lang: "javascript",
    code: `MultiMesh.init({
  container:  '#swap-widget',
  theme:      'light',
  accent:     '#6366F1',
  integrator: 'my-defi-app',
})`,
  },
  {
    label: "Custom Size",
    lang: "javascript",
    code: `MultiMesh.init({
  container:    '#sidebar-swap',
  width:        '360px',
  height:       '500px',
  hideBranding: true,
  integrator:   'my-app',
})`,
  },
  {
    label: "Direct iframe",
    lang: "html",
    code: `<iframe
  src="https://themultimesh.com/widget?theme=dark&accent=%236366F1&integrator=my-app"
  width="420"
  height="560"
  style="border:none; border-radius:20px"
></iframe>`,
  },
];

const CHAINS = [
  { name: "Ethereum", id: "1", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { name: "Polygon", id: "137", logo: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
  { name: "BNB Chain", id: "56", logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { name: "Arbitrum", id: "42161", logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
  { name: "Optimism", id: "10", logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
  { name: "Base", id: "8453", logo: "https://assets.coingecko.com/coins/images/35506/small/base.png" },
];

const OPTIONS = [
  { name: "container", type: "string", desc: "CSS selector or DOM element" },
  { name: "integrator", type: "string", desc: "Your app name for analytics" },
  { name: "theme", type: "'dark' | 'light'", desc: "Widget color scheme" },
  { name: "accent", type: "string", desc: "Brand color in hex e.g. '#6366F1'" },
  { name: "width", type: "string", desc: "Widget width e.g. '420px'" },
  { name: "height", type: "string", desc: "Widget height e.g. '560px'" },
  { name: "borderRadius", type: "string", desc: "Corner radius e.g. '20px'" },
  { name: "hideBranding", type: "boolean", desc: "Hide 'Powered by MultiMesh'" },
];

function Navbar() {
  const path = usePathname();
  return (
    <nav style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(4,6,14,0.95)", backdropFilter:"blur(12px)", padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <Link href="/" style={{ textDecoration:"none" }}>
        <img src="/logo.jpg" width={48} height={48} style={{ borderRadius: "50%", mixBlendMode: "screen", marginRight: 8 }} />
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#EEF2FF" }}>MULTI</span>
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#818CF8" }}>MESH</span>
      </Link>
      <div style={{ display:"flex", gap:24, alignItems:"center" }}>
        {[
          { href:"/", label:"App" },
          { href:"/points", label:"Points ✦" },
          { href:"/refuel", label:"Refuel" },
          { href:"/docs", label:"Docs" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{ fontSize:13, fontWeight:500, color: path === href ? "#818CF8" : "#6B7FA3", textDecoration:"none" }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position:"relative", background:"rgba(4,6,14,0.9)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.02)" }}>
        <span style={{ fontSize:10, fontFamily:"monospace", color:"#4B5A72", letterSpacing:1, textTransform:"uppercase" }}>{lang}</span>
        <button onClick={copy} style={{ fontSize:10, fontFamily:"monospace", color: copied ? "#818CF8" : "#4B5A72", background:"none", border:"none", cursor:"pointer", padding:0, letterSpacing:0.5 }}>
          {copied ? "COPIED ✓" : "COPY"}
        </button>
      </div>
      <pre style={{ margin:0, padding:"16px 14px", fontSize:12, fontFamily:"monospace", color:"#A0B0C8", lineHeight:1.7, overflowX:"auto", whiteSpace:"pre" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  const [activeExample, setActiveExample] = useState(0);

  return (
    <div style={{ minHeight:"100vh", background:"#04060E", fontFamily:"'DM Sans', sans-serif", color:"#EEF2FF" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
        .tab-btn { transition: all 0.15s; cursor: pointer; }
        .tab-btn:hover { border-color: rgba(99,102,241,0.3) !important; }
        .option-row:hover { background: rgba(255,255,255,0.02) !important; }
        .support-link { transition: border-color 0.15s; }
        .support-link:hover { border-color: rgba(99,102,241,0.3) !important; }
      `}} />

      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(99,102,241,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.02) 1px,transparent 1px)", backgroundSize:"72px 72px", pointerEvents:"none" }} />
      <div style={{ position:"fixed", top:-200, right:-200, width:600, height:600, background:"radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 65%)", pointerEvents:"none" }} />

      <Navbar />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"60px 24px 100px", position:"relative", zIndex:1 }}>

        <div className="fade-in" style={{ marginBottom:64 }}>
          <div style={{ fontSize:11, fontFamily:"monospace", color:"#4B5A72", letterSpacing:2, marginBottom:16 }}>WIDGET INTEGRATION</div>
          <h1 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:-1.5, lineHeight:1.1, margin:"0 0 20px" }}>
            Embed cross-chain swaps<br />
            <span style={{ background:"linear-gradient(135deg,#818CF8,#C084FC)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>in 3 lines of code.</span>
          </h1>
          <p style={{ fontSize:16, color:"#6B7FA3", maxWidth:560, lineHeight:1.7, margin:0 }}>
            Add a fully functional cross-chain swap interface to any website. 6 chains, wallet connection, route optimization, and real on-chain execution — out of the box.
          </p>
        </div>

        <section style={{ marginBottom:56 }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6, letterSpacing:-0.3, fontFamily:"'Space Grotesk',sans-serif" }}>Quick Start</h2>
          <p style={{ fontSize:14, color:"#6B7FA3", marginBottom:20, marginTop:0 }}>Drop this into any HTML page and you're live.</p>
          <CodeBlock lang="html" code={`<div id="multimesh-widget"></div>
<script src="https://themultimesh.com/multimesh-widget.js"></script>
<script>MultiMesh.init({ container: '#multimesh-widget' })</script>`} />
        </section>

        <div style={{ marginBottom:56, padding:"24px 28px", background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>See it live</div>
            <div style={{ fontSize:13, color:"#6B7FA3" }}>Try the widget yourself before integrating.</div>
          </div>
          <a href="/widget" target="_blank" rel="noopener noreferrer" style={{ padding:"10px 22px", borderRadius:10, background:"#6366F1", color:"#fff", fontWeight:700, fontSize:14, textDecoration:"none", whiteSpace:"nowrap" }}>
            Open Widget Demo →
          </a>
        </div>

        <section style={{ marginBottom:56 }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20, letterSpacing:-0.3, fontFamily:"'Space Grotesk',sans-serif" }}>Examples</h2>
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            {CODE_EXAMPLES.map((ex, i) => (
              <button key={i} className="tab-btn" onClick={() => setActiveExample(i)}
                style={{ padding:"6px 14px", borderRadius:8, background: activeExample === i ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: activeExample === i ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)", color: activeExample === i ? "#818CF8" : "#6B7FA3", fontSize:13, fontWeight:600 }}>
                {ex.label}
              </button>
            ))}
          </div>
          <CodeBlock lang={CODE_EXAMPLES[activeExample].lang} code={CODE_EXAMPLES[activeExample].code} />
        </section>

        <section style={{ marginBottom:56 }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6, letterSpacing:-0.3, fontFamily:"'Space Grotesk',sans-serif" }}>Configuration</h2>
          <p style={{ fontSize:14, color:"#6B7FA3", marginBottom:20, marginTop:0 }}>All options are optional — defaults work out of the box.</p>
          <div style={{ border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
              {["Option","Type","Description"].map(h => (
                <div key={h} style={{ fontSize:10, fontFamily:"monospace", color:"#4B5A72", letterSpacing:1 }}>{h.toUpperCase()}</div>
              ))}
            </div>
            {OPTIONS.map((opt, i) => (
              <div key={opt.name} className="option-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", padding:"12px 16px", borderBottom: i < OPTIONS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ fontSize:12, fontFamily:"monospace", color:"#818CF8" }}>{opt.name}</div>
                <div style={{ fontSize:11, fontFamily:"monospace", color:"#6B7FA3" }}>{opt.type}</div>
                <div style={{ fontSize:12, color:"#A0B0C8" }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom:56 }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20, letterSpacing:-0.3, fontFamily:"'Space Grotesk',sans-serif" }}>Supported Chains</h2>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {CHAINS.map(c => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>
                <img src={c.logo} width={20} height={20} style={{ borderRadius:"50%" }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#EEF2FF" }}>{c.name}</div>
                  <div style={{ fontSize:10, fontFamily:"monospace", color:"#4B5A72" }}>ID: {c.id}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom:56, padding:"24px 28px", background:"rgba(10,12,22,0.9)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16 }}>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:8, marginTop:0, fontFamily:"'Space Grotesk',sans-serif" }}>Fees & Revenue Share</h2>
          <p style={{ fontSize:14, color:"#6B7FA3", lineHeight:1.7, margin:"0 0 16px" }}>
            MultiMesh charges <strong style={{ color:"#EEF2FF" }}>0.15%</strong> per swap. No integration fees. High-volume partners can apply for a custom revenue sharing arrangement.
          </p>
          <a href="https://t.me/multi_mesh" target="_blank" rel="noopener noreferrer" style={{ fontSize:13, fontWeight:600, color:"#818CF8", textDecoration:"none" }}>
            Contact us on Telegram →
          </a>
        </section>

        <section>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:16, letterSpacing:-0.3, fontFamily:"'Space Grotesk',sans-serif" }}>Support</h2>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { label:"Telegram", url:"https://t.me/multi_mesh", desc:"Community & support" },
              { label:"Live App", url:"https://themultimesh.com", desc:"Try it yourself" },
              { label:"Widget Demo", url:"/widget", desc:"See the widget live" },
            ].map(l => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="support-link"
                style={{ padding:"14px 20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, textDecoration:"none", minWidth:160, flex:"1 1 160px" }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#818CF8", marginBottom:4 }}>{l.label} ↗</div>
                <div style={{ fontSize:12, color:"#6B7FA3" }}>{l.desc}</div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}