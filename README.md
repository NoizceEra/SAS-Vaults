# 🍰 Slice (on Solana)
> **Powered by the SLICE Core Protocol**

> A decentralized, minimalist auto-savings protocol on Solana. Secure, non-custodial, and optimized for maximum deployment affordability.

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.29.0-blueviolet)](https://www.anchor-lang.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚦 Current Status: **Minimalist Core Refactor**

The SLICE protocol has been refactored into its **Minimalist Core**. This version focuses on the essential "Saving" logic, removing complex dependencies like Jupiter Swaps to ensure a clean, efficient, and affordable mainnet presence.

**Deployment Cost Estimate:** ~0.42 SOL (~$63 at $150/SOL)

---

## ✨ Features

- ✅ **Core Logic**: "Connect -> Activate -> Save" flow.
- ✅ **Secure Vaults**: Each user gets a private, non-custodial PDA vault.
- ✅ **Wallet Support**: Native support for Phantom, Solflare, and other Solana wallets.
- ✅ **Fee Collection**: Sustainable 0.4% platform fee on all savings actions.
- ✅ **Optimized Binary**: Stripped of debug symbols and unused logic for minimum rent cost.

---

## 🏗️ Architecture (Minimalist)

### Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Solana Wallet Adapter.
- **Smart Contract**: Anchor 0.29.0, Rust, Optimized for SBF.

---

## 🔧 Program Instructions

#### `activate_user()`
One-time activation to create your secure savings vault.
- **Accounts:** User, UserConfig PDA, Vault PDA, System Program

#### `save_sol(amount: u64)`
Moves SOL from your wallet to your secure vault, taking a 0.4% protocol fee.
- **Accounts:** User, UserConfig, Vault, TreasuryConfig, TreasuryVault

#### `withdraw_sol(amount: u64)`
Withdraws your savings back to your main wallet instantly.
- **Accounts:** User, UserConfig, Vault, TreasuryConfig, TreasuryVault

---

## 🚀 Getting Started

1. **Connect Wallet**
2. **Activate Protocol** (Creates your secure vault)
3. **Start Saving**

---

## 📄 License
MIT License.

---

**Built with ❤️ for the Solana Community**
