# AVAXVERSE – Project Specification Prompt

**Copy and paste this prompt when ready to build:**

---

## Project: AVAXVERSE – Avalanche Web3 Super App

### 1. Problem Statement
Web3 adoption is slowed by ecosystem fragmentation and lack of unified trust infrastructure. Users must navigate separate platforms for identity, freelancing, payments, DeFi, and governance. Reputation is not portable, escrow is inconsistent, and trust between anonymous wallets is fragile.

### 2. Proposed Solution
AVAXVERSE is a unified on-chain operating layer that integrates identity, trust, work, finance, and governance into one seamless ecosystem on Avalanche C-Chain.

### 3. Core Features (Scope for Build)

**Phase 1 – Foundation:**
- [ ] On-chain identity system (verifiable credentials, profile DID)
- [ ] Reputation/achievement tracking (portable across platform)
- [ ] Freelance marketplace with smart contract escrow

**Phase 2 – Governance & Economy:**
- [ ] DAO governance (proposals, voting, delegation)
- [ ] In-platform tokenomics (utility token or reuse AVAX)

**Phase 3 – Future (Not Now):**
- [ ] DeFi integrations
- [ ] AI assistant

### 4. Technical Stack
- **Blockchain:** Avalanche C-Chain (EVM)
- **Smart Contracts:** Solidity + Hardhat/Foundry
- **Frontend:** Next.js, React, Tailwind CSS
- **Web3:** wagmi, viem, rainbowkit
- **Storage:** IPFS/Arweave (for profile data)
- **Indexing:** The Graph or similar

### 5. Smart Contract Architecture

**Contracts Needed:**
1. `IdentityRegistry` – User profiles, DIDs, verification levels
2. `ReputationToken` – Soulbound token for achievements/skills
3. `EscrowFactory` – Manages freelance job escrows
4. `Escrow` – Individual job payment contracts
5. `GovernanceToken` – DAO voting power token
6. `Governor` – Proposal and voting logic
7. `Treasury` – Funds management for DAO

### 6. User Flows

**Identity Flow:**
1. User connects wallet
2. Claims DID (e.g., `did:avax:0x...`)
3. Adds profile info (name, skills, bio)
4. Verifies identity (optional: social, KYC)
5. Receives base reputation score

**Freelance Flow:**
1. Client posts job with payment in AVAX/USDC
2. Freelancer applies
3. Client selects, funds escrow
4. Work submitted → client approves
5. Funds released to freelancer

**Governance Flow:**
1. Token holders delegate voting power
2. Proposals submitted with AVAX deposit
3. Voting period (7 days)
4. Execution if passed

### 7. Security Considerations
- Escrow: Client must approve release; dispute mechanism needed
- Identity: Sybil resistance via verification levels
- Governance: Quorum requirements, vote manipulation prevention

### 8. Success Metrics
- Number of registered identities
- Number of escrows completed
- DAO participation rate (voter turnout)
- Average reputation score growth

### 9. Deliverables Expected
1. Smart contracts (tested on Avalanche Fuji testnet)
2. Frontend application (deployed to Vercel)
3. Documentation (README, API docs)

### 10. Build Order Preference
- Start with identity + escrow (foundation)
- Then add reputation
- Then DAO governance
- Skip DeFi and AI for MVP

---

**Ready to build? Provide this prompt and I'll start implementing.**
