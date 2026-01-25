# 📖 Auto-Savings Protocol - User Guide

**How the Auto-Savings Protocol Works for Users**

---

## 🎯 Overview

The Auto-Savings Protocol is a Solana smart contract that helps you automatically save a percentage of your SOL transactions. You set a savings rate (1-90%), and the protocol handles the rest.

### Key Features

- ✅ **Automatic Savings**: Set it and forget it - save a percentage of every transaction
- ✅ **Manual Deposits**: Add SOL to your savings vault anytime
- ✅ **Flexible Withdrawals**: Withdraw your savings when needed
- ✅ **Customizable Rate**: Choose your savings rate (1-90%)
- ✅ **Secure Vault**: Your savings are stored in a Program Derived Address (PDA) vault
- ✅ **Transparent Fees**: 0.4% platform fee on deposits and withdrawals

---

## 🚀 Getting Started

### Step 1: Initialize Your Account

Before you can use the protocol, you need to initialize your savings account.

**What happens:**
1. You choose a savings rate (1-90%)
2. The protocol creates two accounts for you:
   - **UserConfig**: Stores your settings and statistics
   - **Vault**: A secure PDA that holds your saved SOL

**Example:**
```typescript
// Initialize with 10% savings rate
await program.methods
  .initializeUser(10)
  .accounts({
    user: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

**Cost:** ~0.002 SOL (one-time account creation fee)

**Result:** Your account is now active and ready to save!

---

## 💰 How Savings Work

### Option 1: Automatic Savings (process_transfer)

When you make a SOL transfer, you can optionally call `process_transfer` to automatically save a percentage.

**How it works:**
1. You initiate a SOL transfer
2. The protocol calculates: `savings_amount = transfer_amount × savings_rate / 100`
3. The savings amount is automatically transferred to your vault
4. Your statistics are updated

**Example:**
- Transfer amount: 1 SOL (1,000,000,000 lamports)
- Your savings rate: 10%
- Auto-saved: 0.1 SOL (100,000,000 lamports)
- You receive: 0.9 SOL

**Note:** This requires you to call the instruction as part of your transfer transaction.

---

### Option 2: Manual Deposits

You can manually deposit SOL into your savings vault at any time.

**How it works:**
1. You specify the amount you want to deposit
2. The protocol calculates a 0.4% platform fee
3. Fee is sent to the platform treasury
4. Remaining amount goes to your vault
5. Your `total_saved` statistic increases

**Example:**
- Deposit: 1 SOL (1,000,000,000 lamports)
- Platform fee (0.4%): 0.004 SOL (4,000,000 lamports)
- Saved to vault: 0.996 SOL (996,000,000 lamports)

**Transaction Flow:**
```
Your Wallet → [0.4% Fee] → Platform Treasury
         ↓
    [99.6%] → Your Vault
```

---

## 💸 Withdrawing Your Savings

When you need your savings, you can withdraw them.

**How it works:**
1. You specify the amount you want to withdraw
2. The protocol calculates a 0.4% platform fee
3. Checks that your vault has enough SOL (amount + fee)
4. Transfers the requested amount to your wallet
5. Transfers the fee to the platform treasury
6. Your `total_withdrawn` statistic increases

**Example:**
- Withdraw: 1 SOL (1,000,000,000 lamports)
- Platform fee (0.4%): 0.004 SOL (4,000,000 lamports)
- Total needed from vault: 1.004 SOL
- You receive: 1 SOL
- Platform receives: 0.004 SOL

**Transaction Flow:**
```
Your Vault → [Requested Amount] → Your Wallet
         ↓
    [0.4% Fee] → Platform Treasury
```

---

## ⚙️ Managing Your Account

### Update Your Savings Rate

You can change your savings rate at any time (must be between 1-90%).

**When to use:**
- Want to save more: Increase the rate
- Need more spending money: Decrease the rate
- Life changes: Adjust as your financial situation changes

**Example:**
```typescript
// Change from 10% to 20%
await program.methods
  .updateSavingsRate(20)
  .accounts({
    user: wallet.publicKey,
    userConfig: userConfigPDA,
  })
  .rpc();
