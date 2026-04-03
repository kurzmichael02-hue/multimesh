<div align="center">
  <h1>⬡ MULTIMESH</h1>
  <p><strong>Cross-chain swap aggregator — any token, any chain, one click</strong></p>
  <p>
    <a href="https://themultimesh.com"><img src="https://img.shields.io/badge/Live-themultimesh.com-818CF8?style=flat-square&logo=vercel" /></a>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
    <img src="https://img.shields.io/badge/wagmi-v2-1C1C1C?style=flat-square" />
    <img src="https://img.shields.io/badge/LI.FI-Routing-818CF8?style=flat-square" />
    <img src="https://img.shields.io/badge/deBridge-DLN-818CF8?style=flat-square" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
  </p>
</div>

---

## What is MultiMesh?

MultiMesh is a live cross-chain swap aggregator. Connect your wallet, pick your tokens and chains, and get the best route across 20+ bridges and DEXes — in one transaction. Built on LI.FI routing infrastructure with deBridge DLN for cross-chain limit orders.

**Live:** [themultimesh.com](https://themultimesh.com)

---

## Features

- **Cross-chain swaps** — ETH, Polygon, BNB Chain, Arbitrum, Optimism, Base
- **Best route engine** — scans 20+ bridges and DEXes simultaneously via LI.FI
- **Cross-chain limit orders** — set a target price, executes automatically when hit. Powered by deBridge DLN. First cross-chain aggregator to offer this.
- **Points system** — earn points per swap, referral bonuses, public leaderboard
- **Gas Refuel** — bridge native gas tokens to any chain in one click
- **Embeddable widget** — integrate MultiMesh into any app in 3 lines of code
- **Analytics dashboard** — live protocol stats, volume, routes, recent swaps
- **Risk labels** — fee, execution time, and risk level shown before confirmation
- **Slippage control** — presets + custom slippage input
- **Swap history** — full transaction log with LI.FI explorer links
- **Price impact warnings** — automatic alerts on high-loss swaps
- **Mobile responsive** — works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Wallet | wagmi v2 + RainbowKit |
| Swap Routing | LI.FI REST API |
| Limit Orders | deBridge DLN API |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |
| Language | TypeScript |
| Treasury | 2-of-2 Safe Multisig |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page + swap interface |
| `/limit-orders` | Cross-chain limit orders via deBridge DLN |
| `/points` | Points leaderboard + referral system |
| `/refuel` | Gas refuel across chains |
| `/widget` | Embeddable swap widget |
| `/docs` | Partner integration docs |
| `/analytics` | Live protocol analytics dashboard |

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

## Fee Structure

MultiMesh charges **0.15%** (15bps) per swap. Fees go directly to the MultiMesh 2-of-2 Safe multisig treasury on Ethereum mainnet.

Treasury: `0x4070665b35b032A27413dd19BEB5C81b687e28A8`

---

## License

MIT
