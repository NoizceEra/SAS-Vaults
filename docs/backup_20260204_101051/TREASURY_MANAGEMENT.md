# Treasury Management Guide

## Overview

The Auto-Savings Protocol collects a 0.4% platform fee on all deposits and withdrawals. These fees accumulate in the **Treasury Vault**, a PDA (Program Derived Address) controlled by the protocol.

**Treasury Authority:** The wallet that calls `initialize_treasury` becomes the only wallet authorized to withdraw funds.

---

## Treasury Architecture

### Accounts

1. **TreasuryConfig PDA**
   - **Seeds:** `["treasury"]`
   - **Purpose:** Stores treasury metadata
   - **Contents:**
     - `authority`: Pubkey of authorized withdrawer
     - `total_fees_collected`: Running total of all fees (in lamports)
     - `bump`: PDA bump seed

2. **Treasury Vault PDA**
   - **Seeds:** `["treasury_vault"]`
   - **Purpose:** Holds actual SOL from platform fees
   - **Type:** SystemAccount (regular Solana account)

### Fee Collection

Platform fees are automatically collected on:
- **Deposits:** 0.4% of deposit amount
- **Withdrawals:** 0.4% of withdrawal amount

**Example:**
```
User deposits 1 SOL
  → Platform fee: 0.004 SOL → Treasury Vault
  → User's vault: 0.996 SOL
```

---

## Using the Treasury Manager

### Installation

The treasury management script is located at `scripts/manage-treasury.js`.

**Prerequisites:**
```bash
npm install @coral-xyz/anchor @solana/web3.js
```

### Commands

#### 1. Check Treasury Balance

```bash
node scripts/manage-treasury.js check
```

**Output:**
```
📊 Treasury Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Network:          devnet
Program ID:       AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j
Treasury Config:  <PDA_ADDRESS>
Treasury Vault:   <PDA_ADDRESS>
Balance:          0.042000000 SOL
Balance (USD):    $4.20 (@ $100/SOL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Treasury Config:
Authority:        <YOUR_WALLET_ADDRESS>
Total Fees:       0.042000000 SOL
```

#### 2. Withdraw from Treasury

```bash
node scripts/manage-treasury.js withdraw 0.01
```

**Output:**
```
💰 Withdrawing 0.01 SOL from Treasury...

Authority: <YOUR_WALLET_ADDRESS>
📤 Sending transaction...

✅ Withdrawal Successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction:      <TX_SIGNATURE>
Amount:           0.01 SOL
Recipient:        <YOUR_WALLET_ADDRESS>
Explorer:         https://explorer.solana.com/tx/<TX>?cluster=devnet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

New Treasury Balance: 0.032000000 SOL
```

#### 3. View Statistics

```bash
node scripts/manage-treasury.js stats
```