```

**Cost:** Just transaction fees (~0.000005 SOL)

---

### Deactivate Your Account

Temporarily stop all savings operations (emergency stop).

**When to use:**
- Suspect unauthorized activity
- Need to pause savings temporarily
- Account security concerns

**What happens:**
- All deposit/withdraw operations are blocked
- Your vault and funds remain safe
- You can reactivate anytime

---

### Reactivate Your Account

Resume savings operations after deactivation.

**What happens:**
- All operations become available again
- Your savings rate and statistics remain unchanged
- Your vault funds are untouched

---

## 📊 Understanding Your Account Data

### UserConfig Account

This account stores all your settings and statistics:

| Field | Description | Example |
|-------|-------------|---------|
| `owner` | Your wallet address | Your public key |
| `savings_rate` | Your current savings rate (1-90%) | 10 |
| `total_saved` | Total SOL saved (lifetime) | 5.5 SOL |
| `total_withdrawn` | Total SOL withdrawn (lifetime) | 1.2 SOL |
| `transaction_count` | Number of transactions | 47 |
| `is_active` | Whether account is active | true |
| `bump` | PDA bump seed | 255 |

### Your Vault

- **Type:** Program Derived Address (PDA)
- **Seeds:** `["vault", your_wallet_address]`
- **Purpose:** Holds all your saved SOL
- **Security:** Only the program can transfer from it (with your authorization)

---

## 💡 Real-World Examples

### Example 1: New User Setup

**Scenario:** Alice wants to save 15% of her income automatically.

1. **Initialize Account:**
   - Alice calls `initialize_user(15)`
   - Cost: ~0.002 SOL
   - Result: Account created with 15% savings rate

2. **First Deposit:**
   - Alice deposits 10 SOL
   - Fee: 0.04 SOL (0.4%)
   - Saved: 9.96 SOL
   - Statistics: `total_saved = 9.96 SOL`, `transaction_count = 1`

3. **Monthly Deposit:**
   - Alice deposits 5 SOL every month
   - Each deposit: 4.98 SOL saved (after 0.4% fee)
   - After 12 months: ~59.76 SOL saved

### Example 2: Adjusting Savings Rate

**Scenario:** Bob started with 5% but wants to increase to 25%.

1. **Current State:**
   - Savings rate: 5%
   - Total saved: 2.5 SOL

2. **Update Rate:**
   - Bob calls `update_savings_rate(25)`
   - Cost: ~0.000005 SOL
   - Result: New rate is 25%

3. **Future Savings:**
   - All future transactions now save 25% instead of 5%

### Example 3: Emergency Withdrawal

**Scenario:** Charlie needs to withdraw 3 SOL for an emergency.

1. **Check Vault:**
   - Charlie's vault has 5 SOL

2. **Withdraw:**
   - Request: 3 SOL
   - Fee: 0.012 SOL (0.4%)
   - Total needed: 3.012 SOL
   - Vault has enough ✓

3. **Result:**
   - Charlie receives: 3 SOL
   - Vault remaining: ~1.988 SOL
   - Statistics: `total_withdrawn` increases by 3 SOL

---

## 🔒 Security Features

### Account Ownership

- Only the account owner can:
  - Update savings rate
  - Deposit funds
  - Withdraw funds
  - Deactivate/reactivate account

### Vault Security

- Vault is a PDA (Program Derived Address)
- Only the program can transfer from vault
- Requires your signature for withdrawals
- Cannot be accessed by anyone else

### Platform Fees

- Transparent: Always 0.4% on deposits and withdrawals
- Automatic: Calculated and transferred automatically
- Tracked: Platform keeps records of all fees collected

---

## 📈 Fee Structure

### Platform Fee: 0.4%

Applied to:
- ✅ Manual deposits
- ✅ Withdrawals
- ❌ Account initialization (one-time fee only)
- ❌ Rate updates (transaction fee only)
- ❌ Account activation/deactivation (transaction fee only)

### Fee Calculation

```
Platform Fee = Amount × 40 / 10,000
```

**Examples:**
- Deposit 1 SOL → Fee: 0.004 SOL
- Deposit 10 SOL → Fee: 0.04 SOL
- Withdraw 0.5 SOL → Fee: 0.002 SOL

### Transaction Fees

Standard Solana transaction fees apply (~0.000005 SOL per transaction):
- Account initialization
- Rate updates
- Deposits
- Withdrawals
- Account management

---

## 🎯 Best Practices

### 1. Start Small
- Begin with a lower savings rate (5-10%)
- Gradually increase as you get comfortable
- Test with small amounts first

### 2. Regular Deposits
- Set up a routine (weekly/monthly)
- Consistency builds savings faster
- Use manual deposits for predictable savings

### 3. Monitor Your Account
- Check your `total_saved` regularly
- Review `transaction_count` for activity
- Keep track of your vault balance

### 4. Adjust as Needed
- Increase rate when income increases
- Decrease rate during tight months
- Use deactivate/reactivate for temporary pauses

### 5. Emergency Planning
- Keep some SOL in your main wallet (not all in vault)
- Know how to withdraw quickly if needed
- Understand the 0.4% fee on withdrawals

---

## ❓ Frequently Asked Questions

### Q: Can I change my savings rate?
**A:** Yes! You can update your savings rate anytime between 1-90% using `update_savings_rate`.

### Q: What happens if I deactivate my account?
**A:** All deposit/withdraw operations are blocked, but your funds remain safe in your vault. You can reactivate anytime.

### Q: Can I withdraw all my savings?
**A:** Yes, but remember:
- You need enough for the withdrawal amount + 0.4% fee
- Leave a small amount for transaction fees if you want to keep the account active

### Q: How do I check my vault balance?
**A:** Query your vault PDA account balance using:
```typescript
const vaultPDA = await findVaultPDA(wallet.publicKey);
const vaultBalance = await connection.getBalance(vaultPDA);
```

### Q: What if I lose access to my wallet?
**A:** Your vault is tied to your wallet. If you lose your wallet keys, you'll lose access to your savings. Always backup your wallet securely!

### Q: Can someone else access my vault?
**A:** No. Only you (the account owner) can authorize withdrawals. The vault is secured by your wallet signature.

### Q: How is the platform fee used?
**A:** The 0.4% fee goes to the platform treasury to support protocol maintenance and development.

### Q: Can I have multiple savings accounts?
**A:** Each wallet can have one savings account. If you need multiple accounts, use different wallets.

---

## 🔄 Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER JOURNEY                          │
└─────────────────────────────────────────────────────────┘

1. INITIALIZE
   └─> Choose savings rate (1-90%)
       └─> Pay ~0.002 SOL account creation
           └─> Account created ✓

2. SAVE MONEY
   ├─> Option A: Manual Deposit
   │   └─> Deposit SOL → 0.4% fee → Vault
   │
   └─> Option B: Auto-Save (process_transfer)
       └─> Transfer SOL → Auto-save % → Vault

3. MANAGE ACCOUNT
   ├─> Update savings rate (1-90%)
   ├─> Deactivate (pause operations)
   └─> Reactivate (resume operations)

4. WITHDRAW
   └─> Request amount → 0.4% fee → Your wallet

5. MONITOR
   └─> Check statistics:
       ├─> total_saved
       ├─> total_withdrawn
       ├─> transaction_count
       └─> vault balance
```

