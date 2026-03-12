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

### 3. Sync addresses to frontend
```bash
# For Fuji:
npm run sync-env:fuji

# For Localhost:
npm run sync-env:local
```
This updates your `apps/web/.env.local` so you can test the and verify the deployment locally before redeploying to Vercel.

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

## Upgrading Contracts (KEEP DATA)

If you have already deployed and want to update the logic **without losing your data (profiles, reputation, etc.)**, you must run an upgrade instead of a redeploy.

```bash
# 1. Update your contract code in packages/contracts/contracts/

# 2. Run tests to ensure logic is safe
cd packages/contracts && npm run test

# 3. Upgrade existing contracts (Fuji)
npm run upgrade:fuji
```

This will deploy new logic contracts but keep the **same proxy addresses** listed in `fuji.json`. Your data remains intact.

---

## Fresh Redeployment (WIPE DATA)

Use this only if you want to clear all data and start with new contract addresses.

```bash
# 1. Redeploy contracts
cd packages/contracts
npm run deploy:fuji

# 2. Update frontend env with new addresses
npm run sync-env:fuji
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

## Avalanche Mainnet Deployment

Deploying to Mainnet requires real AVAX and extreme caution. **Downtime and data loss are not acceptable on Mainnet.**

### 1. Configure Private Key
Ensure `packages/contracts/.env` has a private key with sufficient AVAX.

### 2. First-Time Deployment (Genesis)
```bash
cd packages/contracts
npm run deploy:mainnet
```

### 3. Upgrading (Data Persistence)
**DO NOT REDEPLOY ON MAINNET.** Use the upgrade command to keep all user profiles and reputation.
```bash
cd packages/contracts
npm run upgrade:mainnet
```

### 4. Verification
Verify your contracts on Snowtrace so users can interact with them.
```bash
npx hardhat verify --network mainnet [CONTRACT_ADDRESS]
```

---

## Disaster Recovery & Rollbacks (MAINNET SAFETY)

If an upgrade introduces a bug on Mainnet, you can roll back to the previous stable version **without losing user data**.

### Method 1: Code Revert (Recommended)
1. Git checkout the last stable commit: `git checkout [stable-hash]`
2. Run the upgrade command: `npm run upgrade:mainnet`

### Method 2: Emergency Manual Rollback
If you need to quickly point your proxy back to a previous logic address:
1. Edit `scripts/rollback.ts` and set the `previousImplementation` address.
2. Run: `npm run rollback:mainnet`

---

Chain ID: `43114` (Mainnet) | `43113` (Fuji)
