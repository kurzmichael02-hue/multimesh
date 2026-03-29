export default function Privacy() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      fontFamily: "'DM Sans', sans-serif",
      color: "#A0B0C8",
      padding: "60px 24px",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <a href="/" style={{ fontSize: 12, fontFamily: "monospace", color: "#3D4F6B", textDecoration: "none", letterSpacing: 1 }}>← BACK</a>

        <div style={{ marginTop: 32, marginBottom: 40 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#F0F4FF", marginBottom: 8 }}>Privacy Policy</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#3D4F6B" }}>Last updated: March 2026</div>
        </div>

        {[
          {
            title: "Overview",
            body: "MultiMesh is a non-custodial cross-chain swap aggregator. We do not hold, control, or have access to your funds at any point. This policy explains what minimal data we collect and how we use it.",
          },
          {
            title: "What We Collect",
            body: "We collect anonymous usage analytics (page views, feature interactions, error events) to improve the product. We do not collect your name, email address, or any personally identifiable information. Your wallet address is used only to display your token balances and route quotes — we do not store it.",
          },
          {
            title: "Cookies & Local Storage",
            body: "We use browser local storage to remember your preferences (e.g. dismissed banners). We do not use tracking cookies or third-party advertising cookies.",
          },
          {
            title: "Third-Party Services",
            body: "We use LI.FI's routing API to fetch cross-chain swap routes. When you request a quote, your wallet address and token selection are sent to LI.FI's servers. Please review LI.FI's privacy policy at li.fi. We may use analytics tools (such as PostHog) to collect anonymized usage data.",
          },
          {
            title: "Your Funds",
            body: "MultiMesh is non-custodial. All swaps are executed directly through smart contracts. We never have access to your private keys or funds. You are solely responsible for the transactions you sign.",
          },
          {
            title: "Beta Disclaimer",
            body: "MultiMesh is currently in beta. The product is provided as-is without warranties of any kind. Use small amounts while the product is in beta. We are not liable for losses resulting from bugs, smart contract exploits, or bridge failures.",
          },
          {
            title: "Contact",
            body: "For privacy-related questions, please reach out via our community channels.",
          },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{s.body}</div>
          </div>
        ))}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 11, fontFamily: "monospace", color: "#1C2A3A" }}>
          MultiMesh · Beta v0.1
        </div>
      </div>
    </div>
  );
}