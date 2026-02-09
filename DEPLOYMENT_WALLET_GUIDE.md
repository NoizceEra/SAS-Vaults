# 💰 Deployment Wallet Setup Guide

**Created:** February 9, 2026  
**Purpose:** Understanding wallet requirements and SOL funding for deployment

---

## 🎯 Quick Answer

**How much SOL:** ~0.5 SOL (to be safe, covers deployment + buffer)  
**Where to send:** To a NEW wallet you'll create in Solana Playground  
**Private keys:** YES, you'll have full control via seed phrase  

---

## 📋 Step-by-Step Wallet Setup

### Step 1: Create Deployment Wallet in Solana Playground

1. **Open Solana Playground** (in incognito/private window)
   - URL: https://beta.solpg.io/

2. **Create New Wallet**
   - Click the wallet icon (👛) in top-right corner
   - Click "Create New Wallet"
   - **IMPORTANT:** Playground will show you a **seed phrase** (12 or 24 words)

3. **SAVE YOUR SEED PHRASE** ✅
   ```
   ⚠️ CRITICAL: Write down these words on paper!
   
   Example format:
   1. word1    7. word7
   2. word2    8. word8
   3. word3    9. word9
   4. word4    10. word10
   5. word5    11. word11
   6. word6    12. word12
   
   Store this paper in a safe place!
   ```

4. **Get Your Wallet Address**
   - After creating wallet, Playground shows your public key
   - Example: `7bpVT2yJi5Xaz9qw3yussWK9LmUwutZWpgXjadyxMHAJ`
   - Copy this address

---

## 💸 Funding Your Deployment Wallet

### Option A: From Another Wallet (Recommended)

**If you have SOL in Phantom, Solflare, or another wallet:**

1. Open your existing wallet
2. Click "Send"
3. Paste the Playground wallet address
4. Send **0.5 SOL**
5. Wait for confirmation (~5-10 seconds)

### Option B: Buy SOL Directly

**If you don't have SOL yet:**

1. **Centralized Exchange** (Easiest)
   - Coinbase, Binance, Kraken, etc.
   - Buy SOL
   - Withdraw to your Playground wallet address
   - **Minimum:** 0.5 SOL

2. **On-Ramp Services**
   - Moonpay, Ramp, Transak
   - Buy SOL with credit card
   - Send to Playground wallet address

### Option C: From This Computer (⚠️ NOT RECOMMENDED)

**Given your malware situation, DO NOT:**
- ❌ Use Phantom wallet on this computer
- ❌ Import existing wallets to this computer
- ❌ Create wallets locally with Solana CLI

**Why:** Your computer was compromised. Any private keys saved to disk could be stolen.

---

## 💰 Cost Breakdown

### What You're Paying For

```
┌─────────────────────────────────────────────────┐
│           DEPLOYMENT COST BREAKDOWN             │
├─────────────────────────────────────────────────┤
│ Program Deployment Rent:     0.30-0.40 SOL     │
│ Transaction Fees:            0.00001 SOL       │
│ Treasury Initialization:     0.002 SOL         │
│ Buffer (for safety):         0.10 SOL          │
├─────────────────────────────────────────────────┤
│ TOTAL NEEDED:                ~0.5 SOL          │
│ (At $100/SOL = $50)                             │
└─────────────────────────────────────────────────┘
```

### Where Does the SOL Go?

1. **Program Rent (~0.35 SOL)**
   - Paid to Solana blockchain
   - Stores your compiled program on-chain
   - This is "rent-exempt" - you get it back if you close the program

2. **Transaction Fees (~0.00001 SOL)**
   - Paid to validators
   - Covers computational cost
   - Very small amount

3. **Treasury Account Rent (~0.002 SOL)**
   - Creates the treasury config account
   - Rent-exempt storage
   - One-time cost

4. **Buffer (~0.10 SOL)**
   - Stays in your wallet
   - For future transactions
   - Testing, initialization, etc.

---

## 🔐 Private Key Control - YES, You Own It!

### How Solana Playground Wallets Work