**Output:**
```
📊 Treasury Statistics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Fee Collection Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Fees Collected:  0.042000000 SOL
Current Balance:       0.032000000 SOL
Total Withdrawn:       0.010000000 SOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Estimated Revenue (@ $100/SOL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Revenue:         $4.20
Available to Withdraw: $3.20
Already Withdrawn:     $1.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Environment Variables

**NETWORK** - Specify network (default: `devnet`)
```bash
NETWORK=mainnet-beta node scripts/manage-treasury.js check
```

**AUTHORITY_KEYPAIR** - Path to authority keypair (default: `~/.config/solana/id.json`)
```bash
AUTHORITY_KEYPAIR=/path/to/keypair.json node scripts/manage-treasury.js withdraw 0.5
```

---

## Withdrawal Process

### Prerequisites

1. **Authority Wallet Access**
   - You must have the private key of the authority wallet
   - This is the wallet that called `initialize_treasury`
   - Default location: `~/.config/solana/id.json`

2. **Sufficient Treasury Balance**
   - Check balance first with `check` command
   - Cannot withdraw more than available balance

### Step-by-Step Withdrawal

1. **Check Current Balance**
   ```bash
   node scripts/manage-treasury.js check
   ```

2. **Decide Withdrawal Amount**
   - Consider leaving some SOL for rent
   - Recommended: Keep at least 0.001 SOL in treasury

3. **Execute Withdrawal**
   ```bash
   node scripts/manage-treasury.js withdraw <amount>
   ```

4. **Verify Transaction**
   - Check the Explorer link in the output
   - Verify SOL arrived in your wallet
   - Confirm new treasury balance

### Security Considerations

**Authority Wallet Protection:**
- ✅ Store authority keypair securely
- ✅ Use hardware wallet for Mainnet
- ✅ Never share private key
- ✅ Consider multisig for large amounts

**Withdrawal Best Practices:**
- ✅ Withdraw regularly (monthly/quarterly)
- ✅ Keep transaction records
- ✅ Monitor treasury balance
- ✅ Test on Devnet first

---

## Troubleshooting

### Error: "Unauthorized access"

**Cause:** You're not using the authority wallet

**Solution:**
1. Check which wallet initialized the treasury
2. Use that wallet's keypair
3. Set `AUTHORITY_KEYPAIR` environment variable

### Error: "Insufficient funds in vault"

**Cause:** Trying to withdraw more than available

**Solution:**
1. Run `check` command to see current balance
2. Withdraw a smaller amount
3. Remember to account for rent (~0.001 SOL)

### Error: "Authority keypair not found"

**Cause:** Keypair file doesn't exist at expected path

**Solution:**
1. Specify correct path with `AUTHORITY_KEYPAIR`
2. Ensure file exists and is readable
3. Check file permissions

### Error: "Transaction simulation failed"

**Cause:** Various reasons (network issues, account state, etc.)

**Solution:**
1. Check network status (Devnet can be unstable)
2. Verify treasury is initialized
3. Try again after a few seconds
4. Check Solana Explorer for account state

---

## Mainnet Deployment

### Before Deployment

1. **Generate New Keypair** (optional but recommended)
   ```bash
   solana-keygen new -o treasury-authority.json
   ```

2. **Fund Authority Wallet**
   ```bash
   solana airdrop 1 <AUTHORITY_PUBKEY> --url devnet  # For testing
   ```

3. **Test on Devnet**
   ```bash
   # Deploy program
   # Initialize treasury
   # Test withdrawal
   ```

### Deployment Steps

1. **Deploy Program to Mainnet**
   ```bash
   anchor deploy --provider.cluster mainnet-beta
   ```

2. **Initialize Treasury**
   ```bash
   # Use your frontend or write a script
   # Call initialize_treasury instruction
   # Authority = your wallet
   ```

3. **Verify Treasury**
   ```bash
   NETWORK=mainnet-beta node scripts/manage-treasury.js check
   ```

4. **Update Script**
   - Edit `manage-treasury.js`
   - Update `PROGRAM_ID` for Mainnet
   - Test withdrawal with small amount

### Post-Deployment

1. **Backup Authority Keypair**
   - Store in multiple secure locations
   - Consider hardware wallet
   - Document recovery process

2. **Set Up Monitoring**
   - Track treasury balance
   - Monitor fee collection rate
   - Set up alerts for large balances

3. **Establish Withdrawal Schedule**
   - Monthly/quarterly withdrawals
   - Tax reporting requirements
   - Business accounting integration

---

## Fee Calculation Examples

### Deposit Example

**User deposits 10 SOL:**
```
Platform fee: 10 × 0.004 = 0.04 SOL
User's vault: 10 - 0.04 = 9.96 SOL
Treasury receives: 0.04 SOL
```

### Withdrawal Example

**User withdraws 5 SOL:**
```
Platform fee: 5 × 0.004 = 0.02 SOL
User receives: 5 SOL
Total deducted from vault: 5 + 0.02 = 5.02 SOL
Treasury receives: 0.02 SOL
```

### Revenue Projection

**Assumptions:**
- 100 users
- Average deposit: 10 SOL/month
- Average withdrawal: 5 SOL/month

**Monthly Revenue:**
```
Deposits:  100 users × 10 SOL × 0.004 = 4 SOL
Withdrawals: 100 users × 5 SOL × 0.004 = 2 SOL
Total: 6 SOL/month (~$600 @ $100/SOL)
```

---

## Advanced Usage

### Programmatic Access

```javascript
const { Connection, PublicKey } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');

async function getTreasuryBalance(programId) {
    const connection = new Connection('https://api.devnet.solana.com');
    
    const [treasuryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        programId
    );
    
    const balance = await connection.getBalance(treasuryVault);
    return balance / 1e9; // Convert to SOL
}
```

### Automated Withdrawals

```javascript
// Example: Withdraw when balance exceeds threshold
const THRESHOLD = 10; // SOL

async function autoWithdraw() {
    const balance = await getTreasuryBalance(PROGRAM_ID);
    
    if (balance > THRESHOLD) {
        const amount = balance - 1; // Leave 1 SOL
        await withdrawTreasury(amount);
    }
}

// Run daily
setInterval(autoWithdraw, 24 * 60 * 60 * 1000);
```

---

## Support & Resources

**Documentation:**
- Smart Contract: `programs/auto-savings/src/lib.rs`
- Management Script: `scripts/manage-treasury.js`
- Implementation Plan: `implementation_plan.md`

**Solana Resources:**
- Explorer: https://explorer.solana.com
- Docs: https://docs.solana.com
- Discord: https://discord.gg/solana

**Need Help?**
- Check troubleshooting section above
- Review transaction on Solana Explorer
- Verify account states and balances
- Test on Devnet before Mainnet operations

---

**Last Updated:** February 3, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
