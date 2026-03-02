# ⬡ AVAXVERSE

**A unified on-chain operating layer for identity, freelance work, and governance on Avalanche.**

[![CI](https://github.com/YOUR_USERNAME/AVAXVERSE/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/AVAXVERSE/actions/workflows/ci.yml)

---

## 🏗️ Project Structure

```
AVAXVERSE/
├── apps/
│   └── web/              # Next.js 15 frontend (Tailwind, Wagmi, RainbowKit)
└── packages/
    └── contracts/        # Hardhat smart contracts (Solidity 0.8.26, OpenZeppelin v5)
```

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Avalanche C-Chain (EVM) |
| Smart Contracts | Solidity 0.8.26 + Hardhat + OpenZeppelin v5 |
| Frontend | Next.js 15 + Tailwind CSS 4 |
| Web3 | Wagmi v3 + Viem v2 + RainbowKit v2 |
| Runtime | **Bun** |
| CI/CD | GitHub Actions |

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) ≥ 1.2
- [MetaMask](https://metamask.io) with Avalanche Fuji testnet added

### Install
```bash
# From root
bun install
```

### Smart Contracts
```bash
cd packages/contracts

# Compile
bun run compile

# Test (10 tests, ~1s)
bun run test

# Deploy locally
bun run deploy:local

# Deploy to Fuji testnet
cp .env.example .env   # fill in DEPLOYER_PRIVATE_KEY
bun run deploy:fuji
```

### Frontend
```bash
cd apps/web

cp .env.example .env.local   # fill in contract addresses after deployment
bun run dev                  # http://localhost:3000
```

## 📜 Smart Contracts

| Contract | Description |
|---|---|
| `IdentityRegistry` | On-chain DID profiles (one per wallet) with reputation tracking |
| `ReputationToken` | Soulbound ERC-721 (ERC-5192) achievement NFT |
| `Escrow` | Individual job escrow with full state machine + dispute resolution |
| `EscrowFactory` | Factory + job registry + auto-reward on completion |

### Escrow State Machine
```
FUNDED → SUBMITTED → APPROVED → RELEASED
                  ↘  DISPUTED → mediator resolves → RELEASED / REFUNDED
```

## 🌐 Frontend Pages

| Route | Description |
|---|---|
| `/` | Marketplace landing with hero, stats, and features |
| `/profile` | Register or view your on-chain DID profile |
| `/jobs` | Browse all jobs, post a new job, manage your escrows |

## 🔐 Security

- **ReentrancyGuard** on all funds-releasing functions
- **Soulbound tokens** — transfer reverts with custom error
- **Authorized updater** pattern — only whitelisted contracts modify reputation
- **Platform fee** capped at 10% in code

## 📄 Environment Variables

### `packages/contracts/.env`
| Variable | Description |
|---|---|
| `DEPLOYER_PRIVATE_KEY` | Wallet private key for deployment |
| `FUJI_RPC_URL` | Fuji testnet RPC (default: public endpoint) |
| `SNOWTRACE_API_KEY` | For contract verification on Snowtrace |

### `apps/web/.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | From [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_IDENTITY_REGISTRY` | Deployed `IdentityRegistry` address |
| `NEXT_PUBLIC_REPUTATION_TOKEN` | Deployed `ReputationToken` address |
| `NEXT_PUBLIC_ESCROW_FACTORY` | Deployed `EscrowFactory` address |

## 🧪 Tests

```
IdentityRegistry
  ✔ allows a user to register a profile
  ✔ prevents double registration
  ✔ allows updating metadata URI
  ✔ only authorized updaters can increment reputation

ReputationToken
  ✔ owner can mint to a user
  ✔ tokens are soulbound — transfers revert
  ✔ locked() always returns true

EscrowFactory → Escrow
  ✔ creates a job escrow and tracks it
  ✔ full happy path: fund → submit → approve → release
  ✔ dispute flow: mediator can resolve to freelancer

10 passing (~1s)
```

## 📅 Roadmap

- [x] Identity Registry + DIDs
- [x] Soulbound Reputation Tokens
- [x] Escrow + Dispute Resolution
- [x] Freelance Marketplace UI
- [ ] Deploy to Fuji Testnet
- [ ] DAO Governance (Phase 2)
- [ ] IPFS/Arweave Profile Storage

---

**AVAXVERSE — Stage 2 Prototype | Avalanche Hackathon 2026**
