# MultiMesh

Cross-chain swap aggregator — swap any token across Ethereum, Polygon, and BNB Chain in a single flow.

## The Problem

Moving assets between blockchains today means juggling multiple bridges, switching wallets, and executing several transactions manually. It's slow, expensive, and easy to mess up — especially for users who aren't deeply technical.

## The Solution

MultiMesh abstracts all of that. Connect your wallet, pick your source and destination chain, enter an amount, and get the best available route with real fees and execution time — in one place.

## Tech Stack

- Frontend: Next.js 14, TailwindCSS
- Wallet: wagmi v2, RainbowKit
- Routing: LI.FI API
- Deployed on: Vercel

## Architecture

```
[Browser / Wallet]
       ↓
[Next.js Frontend]
       ↓
[LI.FI REST API — route aggregation]
       ↓
[Bridge & DEX protocols — Relay, cross-chain execution]
```

## Getting Started

```bash
git clone https://github.com/kurzmichael02-hue/multimesh
cd multimesh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- [x] Wallet connection (MetaMask, WalletConnect)
- [x] Cross-chain route fetching via LI.FI
- [x] Fee, execution time, and risk label per route
- [x] Transaction simulation (Pending → Bridging → Swapping → Done)
- [ ] Real on-chain swap execution
- [ ] Gas abstraction
- [ ] More chains (Arbitrum, Optimism, Base)
- [ ] MEV protection

## Supported Networks (MVP)

- Ethereum
- Polygon
- BNB Chain

## Live Demo

[multimesh.vercel.app](https://multimesh.vercel.app)