```
┌──────────────────────────────────────────────────┐
│         SOLANA PLAYGROUND WALLET STORAGE         │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. You create wallet in browser                │
│  2. Playground generates seed phrase            │
│  3. Seed phrase shown to YOU (write it down!)   │
│  4. Private key stored in browser localStorage  │
│  5. You can export/import anytime               │
│                                                  │
│  ✅ YOU control the private keys                │
│  ✅ Playground cannot access your funds         │
│  ✅ You can import to other wallets later       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Exporting Your Private Key

**Method 1: Seed Phrase (Recommended)**
- You already wrote down the 12-word seed phrase
- Import this into any Solana wallet:
  - Phantom
  - Solflare
  - Backpack
  - Ledger (with seed phrase recovery)

**Method 2: Export from Playground**
1. Click wallet icon in Playground
2. Click "Export Private Key"
3. Copy the base58 string
4. Save to password manager (NOT to a file on disk!)

**Method 3: Browser Console (Advanced)**
```javascript
// In Playground, open browser console (F12)
// Run this to see your private key:
localStorage.getItem('wallet')
```

---

## 🛡️ Security Best Practices

### ✅ DO THIS

1. **Write seed phrase on paper**
   - Not on computer
   - Not in cloud storage
   - Not in screenshots
   - Physical paper only!

2. **Use incognito/private window**
   - Prevents browser extensions from seeing keys
   - Isolates from other tabs
   - Clears data when closed

3. **Create fresh wallet for deployment**
   - Don't reuse existing wallets
   - Keeps deployment funds separate
   - Easier to track costs

4. **Verify addresses before sending**
   - Double-check wallet address
   - Send small test amount first
   - Confirm receipt before sending full amount

### ❌ DON'T DO THIS

1. **Don't save private keys to files**
   - Your computer has malware
   - Files can be stolen
   - Use seed phrase instead

2. **Don't use main wallet**
   - Keep deployment separate
   - Limits exposure if compromised
   - Easier accounting

3. **Don't share seed phrase**
   - Not with support
   - Not in screenshots
   - Not in chat/email

4. **Don't send more than needed**
   - 0.5 SOL is enough
   - Can always add more later
   - Reduces risk

---

## 📊 Wallet Lifecycle

### During Deployment

```
Your Wallet Balance:
├─ Start:        0.5 SOL
├─ Deploy:      -0.35 SOL (program rent)
├─ Init:        -0.002 SOL (treasury)
└─ Remaining:    ~0.148 SOL (for future use)
```

### After Deployment

**The wallet becomes your "Protocol Authority Wallet":**
- Controls the treasury
- Can pause the protocol
- Can update TVL cap (in future versions)
- Receives platform fees

**You should:**
- Keep the seed phrase safe
- Don't delete the wallet
- Use it for protocol management
- Consider multi-sig in future

---

## 🔄 Importing to Other Wallets Later

### To Phantom Wallet

1. Open Phantom
2. Click "Add/Connect Wallet"
3. Select "Import Private Key"
4. Enter your 12-word seed phrase
5. Wallet imported! ✅

### To Solflare Wallet

1. Open Solflare
2. Click "Access Wallet"
3. Select "Import Wallet"
4. Enter seed phrase
5. Done! ✅

### To Hardware Wallet (Ledger)

1. Reset Ledger (if needed)
2. Choose "Restore from recovery phrase"
3. Enter your 12 words
4. Wallet restored to hardware! ✅

---

## 💡 Common Questions

### Q: Can I use the same wallet for multiple deployments?
**A:** Yes! The wallet is just a funding source. You can deploy multiple programs from the same wallet.

### Q: What if I lose the seed phrase?
**A:** You lose access to the wallet forever. There's no recovery. This is why writing it down is critical.

### Q: Can Solana Playground see my private keys?
**A:** No. Keys are stored locally in your browser. Playground code runs client-side only.

### Q: Should I keep SOL in this wallet long-term?
**A:** Yes, you'll need it for:
- Initializing the treasury
- Future protocol updates
- Collecting fees
- Emergency operations

### Q: Can I change the authority wallet later?
**A:** Not in the current minimal version. You'd need to add an `update_authority` instruction in a future upgrade.

---

## 🎯 Recommended Funding Strategy

### For MVP Launch

```
Deployment Wallet:     0.5 SOL
├─ Program Deploy:     0.35 SOL (locked in program)
├─ Treasury Init:      0.002 SOL (locked in account)
└─ Operating Buffer:   0.148 SOL (available)

Personal Wallet:       Keep separate
└─ For testing deposits/withdrawals as a user
```

### For Production Launch

```
Deployment Wallet:     1.0 SOL
├─ Program Deploy:     0.35 SOL
├─ Treasury Init:      0.002 SOL
├─ Marketing Budget:   0.3 SOL (airdrops, incentives)
└─ Operating Buffer:   0.348 SOL

Multi-Sig Wallet:      Consider for treasury authority
└─ Requires 2-3 signatures for critical operations
```

---

## 📝 Deployment Checklist

- [ ] Open Solana Playground in incognito window
- [ ] Create new wallet in Playground
- [ ] Write down 12-word seed phrase on paper
- [ ] Copy wallet address
- [ ] Send 0.5 SOL to wallet address
- [ ] Confirm SOL received (check balance in Playground)
- [ ] Proceed with deployment
- [ ] Save Program ID after deployment
- [ ] Store seed phrase in safe place
- [ ] Test with small deposit/withdrawal

---

## 🚨 Emergency Recovery

### If You Lose Access to Playground

1. **You have the seed phrase:**
   - ✅ Import to Phantom/Solflare
   - ✅ Full access restored
   - ✅ Can manage protocol

2. **You don't have the seed phrase:**
   - ❌ Wallet lost forever
   - ❌ Cannot access deployment funds
   - ❌ Cannot manage protocol
   - ⚠️ Program still works, but you can't update it

### If Playground Goes Down

- Your wallet is NOT tied to Playground
- Import seed phrase to any Solana wallet
- Continue managing protocol from there
- Playground is just a convenient interface

---

## ✅ Final Checklist Before Sending SOL

1. [ ] I created a NEW wallet in Solana Playground
2. [ ] I wrote down the seed phrase on PAPER
3. [ ] I verified the wallet address is correct
4. [ ] I'm sending from a SAFE source (not this compromised computer)
5. [ ] I'm sending 0.5 SOL (not more, not less)
6. [ ] I understand I control the private keys
7. [ ] I know how to import the wallet later if needed
8. [ ] I'm ready to deploy!

---

**Next Step:** Once you've funded the wallet, paste the code from `DEPLOY_MINIMAL_NOW.md` into Solana Playground and click "Build" then "Deploy"! 🚀

---

*Remember: Your seed phrase = Your money. Protect it like cash!*
