# AVAXVERSE Deployment Guide

## Prerequisites

- Node.js 18+ and npm installed
- A funded wallet on Avalanche Fuji (get AVAX from [faucet.avax.network](https://faucet.avax.network))
- A Snowtrace API key (for contract verification — optional)

---

## Environment Setup

### Backend (`packages/contracts/.env`)
```env
DEPLOYER_PRIVATE_KEY=0xyour_private_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here   # optional
```

### Frontend (`apps/web/.env.local`) — auto-updated after deployment
```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_IDENTITY_REGISTRY=
NEXT_PUBLIC_REPUTATION_TOKEN=
NEXT_PUBLIC_ESCROW_FACTORY=
NEXT_PUBLIC_AVAX_TOKEN=
NEXT_PUBLIC_AVAX_GOVERNOR=
```

---

## First-Time Deployment

### 1. Install dependencies
```bash
npm install
```

### 2. Deploy contracts to Fuji
```bash
cd packages/contracts
npm run deploy:fuji
```
Addresses are saved to `packages/contracts/deployments/fuji.json`.

### 3. Update frontend env
```bash
bun run ts-node scripts/update-env.ts
```
This auto-populates `apps/web/.env.local` with the deployed addresses.

### 4. Deploy to Vercel
Add the following environment variables to your **Vercel project settings**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_NETWORK` | `testnet` |
| `NEXT_PUBLIC_IDENTITY_REGISTRY` | *(from fuji.json)* |
| `NEXT_PUBLIC_REPUTATION_TOKEN` | *(from fuji.json)* |
| `NEXT_PUBLIC_ESCROW_FACTORY` | *(from fuji.json)* |
| `NEXT_PUBLIC_AVAX_TOKEN` | *(from fuji.json)* |
| `NEXT_PUBLIC_AVAX_GOVERNOR` | *(from fuji.json)* |

Then trigger a new deployment on Vercel.

---

## Redeployment (After Contract Changes)

```bash
# 1. Run tests to make sure nothing is broken
cd packages/contracts && npm run test

# 2. Redeploy contracts
npm run deploy:fuji

# 3. Update frontend env with new addresses
bun run ts-node scripts/update-env.ts
```

Then update your Vercel environment variables with the new addresses from `fuji.json` and **Redeploy** on Vercel.

---

## Local Development

```bash
# Terminal 1 — Start local Hardhat node
cd packages/contracts && npx hardhat node

# Terminal 2 — Deploy contracts locally
cd packages/contracts && npm run deploy:local

# Terminal 3 — Start the frontend
cd apps/web && npm run dev
```

> Set `NEXT_PUBLIC_NETWORK=localhost` in `apps/web/.env.local` for local dev.

---

Chain ID: `43113` | Network: Avalanche Fuji Testnet
