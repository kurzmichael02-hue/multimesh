<div align="center">

<img src="public/logo.jpg" width="80" height="80" style="border-radius: 50%" />

# MultiMesh

**Cross-chain swap aggregator. Any token, any chain, one click.**

[![Live](https://img.shields.io/badge/Live-themultimesh.com-818CF8?style=flat-square&logo=vercel&logoColor=white)](https://themultimesh.com)
[![Analytics](https://img.shields.io/badge/Analytics-live-22C55E?style=flat-square)](https://themultimesh.com/analytics)
[![License](https://img.shields.io/badge/License-MIT-818CF8?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Twitter](https://img.shields.io/badge/Twitter-@MultiMeshXYZ-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/MultiMeshXYZ)

</div>

---

## What is MultiMesh?

Most cross-chain swaps fail, overcharge, or under-deliver because they check one bridge and call it done. MultiMesh scans **20+ bridges and DEXes simultaneously** to find the optimal route — cheapest, fastest, or safest — then executes in one transaction.

Live on mainnet since Q1 2026. Non-custodial. Open source.

---

## Why MultiMesh?

The DeFi multi-chain landscape is fragmented. Users have to manually compare Hop, Stargate, Across, and dozens of DEXes to find a decent rate — and still don't know if they picked the right one.

MultiMesh fixes this by aggregating everything in one place:

- **Find the best route** — not just a route, the *best* one
- **Cross-chain limit orders** — set a price, we execute when the market hits it. No competitor offers this cross-chain.
- **Gas refuel built-in** — need ETH on Arbitrum? Done in one click.
- **B2B widget** — embed MultiMesh in your app in 3 lines of code
- **Points for early users** — OG rewards redeemable at token launch

---

## Features

| Feature | Description |
|---|---|
| **Cross-chain swaps** | ETH, Polygon, BNB Chain, Arbitrum, Optimism, Base |
| **Route aggregation** | 20+ bridges and DEXes scanned simultaneously via LI.FI |
| **Cross-chain limit orders** | Target price execution across chains via deBridge DLN |
| **Gas Refuel** | Bridge native gas tokens in one click |
| **Embeddable widget** | 3-line integration for any DeFi app |
| **Points & referrals** | 100 pts per $1 swap fee, +25% referral bonus |
| **Swap history** | Full tx log with LI.FI explorer links |
| **Risk labels** | Fee, time, and risk level before confirmation |
| **Price impact warnings** | Automatic alerts on high-loss routes |
| **Analytics dashboard** | Live protocol stats, volume, routes |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User / Wallet                           │
│              wagmi v2 · RainbowKit · MetaMask              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Next.js 14 Frontend                         │
│            TypeScript · App Router · Vercel                │
└─────────┬────────────────────────────────────┬──────────────┘
          │                                    │
┌─────────▼──────────┐              ┌──────────▼──────────────┐
│     LI.FI API      │              │    deBridge DLN API     │
│  20+ bridges/DEXes │              │  Cross-chain limit      │
│  Route optimization│              │  orders & settlement    │
└─────────┬──────────┘              └──────────┬──────────────┘
          │                                    │
┌─────────▼────────────────────────────────────▼──────────────┐
│                    EVM Chains                               │
│         ETH · Polygon · BNB · Arbitrum · OP · Base         │
└─────────────────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────┐
│            Next.js API Routes + Supabase                   │
│      Points system · Swap tracking · Referrals             │
└────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
git clone https://github.com/kurzmichael02-hue/multimesh
cd multimesh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Widget Integration

Embed a full cross-chain swap interface in any app:

```html
<div id="multimesh-widget"></div>
<script src="https://themultimesh.com/multimesh-widget.js"></script>
<script>
  MultiMesh.init({
    container: '#multimesh-widget',
    integrator: 'your-app-name',
    theme: 'dark',
    accent: '#6366F1'
  })
</script>
```

Full docs at [themultimesh.com/docs](https://themultimesh.com/docs). Revenue share available for high-volume integrators.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page + swap interface |
| `/limit-orders` | Cross-chain limit orders via deBridge DLN |
| `/points` | Points leaderboard + referral system |
| `/refuel` | Gas refuel across chains |
| `/widget` | Embeddable swap widget demo |
| `/docs` | Integration documentation |
| `/analytics` | Live protocol analytics |

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

## Protocol Info

- **Fee:** 0.15% per swap (15bps)
- **Treasury:** `0x4070665b35b032A27413dd19BEB5C81b687e28A8` (2-of-2 Safe, Ethereum mainnet)
- **Non-custodial:** MultiMesh never holds user funds
- **Open source:** MIT License

---

## Links

| | |
|---|---|
| App | [themultimesh.com](https://themultimesh.com) |
| Analytics | [themultimesh.com/analytics](https://themultimesh.com/analytics) |
| Widget Docs | [themultimesh.com/docs](https://themultimesh.com/docs) |
| Twitter | [@MultiMeshXYZ](https://twitter.com/MultiMeshXYZ) |
| Telegram | [t.me/multi_mesh](https://t.me/multi_mesh) |
| GitHub | [kurzmichael02-hue/multimesh](https://github.com/kurzmichael02-hue/multimesh) |

---

## License

MIT
