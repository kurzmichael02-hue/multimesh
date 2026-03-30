"use client";
import { useState, useEffect } from "react";
import { SwapInterface } from "@/components/SwapInterface";

const STATS = [
  { value: "6",     label: "Chains Supported" },
  { value: "15bps", label: "Protocol Fee" },
  { value: "Live",  label: "Status" },
];

const FEATURES = [
  {
    icon: "⬡",
    title: "Best Route, Every Time",
    desc: "We scan LI.FI's aggregation layer across every available bridge and DEX to find the optimal path — not just the cheapest, but the safest.",
  },
  {
    icon: "◈",
    title: "One Click. Any Chain.",
    desc: "ETH to BNB. MATIC to ARB. OP to ETH. Select your tokens, confirm, done. No manual bridging, no network switching, no confusion.",
  },
  {
    icon: "◉",
    title: "Safety First",
    desc: "Every route shows a risk label before you confirm. We surface bridge reliability, number of steps, and execution time — so you decide with full context.",
  },
];

const FAQS = [
  {
    q: "What is MultiMesh?",
    a: "MultiMesh is a cross-chain swap aggregator. It finds the best route to swap tokens across different blockchains in a single transaction — no manual bridging required.",
  },
  {
    q: "Which chains are supported?",
    a: "Ethereum, Polygon, BNB Chain, Arbitrum, and Optimism. More chains will be added as the platform grows.",
  },
  {
    q: "How does MultiMesh find the best route?",
    a: "We use LI.FI's routing engine which scans 20+ bridges and 8+ DEX aggregators simultaneously to find the optimal path based on output amount, fees, and execution time.",
  },
  {
    q: "Is MultiMesh non-custodial?",
    a: "Yes. MultiMesh never holds your funds. All swaps execute directly between your wallet and smart contracts. You retain full control of your assets at all times.",
  },
  {
    q: "What fees does MultiMesh charge?",
    a: "MultiMesh charges a 0.15% protocol fee on each swap. This is collected automatically. Network gas fees apply separately and vary by chain.",
  },
  {
    q: "Is it safe to use during beta?",
    a: "The core infrastructure is battle-tested — LI.FI processes billions in volume. However MultiMesh itself is in beta. Start with small amounts and verify every transaction before confirming.",
  },
  {
    q: "Can I swap any token?",
    a: "Any token with liquidity on a supported DEX can be swapped. Paste any contract address into the token selector and MultiMesh will search for available routes.",
  },
];

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cookieAccepted, setCookieAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("mm_cookie_consent");
    if (!consent) setCookieAccepted(false);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("mm_cookie_consent", "true");
    setCookieAccepted(true);
  };

  if (showApp) return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowApp(false)}
        style={{
          position: "fixed", top: 52, left: 16, zIndex: 400,
          background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "6px 14px", color: "#A0B0C8",
          fontSize: 12, fontFamily: "monospace", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(10px)",
        }}
      >
        ← Home
      </button>
      <SwapInterface />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      fontFamily: "'DM Sans', sans-serif",
      color: "#F0F4FF",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUpFast { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .hero-title { animation: slideUp 0.7s ease forwards; }
        .hero-sub { animation: slideUp 0.7s ease 0.15s both; }
        .hero-cta { animation: slideUp 0.7s ease 0.3s both; }
        .hero-stats { animation: slideUp 0.7s ease 0.45s both; }
        .feature-card { transition: border-color 0.2s, transform 0.2s; }
        .feature-card:hover { border-color: rgba(0,229,255,0.2) !important; transform: translateY(-3px); }
        .cta-btn { transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .cta-btn:hover { background: #00F5FF !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,229,255,0.3); }
        .cta-btn:active { transform: translateY(0); }
        .faq-item { transition: border-color 0.2s; }
        .faq-item:hover { border-color: rgba(0,229,255,0.12) !important; }
      `}</style>

      {/* Cookie consent banner */}
      {!cookieAccepted && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500,
          background: "rgba(13,17,23,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap", backdropFilter: "blur(12px)",
          animation: "slideUpFast 0.3s ease forwards",
        }}>
          <div style={{ fontSize: 12, color: "#A0B0C8", maxWidth: 600 }}>
            We use analytics cookies to understand how users interact with MultiMesh and improve the product.
            By clicking Accept you agree to our <a href="/privacy" style={{ color: "#00E5FF", textDecoration: "none" }}>Privacy Policy</a>.
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={acceptCookies} style={{ padding: "8px 20px", borderRadius: 9, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              Accept
            </button>
            <button onClick={acceptCookies} style={{ padding: "8px 20px", borderRadius: 9, background: "transparent", color: "#3D4F6B", border: "1px solid rgba(255,255,255,0.07)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              Decline
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", top: -300, left: -300, width: 800, height: 800, background: "radial-gradient(circle,rgba(0,229,255,0.05) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -300, right: -300, width: 700, height: 700, background: "radial-gradient(circle,rgba(123,97,255,0.05) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.02) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>MULTI<span style={{ color: "#00E5FF" }}>MESH</span></div>
          <div style={{ fontSize: 10, color: "#3D4F6B", fontFamily: "monospace", letterSpacing: 1, marginTop: 1 }}>Cross-Chain Swap Aggregator</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#F3BA2F", background: "rgba(243,186,47,0.1)", padding: "3px 8px", borderRadius: 5, letterSpacing: 1 }}>BETA</span>
          <button className="cta-btn" onClick={() => setShowApp(true)} style={{ padding: "8px 18px", borderRadius: 10, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Launch App →
          </button>
        </div>
      </nav>

      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 24px 60px" }}>
        <div className="hero-title" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 20 }}>
          Swap any token.<br />
          <span style={{ color: "#00E5FF" }}>Across any chain.</span>
        </div>
        <div className="hero-sub" style={{ fontSize: 16, color: "#6B7FA3", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          MultiMesh finds the best cross-chain route in seconds — optimized for safety, speed, and cost. No manual bridging. No confusion. Just swap.
        </div>
        <div className="hero-cta">
          <button className="cta-btn" onClick={() => setShowApp(true)} style={{ padding: "16px 40px", borderRadius: 14, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Start Swapping
            <span style={{ fontSize: 18 }}>→</span>
          </button>
          <div style={{ marginTop: 12, fontSize: 12, fontFamily: "monospace", color: "#3D4F6B" }}>Beta · Mainnet · Use small amounts</div>
        </div>

        <div className="hero-stats" style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 56 }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#00E5FF" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", gap: 16, padding: "0 24px 60px", flexWrap: "wrap" }}>
        {[
          { name: "Ethereum", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
          { name: "Polygon",  logo: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
          { name: "BNB",      logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
          { name: "Arbitrum", logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
          { name: "Optimism", logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
          { name: "Base", logo: "https://assets.coingecko.com/coins/images/35506/small/base.png" },
        ].map(c => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
            <img src={c.logo} width={20} height={20} style={{ borderRadius: "50%" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#A0B0C8" }}>{c.name}</span>
          </div>
        ))}
      </section>

      <section style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 2, marginBottom: 12 }}>WHY MULTIMESH</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Built different.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card" style={{ background: "rgba(13,17,23,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#6B7FA3", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#3D4F6B", letterSpacing: 2, marginBottom: 12 }}>FAQ</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Common questions.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item" style={{ background: "rgba(13,17,23,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "#F0F4FF", textAlign: "left" }}>{faq.q}</span>
                <span style={{ color: "#3D4F6B", fontSize: 16, flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#6B7FA3", lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: 36, background: "rgba(13,17,23,0.95)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ready to swap?</div>
          <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 24 }}>Connect your wallet and find the best route in seconds.</div>
          <button className="cta-btn" onClick={() => setShowApp(true)} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#00E5FF", color: "#060810", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Launch MultiMesh →
          </button>
        </div>
      </section>

      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "20px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#1C2A3A" }}>
    Powered by LI.FI &nbsp;·&nbsp; ETH &nbsp;·&nbsp; MATIC &nbsp;·&nbsp; BNB &nbsp;·&nbsp; ARB &nbsp;·&nbsp; OP &nbsp;·&nbsp; Beta v0.1 &nbsp;·&nbsp;
    <a href="/privacy" style={{ color: "#3D4F6B", textDecoration: "none" }}>Privacy Policy</a>
    &nbsp;·&nbsp;
    <a href="/terms" style={{ color: "#3D4F6B", textDecoration: "none" }}>Terms of Service</a>
    &nbsp;·&nbsp;
    <a href="/points" style={{ color: "#00E5FF", textDecoration: "none" }}>Points ✦</a>
    &nbsp;·&nbsp;
    <a href="https://t.me/multi_mesh" target="_blank" rel="noopener noreferrer" style={{ color: "#3D4F6B", textDecoration: "none" }}>Telegram</a>
    &nbsp;·&nbsp;
    <a href="/refuel" style={{ color: "#3D4F6B", textDecoration: "none" }}>⚡ Refuel</a>
  </div>
</footer>
    </div>
  );
}