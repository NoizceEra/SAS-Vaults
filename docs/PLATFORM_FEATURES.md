# 💰 Platform Features Guide

**Last Updated:** February 4, 2026  
**Version:** 2.0  
**Status:** Production Ready

---

## 📋 Overview

The Solana Auto-Savings Protocol includes several platform-level features designed to ensure sustainability and proper treasury management. This guide covers the **0.4% platform fee system**, **treasury management**, and **authority setup**.

---

## 💸 Platform Fee System

### Overview

The protocol implements a **0.4% platform fee** on all deposits and withdrawals. This fee is automatically collected and sent to a protocol-controlled treasury vault.

### Fee Calculation

- **Fee Rate:** 0.4% (40 basis points out of 10,000)
- **Applied To:** All deposits and withdrawals  
- **Collection:** Automatic on every transaction

### Transaction Examples

#### Deposit Example
```
User deposits: 10 SOL
Platform fee (0.4%): 0.04 SOL → Treasury
Amount to vault: 9.96 SOL → User's vault
```

#### Withdrawal Example
```
User requests: 5 SOL
Platform fee (0.4%): 0.02 SOL → Treasury
Total deducted from vault: 5.02 SOL
User receives: 5 SOL
```

---

## 🏛️ Treasury Architecture

### Treasury Accounts

The treasury system uses two Program Derived Addresses (PDAs):

#### 1. TreasuryConfig PDA
- **Seeds:** `["treasury"]`
- **Purpose:** Stores treasury metadata and statistics
- **Contents:**
  - `authority`: Public key of authorized withdrawer
  - `total_fees_collected`: Running total of all fees (in lamports)
  - `bump`: PDA bump seed

#### 2. Treasury Vault PDA
- **Seeds:** `["treasury_vault"]`
- **Purpose:** Holds actual SOL from platform fees
- **Type:** SystemAccount
- **Control:** Program-controlled, authority can withdraw

### How Fee Collection Works

Platform fees are automatically collected in every deposit and withdrawal transaction:

1. **User initiates transaction** (deposit or withdraw)
2. **Program calculates fee** (amount × 0.004)
3. **Program transfers fee** → Treasury Vault
4. **Program updates stats** → TreasuryConfig
5. **Program completes main operation** (deposit/withdraw)

All fee collection is atomic - it happens in the same transaction as the user's operation.

---

## 🔧 Technical Implementation

### Smart Contract Instructions

#### Initialize Treasury (One-Time)
```rust
pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()>
```

**Purpose:** Creates the treasury config and vault PDAs  
**Who:** Protocol operators (run once before launch)  
**Accounts:**
- `treasury_config`: TreasuryConfig PDA (created)
- `treasury`: Treasury Vault PDA (created)
- `authority`: Wallet that will control treasury
- `system_program`: Solana system program

#### Deposit (With Fee)
```rust
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()>
```

**Fee calculation:**
```rust
let fee = amount.checked_mul(FEE_BASIS_POINTS)
    .unwrap()
    .checked_div(10000)
    .unwrap();

// Transfer fee to treasury
// Transfer (amount - fee) to user vault
```

#### Withdraw (With Fee)
```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()>
```

**Fee calculation:**
```rust
let fee = amount.checked_mul(FEE_BASIS_POINTS)
    .unwrap()
    .checked_div(10000)
    .unwrap();

// Check vault has (amount + fee)
// Transfer amount to user
// Transfer fee to treasury
```

---

## 🚀 Deployment & Setup

### Step 1: Initialize Treasury (First Time)

Before any users can interact with the protocol, initialize the treasury:

```bash
# Using a custom script
node scripts/initialize-treasury.js
```

Or programmatically:
```typescript
const tx = await program.methods
  .initializeTreasury()
  .accounts({
    treasuryConfig: treasuryConfigPDA,
    treasury: treasuryVaultPDA,
    authority: yourWallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

**Important:** The wallet that calls `initialize_treasury` becomes the treasury authority - the only wallet authorized to withdraw funds.

### Step 2: Update Frontend SDK

The SDK automatically handles treasury accounts. Update the client to include treasury PDAs:

```typescript
// In sdk/client.ts
getTreasuryConfigPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    this.program.programId
  );
}

getTreasuryVaultPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_vault')],
    this.program.programId
  );
}

async deposit(amountSOL) {
  const [treasuryConfigPDA] = this.getTreasuryConfigPDA();
  const [treasuryPDA] = this.getTreasuryVaultPDA();
  
  // Include in transaction accounts...
}
```

### Step 3: Display Fees to Users

Show fee information in the UI before transactions:

```jsx
const FEE_RATE = 0.004; // 0.4%

function DepositModal({ amount }) {
  const fee = amount * FEE_RATE;
  const netAmount = amount - fee;
  
  return (
    <div className="fee-breakdown">
      <p>Deposit Amount: {amount} SOL</p>
      <p>Platform Fee (0.4%): {fee.toFixed(4)} SOL</p>
      <p className="net">Net to Vault: {netAmount.toFixed(4)} SOL</p>
    </div>
  );
}
```

---

## 📊 Treasury Management

### Checking Treasury Balance

Use the treasury management script to check current balance and stats:

```bash
# Check balance and statistics
node scripts/manage-treasury.js check
```

**Output:**
```
📊 Treasury Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Network:          devnet
Program ID:       AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j
Treasury Vault:   <PDA_ADDRESS>
Balance:          0.042000000 SOL
Balance (USD):    $6.30 (@ $150/SOL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Treasury Config:
Authority:        <YOUR_WALLET>
Total Fees:       0.042000000 SOL
```

### Withdrawing Treasury Funds

**Prerequisites:**
- Must be the treasury authority wallet
- Treasury must have sufficient balance
- Keypair file accessible

```bash
# Withdraw specific amount
node scripts/manage-treasury.js withdraw 0.01
```

**Output:**
```
💰 Withdrawing 0.01 SOL from Treasury...
✅ Withdrawal Successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction:      <TX_SIGNATURE>
Amount:           0.01 SOL
Recipient:        <YOUR_WALLET>
Explorer:         https://explorer.solana.com/tx/<TX>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

New Treasury Balance: 0.032000000 SOL
```

### Treasury Statistics

View detailed revenue analytics:

```bash
node scripts/manage-treasury.js stats
```

**Output:**
```
📊 Treasury Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Fee Collection Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Fees Collected:  0.042000000 SOL
Current Balance:       0.032000000 SOL
Total Withdrawn:       0.010000000 SOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Estimated Revenue (@ $150/SOL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Revenue:         $6.30
Available to Withdraw: $4.80
Already Withdrawn:     $1.50
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Environment Variables

**NETWORK** - Specify network (default: `devnet`)
```bash
NETWORK=mainnet-beta node scripts/manage-treasury.js check
```

**AUTHORITY_KEYPAIR** - Path to authority keypair  
```bash
AUTHORITY_KEYPAIR=/path/to/keypair.json node scripts/manage-treasury.js withdraw 0.5
```

---

## 🔐 Treasury Authority Setup

### Creating a Treasury Authority Wallet

For production deployments, create a dedicated treasury authority wallet:

```bash
# Generate new keypair
solana-keygen new --outfile treasury-authority.json

# Get the public key
solana-keygen pubkey treasury-authority.json
```

**Example Output:**
```
Public Key: GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U
```

### Security Best Practices

**Authority Wallet Protection:**
- ✅ Store keypair securely (encrypted backup)
- ✅ Use hardware wallet for Mainnet
- ✅ Never share private key
- ✅ Consider multisig for large amounts
- ✅ Regular security audits

**Withdrawal Best Practices:**
- ✅ Withdraw regularly (monthly/quarterly)
- ✅ Keep transaction records for accounting
- ✅ Monitor treasury balance proactively
- ✅ Test on Devnet before Mainnet operations
- ✅ Leave minimum balance for rent

---

## 💰 Revenue Projections

### Conservative Estimates

| Daily Volume | Monthly Volume | Monthly Fees (0.4%) | Annual (@ $150/SOL) |
|--------------|----------------|---------------------|---------------------|
| 1,000 SOL    | 30,000 SOL     | 120 SOL            | $216,000            |
| 5,000 SOL    | 150,000 SOL    | 600 SOL            | $1,080,000          |
| 10,000 SOL   | 300,000 SOL    | 1,200 SOL          | $2,160,000          |

### Growth Scenarios

**Year 1 Projection:**
- Month 1-3: 1,000 SOL/day → ~360 SOL fees (~$54,000)
- Month 4-6: 2,500 SOL/day → ~900 SOL fees (~$135,000)
- Month 7-12: 5,000 SOL/day → ~3,600 SOL fees (~$540,000)
- **Total Year 1:** ~4,860 SOL (~$729,000)

**Year 2 Projection:**
- Average 10,000 SOL/day
- **Total Year 2:** ~14,400 SOL (~$2,160,000)

*Calculations assume SOL = $150*

---

## 🔒 Security Considerations

### Fee Immutability
- ✅ Fee rate (0.4%) is hardcoded in smart contract
- ✅ Cannot be changed without redeployment
- ✅ Protects users from fee increases
- ✅ Ensures predictable costs

### Safe Math
- ✅ Fee calculation uses checked math
- ✅ Prevents overflow/underflow
- ✅ Validates all amounts
- ✅ Rejects zero or negative values

### User Transparency
- ✅ Users see exact fee before transaction
- ✅ Frontend displays fee breakdown
- ✅ All fees logged on-chain
- ✅ Fully auditable

### Treasury Protection
- ✅ Treasury is program-controlled PDA
- ✅ Only authority can withdraw
- ✅ Requires explicit instruction call
- ✅ All withdrawals are on-chain events

---
## 🚨 Troubleshooting Common Issues

### Error: "Unauthorized access"

**Cause:** Attempting to withdraw without authority wallet

**Solution:**
1. Verify you're using the treasury authority wallet
2. Check which wallet initialized the treasury:
   ```bash
   node scripts/manage-treasury.js check
   # Look for "Authority: <PUBKEY>"
   ```
3. Set correct keypair path:
   ```bash
   AUTHORITY_KEYPAIR=/path/to/authority.json node scripts/manage-treasury.js withdraw 0.1
   ```

### Error: "Insufficient funds in vault"

**Cause:** Trying to withdraw more than available balance

**Solution:**
1. Check current balance:
   ```bash
   node scripts/manage-treasury.js check
   ```
2. Withdraw smaller amount
3. Remember to leave ~0.001 SOL for rent

### Error: "Authority keypair not found"

**Cause:** Keypair file doesn't exist or wrong path

**Solution:**
1. Verify file exists:
   ```bash
   ls ~/.config/solana/id.json
   ```
2. Specify correct path explicitly:
   ```bash
   AUTHORITY_KEYPAIR=C:\Users\username\.config\solana\id.json node scripts/manage-treasury.js check
   ```

---

## 🌐 Mainnet Deployment Guide

### Pre-Deployment Checklist

Before deploying to mainnet:

- [ ] Smart contract audited by professionals
- [ ] Extensive testing on devnet (100+ transactions)
- [ ] Bug bounty program established
- [ ] Treasury authority wallet secured
- [ ] Emergency procedures documented
- [ ] Legal review completed
- [ ] Monitoring systems in place

### Deployment Steps

1. **Generate Production Authority Wallet**
   ```bash
   solana-keygen new --outfile mainnet-treasury-authority.json
   ```

2. **Secure the Keypair**
   - Store in multiple encrypted locations
   - Consider hardware wallet
   - Create recovery process document
   - Test recovery procedure

3. **Deploy Program to Mainnet**
   ```bash
   anchor deploy --provider.cluster mainnet-beta
   ```

4. **Initialize Treasury**
   ```bash
   NETWORK=mainnet-beta node scripts/initialize-treasury.js
   ```

5. **Verify Setup**
   ```bash
   NETWORK=mainnet-beta node scripts/manage-treasury.js check
   ```

### Post-Deployment

1. **Backup Everything**
   - Treasury authority keypair (encrypted)
   - Program upgrade authority
   - Deployment transaction signatures
   - Treasury PDAs

2. **Set Up Monitoring**
   - Treasury balance alerts
   - Fee collection rate tracking
   - Anomaly detection
   - Error rate monitoring

3. **Establish Withdrawal Schedule**
   - Monthly/quarterly withdrawals
   - Tax reporting integration
   - Accounting system updates

---

## 📈 Advanced Features

### Programmatic Treasury Access

```javascript
import { Connection, PublicKey } from '@solana/web3.js';

async function getTreasuryBalance(programId) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  const [treasuryVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_vault')],
    programId
  );
  
  const balance = await connection.getBalance(treasuryVault);
  return balance / 1e9; // Convert to SOL
}

async function getTreasuryStats(programId, program) {
  const [treasuryConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    programId
  );
  
  const config = await program.account.treasuryConfig.fetch(treasuryConfig);
  return {
    authority: config.authority.toString(),
    totalFeesCollected: config.totalFeesCollected.toNumber() / 1e9,
  };
}
```

### Automated Treasury Management

```javascript
// Example: Auto-withdraw when balance exceeds threshold
const THRESHOLD = 10; // SOL
const MIN_BALANCE = 1; // Always leave 1 SOL

async function autoWithdraw() {
  const balance = await getTreasuryBalance(PROGRAM_ID);
  
  if (balance > THRESHOLD) {
    const withdrawAmount = balance - MIN_BALANCE;
    await withdrawTreasury(withdrawAmount);
    console.log(`Auto-withdrew ${withdrawAmount} SOL`);
  }
}

// Run daily at midnight
cron.schedule('0 0 * * *', autoWithdraw);
```

---

## 📊 Cost & Revenue Analysis

### Platform Costs (Mainnet)

**One-Time:**
- Program deployment: ~2-5 SOL
- Treasury initialization: ~0.003 SOL

**Per User:**
- Account creation: ~0.002 SOL (paid by user)

**Per Transaction:**
- Network fee: ~0.000005 SOL (paid by user)

### Revenue Breakdown

**Example with 100 users:**
- Average deposit: 10 SOL/month
- Average withdrawal: 5 SOL/month

**Monthly revenue:**
```
Deposits:    100 users × 10 SOL × 0.004 = 4 SOL
Withdrawals: 100 users × 5 SOL × 0.004 = 2 SOL
Total:       6 SOL/month (~$900 @ $150/SOL)
```

**Break-even analysis:**
- Initial costs: ~5 SOL deployment + operational
- Monthly revenue: 6 SOL (100 users)
- Break-even: <1 month at 100 users

---

## ❓ Frequently Asked Questions

### Can the fee rate be changed?
No, the 0.4% fee is hardcoded in the smart contract. Changing it would require redeployment and migration to a new program.

### Do users pay gas fees in addition to the platform fee?
Yes, users pay Solana network fees (~0.000005 SOL) plus the 0.4% platform fee on deposits and withdrawals.

### Is the platform fee visible to users?
Yes, the fee is displayed in the UI before transactions and logged in every on-chain transaction. Fully transparent.

### Can fees be waived for certain users?
Not with the current implementation. Adding a whitelist would require smart contract updates.

### Who controls the treasury?
The wallet that called `initialize_treasury` is the only wallet authorized to withdraw funds. This authority cannot be changed after initialization.

### What happens if the authority wallet is lost?
Treasury funds become permanently inaccessible. This is why secure backup and recovery procedures are critical.

### Can multiple wallets control the treasury?
The current implementation supports single-wallet authority. For multi-signature control, the smart contract would need modification.

---

## 📚 Related Documentation

- **Smart Contract Code:** `programs/auto-savings/src/lib.rs`
- **Management Script:** `scripts/manage-treasury.js`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Integration Guide:** `INTEGRATION.md`

---

## 📞 Support Resources

**Solana:**
- Explorer: https://explorer.solana.com
- Documentation: https://docs.solana.com
- Discord: https://discord.gg/solana

**Anchor Framework:**
- Documentation: https://www.anchor-lang.com
- GitHub: https://github.com/coral-xyz/anchor

**Community:**
- Stack Exchange: https://solana.stackexchange.com
- Reddit: r/solana, r/solanadev

---

**Last Updated:** February 4, 2026  
**Status:** Production Ready ✅  
**Version:** 2.0
