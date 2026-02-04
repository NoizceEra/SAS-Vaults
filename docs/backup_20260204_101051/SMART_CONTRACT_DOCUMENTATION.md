# 🏦 Solana Auto-Savings Protocol - Smart Contract Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Account Structures](#account-structures)
4. [Instructions (Functions)](#instructions-functions)
5. [Platform Economics](#platform-economics)
6. [Security Features](#security-features)
7. [Usage Examples](#usage-examples)
8. [Integration Guide](#integration-guide)

---

## 🎯 Overview

The Solana Auto-Savings Protocol is a decentralized savings platform built on Solana that allows users to:
- Create personal savings vaults
- Set custom savings rates (percentage of deposits to save)
- Automatically split deposits between spending and savings
- Withdraw funds at any time
- Earn platform rewards through a fee-sharing mechanism

**Key Features:**
- ✅ Non-custodial (users always control their funds)
- ✅ Automated savings logic (set-and-forget)
- ✅ Flexible savings rates (0-100%)
- ✅ Instant withdrawals
- ✅ Low platform fee (0.4%)
- ✅ Built on Solana (fast & cheap transactions)

---

## 🏗️ Architecture

### Program Design Pattern
The protocol uses **Program Derived Addresses (PDAs)** to create deterministic, user-specific vault accounts.

```
User Wallet → Creates Vault (PDA) → Deposits SOL → Auto-splits to Savings/Spending
                                   ↓
                            Platform Fee (0.4%)
```

### Account Hierarchy
```
┌─────────────────────────────────────┐
│   Platform Treasury (PDA)           │
│   - Collects 0.4% fees              │
│   - Controlled by program           │
└─────────────────────────────────────┘
              ↑
              │ (fees)
              │
┌─────────────────────────────────────┐
│   User Vault (PDA per user)         │
│   - Savings balance                 │
│   - Spending balance                │
│   - Savings rate (%)                │
│   - Owner (user's public key)       │
└─────────────────────────────────────┘
```

---

## 📊 Account Structures

### 1. **SavingsVault** (User Account)
Each user has one vault account (PDA) that stores their savings data.

```rust
pub struct SavingsVault {
    pub owner: Pubkey,              // User's wallet address
    pub savings_balance: u64,       // Amount in savings (lamports)
    pub spending_balance: u64,      // Amount in spending (lamports)
    pub savings_rate: u8,           // Percentage to save (0-100)
    pub total_deposited: u64,       // Lifetime deposits (lamports)
    pub total_withdrawn: u64,       // Lifetime withdrawals (lamports)
    pub created_at: i64,            // Unix timestamp
    pub last_deposit_at: i64,       // Last deposit timestamp
    pub bump: u8,                   // PDA bump seed
}
```

**Field Descriptions:**
- **owner**: The wallet that controls this vault
- **savings_balance**: SOL locked in savings (in lamports, 1 SOL = 1,000,000,000 lamports)
- **spending_balance**: SOL available for immediate use
- **savings_rate**: Percentage of deposits automatically saved (0-100)
- **total_deposited**: Cumulative deposits for analytics
- **total_withdrawn**: Cumulative withdrawals for analytics
- **created_at**: When the vault was initialized
- **last_deposit_at**: Last deposit time (for tracking activity)
- **bump**: PDA derivation bump seed

**Account Size:** 113 bytes

**PDA Derivation:**
```rust
seeds = [b"savings_vault", user_wallet.key().as_ref()]
```

---

### 2. **PlatformTreasury** (Global Account)
Single account that collects platform fees.

```rust
pub struct PlatformTreasury {
    pub authority: Pubkey,          // Platform admin
    pub total_fees_collected: u64,  // Lifetime fees (lamports)
    pub bump: u8,                   // PDA bump seed
}
```

**Field Descriptions:**
- **authority**: Wallet authorized to withdraw fees
- **total_fees_collected**: Total fees earned by the platform
- **bump**: PDA derivation bump seed

**Account Size:** 41 bytes

**PDA Derivation:**
```rust
seeds = [b"platform_treasury"]
```

---

## 🔧 Instructions (Functions)

### 1. **initialize_vault**
Creates a new savings vault for a user.

**Parameters:**
- `savings_rate: u8` - Initial savings rate (0-100)

**Accounts Required:**
- `user` (signer, writable) - User's wallet
- `vault` (writable) - Vault PDA to create
- `system_program` - Solana system program

**Logic:**
1. Derives vault PDA from user's public key
2. Creates vault account with rent-exempt balance
3. Initializes vault with user as owner
4. Sets savings rate
5. Records creation timestamp

**Example Usage:**
```javascript
await program.methods
  .initializeVault(50) // 50% savings rate
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

**Errors:**
- `InvalidSavingsRate` - Rate not between 0-100

---

### 2. **deposit**
Deposits SOL into the vault and automatically splits it based on savings rate.

**Parameters:**
- `amount: u64` - Amount to deposit (in lamports)

**Accounts Required:**
- `user` (signer, writable) - User's wallet
- `vault` (writable) - User's vault PDA
- `treasury` (writable) - Platform treasury PDA
- `system_program` - Solana system program

**Logic:**
1. Validates deposit amount > 0
2. Calculates platform fee (0.4% of deposit)
3. Calculates savings amount (savings_rate % of remaining)
4. Calculates spending amount (remainder)
5. Transfers SOL from user to vault
6. Transfers platform fee to treasury
7. Updates vault balances
8. Updates analytics counters

**Fee Calculation:**
```rust
platform_fee = amount * 4 / 1000  // 0.4%
remaining = amount - platform_fee
savings_amount = remaining * savings_rate / 100
spending_amount = remaining - savings_amount
```

**Example:**
```
Deposit: 1 SOL (1,000,000,000 lamports)
Platform Fee: 0.004 SOL (4,000,000 lamports)
Remaining: 0.996 SOL (996,000,000 lamports)

If savings_rate = 50%:
  Savings: 0.498 SOL (498,000,000 lamports)
  Spending: 0.498 SOL (498,000,000 lamports)
```

**Example Usage:**
```javascript
await program.methods
  .deposit(new BN(1_000_000_000)) // 1 SOL
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
    treasury: treasuryPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

**Errors:**
- `InvalidAmount` - Amount is 0
- `InsufficientFunds` - User doesn't have enough SOL

---

### 3. **withdraw**
Withdraws SOL from savings or spending balance.

**Parameters:**
- `amount: u64` - Amount to withdraw (in lamports)
- `from_savings: bool` - True = withdraw from savings, False = withdraw from spending

**Accounts Required:**
- `user` (signer, writable) - User's wallet
- `vault` (writable) - User's vault PDA

**Logic:**
1. Validates withdrawal amount > 0
2. Checks sufficient balance in requested account
3. Transfers SOL from vault to user
4. Updates vault balance
5. Updates withdrawal counter

**Example Usage:**
```javascript
// Withdraw 0.5 SOL from savings
await program.methods
  .withdraw(new BN(500_000_000), true)
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();

// Withdraw 0.2 SOL from spending
await program.methods
  .withdraw(new BN(200_000_000), false)
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();
```

**Errors:**
- `InvalidAmount` - Amount is 0
- `InsufficientFunds` - Not enough balance in selected account

---

### 4. **update_savings_rate**
Changes the savings rate for future deposits.

**Parameters:**
- `new_rate: u8` - New savings rate (0-100)

**Accounts Required:**
- `user` (signer) - User's wallet
- `vault` (writable) - User's vault PDA

**Logic:**
1. Validates new rate is 0-100
2. Verifies user is vault owner
3. Updates savings_rate field

**Example Usage:**
```javascript
await program.methods
  .updateSavingsRate(75) // Change to 75%
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();
```

**Errors:**
- `InvalidSavingsRate` - Rate not between 0-100
- `Unauthorized` - Caller is not vault owner

---

### 5. **initialize_treasury**
One-time initialization of the platform treasury (admin only).

**Parameters:**
- None

**Accounts Required:**
- `authority` (signer, writable) - Platform admin wallet
- `treasury` (writable) - Treasury PDA to create
- `system_program` - Solana system program

**Logic:**
1. Creates treasury PDA
2. Sets authority as admin
3. Initializes fee counter to 0

**Example Usage:**
```javascript
await program.methods
  .initializeTreasury()
  .accounts({
    authority: adminWallet.publicKey,
    treasury: treasuryPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

**Note:** This is called once during initial deployment.

---

## 💰 Platform Economics

### Fee Structure
- **Platform Fee:** 0.4% of all deposits
- **Withdrawal Fee:** 0% (free withdrawals)
- **Account Creation:** Rent-exempt deposit (~0.002 SOL, refundable on close)

### Fee Distribution
```
User Deposit (1 SOL)
├─ Platform Fee (0.004 SOL) → Treasury
└─ User Receives (0.996 SOL)
   ├─ Savings (0.498 SOL at 50% rate)
   └─ Spending (0.498 SOL at 50% rate)
```

### Revenue Model
The platform earns 0.4% on every deposit:
- **1,000 users** depositing **10 SOL/month** = **40 SOL/month** revenue
- **10,000 users** depositing **10 SOL/month** = **400 SOL/month** revenue

---

## 🔒 Security Features

### 1. **Ownership Verification**
All sensitive operations verify the caller owns the vault:
```rust
require!(ctx.accounts.vault.owner == ctx.accounts.user.key(), ErrorCode::Unauthorized);
```

### 2. **PDA-Based Security**
Vaults are PDAs derived from user keys, preventing address spoofing:
```rust
#[account(
    seeds = [b"savings_vault", user.key().as_ref()],
    bump = vault.bump,
)]
```

### 3. **Input Validation**
All inputs are validated before processing:
- Savings rate: 0-100
- Amounts: > 0
- Balances: Sufficient funds

### 4. **Overflow Protection**
Uses checked arithmetic to prevent overflows:
```rust
let platform_fee = amount.checked_mul(4).unwrap().checked_div(1000).unwrap();
```

### 5. **Rent Exemption**
All accounts are rent-exempt, preventing unexpected closures.

---

## 📚 Usage Examples

### Complete User Flow

```javascript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaAutoSavings } from "../target/types/solana_auto_savings";

// 1. Initialize vault with 50% savings rate
const vaultPDA = PublicKey.findProgramAddressSync(
  [Buffer.from("savings_vault"), userWallet.publicKey.toBuffer()],
  program.programId
)[0];

await program.methods
  .initializeVault(50)
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// 2. Deposit 2 SOL
await program.methods
  .deposit(new anchor.BN(2_000_000_000))
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
    treasury: treasuryPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// Result:
// - Platform fee: 0.008 SOL
// - Savings: 0.996 SOL (50%)
// - Spending: 0.996 SOL (50%)

// 3. Check balances
const vault = await program.account.savingsVault.fetch(vaultPDA);
console.log("Savings:", vault.savingsBalance.toNumber() / 1e9, "SOL");
console.log("Spending:", vault.spendingBalance.toNumber() / 1e9, "SOL");

// 4. Update savings rate to 75%
await program.methods
  .updateSavingsRate(75)
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();

// 5. Withdraw 0.5 SOL from savings
await program.methods
  .withdraw(new anchor.BN(500_000_000), true)
  .accounts({
    user: userWallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();
```

---

## 🔌 Integration Guide

### Frontend Integration

#### 1. Install Dependencies
```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react
```

#### 2. Initialize Program
```javascript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./idl.json";

const connection = new Connection("https://api.devnet.solana.com");
const programId = new PublicKey("YOUR_PROGRAM_ID");
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, programId, provider);
```

#### 3. Use the React Hook
```javascript
import { useAutoSavings } from "./sdk/useAutoSavings";

function App() {
  const {
    vault,
    loading,
    initializeVault,
    deposit,
    withdraw,
    updateSavingsRate
  } = useAutoSavings();

  return (
    <div>
      {vault ? (
        <>
          <p>Savings: {vault.savingsBalance / 1e9} SOL</p>
          <p>Spending: {vault.spendingBalance / 1e9} SOL</p>
          <button onClick={() => deposit(1_000_000_000)}>
            Deposit 1 SOL
          </button>
        </>
      ) : (
        <button onClick={() => initializeVault(50)}>
          Create Vault (50% savings)
        </button>
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### Unit Tests
```bash
anchor test
```

### Test Coverage
- ✅ Vault initialization
- ✅ Deposit with fee calculation
- ✅ Withdraw from savings
- ✅ Withdraw from spending
- ✅ Savings rate updates
- ✅ Error cases (insufficient funds, invalid rates, etc.)

---

## 📈 Analytics & Metrics

### User-Level Metrics
- Total deposited (lifetime)
- Total withdrawn (lifetime)
- Current savings balance
- Current spending balance
- Savings rate
- Account age

### Platform-Level Metrics
- Total fees collected
- Number of active vaults
- Total value locked (TVL)
- Average savings rate
- Deposit/withdrawal volume

---

## 🚀 Deployment Information

**Program ID:** `<TO_BE_DEPLOYED>`  
**Network:** Devnet (for testing)  
**Cluster:** https://api.devnet.solana.com  
**Explorer:** https://explorer.solana.com/?cluster=devnet

---

## 📞 Support & Resources

- **GitHub:** [Your Repository]
- **Documentation:** [This file]
- **Solana Docs:** https://docs.solana.com
- **Anchor Docs:** https://www.anchor-lang.com

---

**Last Updated:** 2026-02-01  
**Version:** 1.0.0  
**License:** MIT
