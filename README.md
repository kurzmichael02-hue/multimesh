<div align="center">
  <h1>⬡ MULTIMESH</h1>
  <p><strong>Cross-chain swap aggregator — swap any token across any chain in one click</strong></p>

  <p>
    <a href="https://themultimesh.com"><img src="https://img.shields.io/badge/Live-themultimesh.com-00E5FF?style=flat-square&logo=vercel&logoColor=black" /></a>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
    <img src="https://img.shields.io/badge/wagmi-v2-1C1C1C?style=flat-square" />
    <img src="https://img.shields.io/badge/Powered_by-LI.FI-00E5FF?style=flat-square" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
  </p>
</div>

---

## What is MultiMesh?

MultiMesh is a live cross-chain swap aggregator. Connect your wallet, pick your tokens and chains, and get the best route across 20+ bridges and DEXes — in one transaction.

**Live:** [themultimesh.com](https://themultimesh.com)

---

## Features

- **Cross-chain swaps** — ETH, Polygon, BNB Chain, Arbitrum, Optimism, Base
- **Best route engine** — powered by LI.FI, scans 20+ bridges and DEXes simultaneously
- **Points system** — earn 100 points per $1 in fees, referral bonuses, public leaderboard
- **Gas Refuel** — bridge native gas tokens to any chain in one click
- **Embeddable widget** — integrate MultiMesh into any app in 3 lines of code
- **Risk labels** — every route shows fee, execution time, and risk level before confirmation
- **Slippage control** — presets + custom slippage input
- **Swap history** — full transaction log with LI.FI explorer links
- **Price impact warnings** — automatic alerts on high-loss swaps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Wallet | wagmi v2 + RainbowKit |
| Routing | LI.FI REST API |
| Database | Supabase (points system) |
| Analytics | PostHog |
| Deployment | Vercel |
| Language | TypeScript |

---

## Supported Chains

| Chain | Chain ID |
|---|---|
| Ethereum | 1 |
| Polygon | 137 |
| BNB Chain | 56 |
| Arbitrum | 42161 |
| Optimism | 10 |
| Base | 8453 |

---

## Widget Integration

Embed a full cross-chain swap interface in 3 lines:

```html
<div id="multimesh-widget"></div>
<script src="https://themultimesh.com/multimesh-widget.js"></script>
<script>MultiMesh.init({ container: '#multimesh-widget' })</script>
```

Full docs: [themultimesh.com/docs](https://themultimesh.com/docs)

---

## Getting Started

```bash
git clone https://github.com/kurzmichael02-hue/multimesh
cd multimesh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/points` | Points leaderboard + referrals |
| `/refuel` | Gas refuel across chains |
| `/widget` | Embeddable swap widget |
| `/docs` | Partner integration docs |

---

## Fee Structure

MultiMesh charges **0.15%** (15bps) per swap. Revenue goes to the MultiMesh treasury multisig.

---

## License

MIT
