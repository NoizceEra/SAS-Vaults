# 🍰 Slice (on Solana)
> **Powered by the Solana Auto-Savings (SAS) Protocol**

> A decentralized auto-savings protocol on Solana that automatically saves a configurable percentage of every SOL transfer to a secure, non-custodial PDA vault, with optional token swap integration.

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.29.0-blueviolet)](https://www.anchor-lang.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Current Status](#current-status)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Program Instructions](#program-instructions)
- [Security](#security)
- [Contributing](#contributing)

---

## 🎯 Overview

The Solana Auto-Savings Protocol enables users to automatically save a portion of their SOL with every transaction. Built on Solana using the Anchor framework, it provides:

- **Non-custodial savings** via Program Derived Addresses (PDAs)
- **Configurable savings rates** (1-90% of each transaction)
- **Manual deposit/withdrawal** functionality
- **Token swap integration** (Phase 1 - In Progress)
- **Auto-swap to stablecoins** (Phase 2 - Planned)

---

## ✨ Features

### Core Features (Live)
- ✅ **PDA-based Vaults** - Secure, non-custodial savings storage
- ✅ **Configurable Savings Rate** - Set your own percentage (1-90%)
- ✅ **Manual Deposits** - Add SOL to your savings anytime
- ✅ **Flexible Withdrawals** - Access your funds whenever needed
- ✅ **Treasury Management** - Platform fee collection (0.4%)
- ✅ **Real-time Dashboard** - Track savings, spending, and wallet balances

### Swap Features (Phase 1 - In Progress)
- 🔄 **Token Vault Management** - Multi-token support (USDC, USDT, BONK)
- 🔄 **Manual Swaps** - Convert SOL to SPL tokens
- 🔄 **Auto-Swap Configuration** - Set thresholds for automatic conversion
- ⏳ **Jupiter Integration** - Best price execution (Phase 2)

### Planned Features (Phase 2)
- 📅 Jupiter Aggregator integration for optimal swap rates
- 📅 Yield-bearing token support (jSOL, mSOL)
- 📅 Advanced analytics and reporting
- 📅 Mobile app support

---

## 🚦 Current Status

**Deployment Status:** ✅ **LIVE ON MAINNET-BETA**  
**Last Updated:** February 10, 2026

### Recent Progress
- ✅ Optimized smart contract for Mainnet (Minimal version)
- ✅ **Successfully deployed to Solana Mainnet-Beta!**
- ✅ Frontend configured for Mainnet using Chainstack RPC
- ✅ Automated savings protocol is active

### Program Information (Mainnet)
**Program ID:** `FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn`  
**Network:** Mainnet-Beta  
**Explorer:** [View on Solana Explorer](https://explorer.solana.com/address/FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn)

### Next Steps
- [x] Program Deployed to Mainnet
- [x] Frontend Configuration Updated
- [ ] Final Treasury Initialization (Pending 1.5 SOL for upgrade)
- [ ] Vercel UI Deployment


---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 with Vite
- Solana Wallet Adapter
- Anchor Client SDK
- TailwindCSS for styling
- Recharts for analytics

**Smart Contract**
- Anchor Framework 0.29.0
- Solana Program Library (SPL)
- Token Program integration
- Associated Token Program

**Infrastructure**
- Solana Devnet (current)
- Solana Mainnet (planned)
- Vercel deployment (frontend)

### System Design

```
┌─────────────────┐
│   React App     │
│  (Frontend UI)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Wallet Adapter │
│   (Phantom,     │
│   Solflare)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Anchor Client  │
│   (TypeScript)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Solana Auto-Savings Program   │
│         (Rust/Anchor)            │
├─────────────────────────────────┤
│ • User Config PDAs              │
│ • SOL Vault PDAs                │
│ • Token Vault PDAs              │
│ • Treasury PDA                  │
│ • Swap Instructions             │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Solana Network │
│    (Devnet)     │
└─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Rust** 1.70+ ([Install](https://rustup.rs/))
- **Solana CLI** 1.18+ ([Install](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor** 0.29+ ([Install](https://www.anchor-lang.com/docs/installation))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SAS
```

2. **Install dependencies**
```bash
# Install Node dependencies
npm install

# Install Rust dependencies (if needed)
cargo build
```

3. **Configure Solana CLI**
```bash
# Set to Devnet
solana config set --url devnet

# Create/import wallet
solana-keygen new

# Get airdrop (Devnet only)
solana airdrop 2
```

### Build & Test

```bash
# Build the Solana program
anchor build

# Run tests
anchor test

# Start frontend dev server
cd frontend
npm run dev
```

### Deployment

For detailed deployment instructions, see:
- [`DEPLOY_SWAP_FEATURE.md`](DEPLOY_SWAP_FEATURE.md) - Current deployment guide
- [`NEXT_STEPS_AFTER_FUNDING.md`](NEXT_STEPS_AFTER_FUNDING.md) - Resumption plan

**Quick Deploy:**
```bash
# Deploy to Devnet
anchor deploy --provider.cluster devnet

# Update Program ID in lib.rs and Anchor.toml
# Rebuild and redeploy
anchor build
anchor deploy --provider.cluster devnet
```

---

## 📚 Documentation

### Core Documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system design
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Codebase organization
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions

### Feature Documentation
- **[SWAP_INTEGRATION_PLAN.md](SWAP_INTEGRATION_PLAN.md)** - Token swap roadmap
- **[PLATFORM_FEATURES.md](PLATFORM_FEATURES.md)** - Feature specifications
- **[PLATFORM_FEE_GUIDE.md](PLATFORM_FEE_GUIDE.md)** - Fee structure details

### Deployment & Operations
- **[DEPLOY_SWAP_FEATURE.md](DEPLOY_SWAP_FEATURE.md)** - Current deployment status
- **[NEXT_STEPS_AFTER_FUNDING.md](NEXT_STEPS_AFTER_FUNDING.md)** - Next deployment steps
- **[INTEGRATION.md](INTEGRATION.md)** - Integration guide for developers

### User Documentation
- **[USER_GUIDE.md](USER_GUIDE.md)** - End-user instructions

---

## 🔧 Program Instructions

### Core Instructions

#### `initialize_user(savings_rate: u8)`
Creates a user's savings configuration and PDA vault.
- **Parameters:** `savings_rate` (1-90)
- **Accounts:** User, UserConfig PDA, Vault PDA, System Program

#### `update_savings_rate(new_rate: u8)`
Updates the user's automatic savings percentage.
- **Parameters:** `new_rate` (1-90)
- **Accounts:** User, UserConfig PDA

#### `deposit(amount: u64)`
Manually deposits SOL from wallet to savings vault.
- **Parameters:** `amount` (in lamports)
- **Accounts:** User, UserConfig PDA, Vault PDA, Treasury PDA

#### `withdraw_sol(amount: u64)`
Withdraws SOL from vault back to wallet.
- **Parameters:** `amount` (in lamports)
- **Accounts:** User, UserConfig PDA, Vault PDA, Treasury PDA

#### `process_transfer(transfer_amount: u64)`
Automatically intercepts transfers and saves the configured percentage.
- **Parameters:** `transfer_amount` (in lamports)
- **Accounts:** User, UserConfig PDA, Vault PDA

### Swap Instructions (Phase 1)

#### `initialize_token_vault(mint: Pubkey)`
Creates a token vault for a specific SPL token.
- **Parameters:** `mint` (token mint address)
- **Accounts:** User, TokenVaultConfig PDA, Token Account, Mint

#### `set_auto_swap(enabled: bool, target_token: Pubkey, min_amount: u64)`
Configures automatic swap settings.
- **Parameters:** `enabled`, `target_token`, `min_amount`
- **Accounts:** User, UserConfig PDA

#### `swap_to_token(amount_in: u64, min_amount_out: u64)`
Swaps SOL to an SPL token (Jupiter integration pending).
- **Parameters:** `amount_in`, `min_amount_out`
- **Accounts:** User, Vault PDA, Token Vault, Token Program

#### `withdraw_token(amount: u64)`
Withdraws SPL tokens from token vault.
- **Parameters:** `amount` (in token units)
- **Accounts:** User, TokenVaultConfig PDA, Token Account

### Treasury Instructions

#### `initialize_treasury()`
One-time initialization of the protocol treasury (admin only).

#### `withdraw_treasury(amount: u64)`
Withdraws collected fees from treasury (admin only).

---

## 🔐 Security

### Security Features
- ✅ **Non-custodial** - Users maintain full control via PDAs
- ✅ **Atomic transactions** - Savings occur in the same block
- ✅ **Authority checks** - All instructions verify user ownership
- ✅ **Slippage protection** - Minimum output amounts enforced
- ✅ **Auditable** - All logic is on-chain and transparent

### Fee Structure
- **Platform Fee:** 0.4% on deposits and withdrawals
- **Swap Fee:** 0.4% (when swapping SOL to tokens)
- **No hidden fees** - All fees are transparent and on-chain

### Best Practices
- Always verify Program IDs before transactions
- Use hardware wallets for large amounts
- Test on Devnet before Mainnet
- Keep your wallet seed phrase secure
- Review transaction details before signing

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
- Write tests for new features
- Follow Rust and TypeScript style guides
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Documentation:** See `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/your-org/SAS/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/SAS/discussions)
- **Solana Docs:** [docs.solana.com](https://docs.solana.com)
- **Anchor Docs:** [anchor-lang.com](https://www.anchor-lang.com/)

---

## 📞 Support

For questions and support:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an issue on GitHub
- Join our Discord community (link TBD)

---

**Built with ❤️ on Solana**
