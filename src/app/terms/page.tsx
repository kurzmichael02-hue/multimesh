export default function Terms() {
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
          <div style={{ fontSize: 24, fontWeight: 700, color: "#F0F4FF", marginBottom: 8 }}>Terms of Service</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#3D4F6B" }}>Last updated: March 2026</div>
        </div>

        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing or using MultiMesh, you agree to be bound by these Terms of Service. If you do not agree, do not use the service. You must be at least 18 years old to use MultiMesh.",
          },
          {
            title: "2. Non-Custodial Service",
            body: "MultiMesh is a non-custodial interface. We do not hold, control, or have access to your funds at any time. All transactions are executed directly between your wallet and third-party smart contracts. You retain full custody of your assets at all times.",
          },
          {
            title: "3. No Financial Advice",
            body: "Nothing on MultiMesh constitutes financial, investment, legal, or tax advice. All information is provided for informational purposes only. You are solely responsible for your trading decisions and any resulting gains or losses.",
          },
          {
            title: "4. Risk Disclosure",
            body: "Cross-chain swaps involve significant risks including but not limited to: smart contract vulnerabilities, bridge exploits, slippage, price impact, failed transactions, and loss of funds. MultiMesh is in beta. Use small amounts. You acknowledge and accept all risks associated with DeFi and cross-chain transactions.",
          },
          {
            title: "5. Fees",
            body: "MultiMesh charges a 0.15% (15 basis points) protocol fee on each swap. This fee is deducted automatically from your transaction via the LI.FI fee collection system. Additional network gas fees apply and are outside our control.",
          },
          {
            title: "6. Restricted Jurisdictions",
            body: "MultiMesh is not available to residents or nationals of sanctioned countries including Cuba, Iran, North Korea, Syria, and the Crimea, Donetsk, and Luhansk regions of Ukraine. By using MultiMesh you represent that you are not located in or a national of any restricted jurisdiction.",
          },
          {
            title: "7. Third-Party Services",
            body: "MultiMesh relies on third-party infrastructure including LI.FI, bridge providers, and DEX aggregators. We are not responsible for the performance, security, or availability of these third-party services. Token prices, bridge routes, and execution outcomes are determined by external protocols.",
          },
          {
            title: "8. Limitation of Liability",
            body: "To the maximum extent permitted by law, MultiMesh and its founders shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of funds, arising from your use of the service.",
          },
          {
            title: "9. No Warranties",
            body: "MultiMesh is provided 'as is' and 'as available' without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or free of bugs or vulnerabilities. Use at your own risk.",
          },
          {
            title: "10. Changes to Terms",
            body: "We reserve the right to modify these terms at any time. Continued use of MultiMesh after changes constitutes acceptance of the updated terms.",
          },
          {
            title: "11. Contact",
            body: "For questions regarding these terms, contact us through our community channels.",
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