---

## 📝 Quick Reference

### Account Initialization
```typescript
initialize_user(savings_rate: u8)  // 1-90%
```

### Manual Operations
```typescript
deposit(amount: u64)                // Add SOL to vault
withdraw(amount: u64)               // Remove SOL from vault
```

### Account Management
```typescript
update_savings_rate(new_rate: u8)   // Change rate (1-90%)
deactivate()                        // Pause operations
reactivate()                        // Resume operations
```

### Automatic Savings
```typescript
process_transfer(transfer_amount: u64)  // Auto-save on transfer
```

---

## 🆘 Troubleshooting

### "Account not active" Error
**Solution:** Your account is deactivated. Call `reactivate()` to resume operations.

### "Insufficient funds" Error
**Solution:** Your vault doesn't have enough SOL. For withdrawals, remember you need: `amount + (amount × 0.004)`.

### "Invalid savings rate" Error
**Solution:** Savings rate must be between 1 and 90. Use a value in that range.

### "Unauthorized" Error
**Solution:** You're not the account owner. Make sure you're using the correct wallet.

---

## 📞 Support

For technical issues or questions:
- Check the [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) for technical details
- Review the program code in `programs/auto-savings/src/lib.rs`
- Consult Solana/Anchor documentation

---

**Last Updated:** January 24, 2026  
**Protocol Version:** 1.0  
**Network:** Solana Devnet

---

*Happy Saving! 💰*
