# 🎯 Quick Start: Treasury Testing

## ✅ Deployment Complete!

**Program ID:** `E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a`  
**Network:** Devnet  
**Status:** Ready for testing

---

## 📋 Next Steps (In Order)

### Step 1: Initialize Treasury
**Required before any testing**

The treasury must be initialized once using the treasury authority wallet.

**Option A: Using Solana Playground**
1. Go to https://beta.solpg.io
2. Connect wallet: `GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U`
3. Call `initializeTreasury` instruction
4. Verify transaction on Explorer

**Option B: Using CLI (Recommended)**
```bash
# Create initialization script
node scripts/initialize-treasury.js
```

### Step 2: Test Fee Collection
**Generate some fees to withdraw**

1. **Create a test user account:**
   - Use frontend or CLI
   - Set savings rate (e.g., 10%)

2. **Make deposits:**
   ```bash
   # Each deposit collects 0.4% fee
   # Example: 1 SOL deposit = 0.004 SOL to treasury
   ```

3. **Check treasury balance:**
   ```bash
   node scripts/manage-treasury.js check
   ```

### Step 3: Test Treasury Withdrawal
**Withdraw collected fees**

```bash
# Withdraw 0.01 SOL
node scripts/manage-treasury.js withdraw 0.01

# View statistics
node scripts/manage-treasury.js stats
```

---

## 🔑 Important Information

### Treasury Authority
- **Public Key:** `GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U`
- **Keypair:** `~/.config/solana/treasury-authority.json`

### Treasury PDAs
```javascript
// Treasury Config PDA
const [treasuryConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    new PublicKey('E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a')
);

// Treasury Vault PDA
const [treasuryVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_vault')],
    new PublicKey('E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a')
);
```

---

## 🛠️ CLI Commands

### Check Treasury Status
```bash
node scripts/manage-treasury.js check
```
**Shows:**
- Current balance
- Treasury PDAs
- Authority (if initialized)
- Total fees collected

### Withdraw Funds
```bash
node scripts/manage-treasury.js withdraw <amount_in_sol>
```
**Example:**
```bash
node scripts/manage-treasury.js withdraw 0.5
```

### View Statistics
```bash
node scripts/manage-treasury.js stats
```
**Shows:**
- Total fees collected
- Current balance
- Total withdrawn
- Revenue estimates

---

## 🧪 Testing Checklist

- [ ] Initialize treasury with authority wallet
- [ ] Create test user account
- [ ] Make test deposit (verify 0.4% fee)
- [ ] Check treasury balance increased
- [ ] Withdraw small amount from treasury
- [ ] Verify withdrawal transaction
- [ ] Check updated treasury balance
- [ ] View treasury statistics

---

## 📊 Expected Results

### After Initialization
```
✅ Treasury Config created
✅ Authority set to: GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U
✅ Total fees: 0 SOL
```

### After First Deposit (1 SOL)
```
✅ User deposited: 0.996 SOL (after 0.4% fee)
✅ Treasury received: 0.004 SOL
✅ Treasury balance: 0.004 SOL
```

### After Withdrawal (0.002 SOL)
```
✅ Withdrawn: 0.002 SOL
✅ Sent to: GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U
✅ Remaining balance: 0.002 SOL
```

---

## 🔗 Useful Links

- **Program Explorer:** https://explorer.solana.com/address/E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a?cluster=devnet
- **Authority Wallet:** https://explorer.solana.com/address/GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U?cluster=devnet
- **Solana Playground:** https://beta.solpg.io

---

## 📚 Documentation

- **Full Guide:** `TREASURY_MANAGEMENT.md`
- **Authority Setup:** `TREASURY_AUTHORITY_SETUP.md`
- **Deployment Details:** `DEPLOYMENT_SUMMARY.md`

---

## ⚠️ Important Notes

1. **Treasury must be initialized first** - Cannot withdraw before initialization
2. **Only authority can withdraw** - Transactions from other wallets will fail
3. **Fees accumulate automatically** - 0.4% on all deposits and withdrawals
4. **Test on Devnet first** - Verify everything works before Mainnet

---

## 🎉 You're Ready!

The program is deployed and ready for testing. Start with **Step 1: Initialize Treasury** and work through the checklist.

Good luck! 🚀
