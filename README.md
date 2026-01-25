# Solana Auto-Savings Protocol (SAS)

## Overview
A decentralized auto-savings protocol on Solana that automatically saves a configurable percentage of every SOL transfer to a secure, non-custodial PDA vault.

## Architecture

### Frontend
- React-based UI with real-time SOL price tracking
- Wallet integration for Solana
- Manual deposit/withdrawal functionality
- Configurable savings rate (1-90%)
- Transaction history tracking

### Backend (Solana Program)
- **Program Type**: Anchor Framework Smart Contract
- **Network**: Solana Devnet/Mainnet
- **Key Features**:
  - PDA-based vault system (non-custodial)
  - Configurable savings rates per user
  - Atomic transfer interception
  - Manual deposit/withdrawal instructions
  - Yield integration ready (liquid staking)

## Project Structure

```
SAS/
├── frontend/                 # React frontend (existing)
│   └── src/
│       └── App.jsx          # Main UI component
├── programs/                 # Solana smart contracts
│   └── auto-savings/
│       └── src/
│           └── lib.rs       # Main program logic
├── tests/                    # Integration tests
├── migrations/              # Deployment scripts
└── Anchor.toml              # Anchor configuration
```

## Getting Started

### Prerequisites
- Node.js 16+
- Rust 1.70+
- Solana CLI 1.18+
- Anchor Framework 0.29+

### Installation

1. Install Solana CLI:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

2. Install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

3. Install dependencies:
```bash
npm install
```

### Build & Deploy

```bash
# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Program Instructions

### 1. Initialize User
Creates a user's savings configuration and PDA vault.

### 2. Update Savings Rate
Updates the user's automatic savings percentage (1-90%).

### 3. Deposit
Manually deposits SOL from wallet to PDA vault.

### 4. Withdraw
Withdraws SOL from PDA vault back to wallet.

### 5. Process Transfer (Hook)
Automatically intercepts transfers and saves the configured percentage.

## Security Features
- Non-custodial: Users maintain full control via PDAs
- Atomic transactions: Savings occur in the same block
- No protocol fees (0% fee structure)
- Auditable on-chain logic

## Integration Guide

See `Backend Integration Guide.pdf` for detailed integration instructions.

## License
MIT
