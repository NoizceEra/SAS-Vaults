# 🔄 Update Program ID After Deployment

## When to Use This Guide

Use this guide **after** you've deployed the smart contract to Solana devnet and have your Program ID.

---

## 📋 Quick Update Checklist

### **Step 1: Get Your Program ID**
After deploying the smart contract, you'll receive a Program ID like:
```
8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR
```

### **Step 2: Update Frontend Configuration**

Edit `frontend/src/config/solana.js`:

```javascript
// BEFORE (Demo Mode):
export const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

export const FEATURES = {
  ENABLE_DEPOSITS: false,
  ENABLE_WITHDRAWALS: false,
  ENABLE_RATE_UPDATES: false,
  SHOW_DEMO_MODE: true,
};

// AFTER (Production Mode):
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');

export const FEATURES = {
  ENABLE_DEPOSITS: true,
  ENABLE_WITHDRAWALS: true,
  ENABLE_RATE_UPDATES: true,
  SHOW_DEMO_MODE: false,
};
```

### **Step 3: Update Vercel Environment Variables**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update:
   ```
   VITE_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
   ```
5. Click **Save**

### **Step 4: Redeploy**

#### **Option A: Automatic (Git Push)**
```bash
git add .
git commit -m "Update Program ID for production"
git push
```
Vercel will automatically redeploy.

#### **Option B: Manual (Vercel CLI)**
```bash
vercel --prod
```

#### **Option C: Dashboard**
1. Go to Vercel Dashboard
2. Select project
3. Click **Deployments**
4. Click **Redeploy** on latest deployment

---

## ✅ Verification

After redeployment, verify:

1. **Demo Banner Gone**
   - The yellow demo banner should not appear

2. **Buttons Enabled**
   - Deposit button works
   - Withdraw button works
   - Savings rate slider updates

3. **Transactions Work**
   - Can create vault
   - Can deposit SOL
   - Can withdraw SOL
   - Can update savings rate

4. **Console Clean**
   - No errors in browser console
   - Transactions complete successfully

---

## 🧪 Testing Checklist

After updating Program ID:

- [ ] Visit live URL
- [ ] Connect wallet
- [ ] Create vault (if first time)
- [ ] Deposit 0.1 SOL
- [ ] Check balance cards update
- [ ] Adjust savings rate
- [ ] Withdraw 0.05 SOL
- [ ] View transaction in Solana Explorer
- [ ] Test on mobile device
- [ ] Check all animations work

---

## 🐛 Troubleshooting

### **Issue: Buttons Still Disabled**
**Solution:**
- Clear browser cache (Ctrl + Shift + R)
- Check `FEATURES` flags in config
- Verify Vercel env vars updated
- Redeploy

### **Issue: Transaction Fails**
**Solution:**
- Verify Program ID is correct
- Check wallet has SOL for gas
- Ensure smart contract is deployed
- Check Solana devnet status

### **Issue: Demo Banner Still Shows**
**Solution:**
- Set `SHOW_DEMO_MODE: false` in config
- Redeploy
- Clear browser cache

---

## 📝 Example: Complete Update

```javascript
// frontend/src/config/solana.js

import { PublicKey } from '@solana/web3.js';

// ✅ UPDATED with real Program ID
export const PROGRAM_ID = new PublicKey('8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR');

export const NETWORK = 'devnet';
export const COMMITMENT = 'confirmed';

export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};

export const PLATFORM_FEE_BPS = 40;
export const DEFAULT_SAVINGS_RATE = 50;

export const EXPLORER_URL = `https://explorer.solana.com/?cluster=${NETWORK}`;

export const getExplorerUrl = (signature, type = 'tx') => {
  return `${EXPLORER_URL}/${type}/${signature}`;
};

// ✅ UPDATED to enable all features
export const FEATURES = {
  ENABLE_DEPOSITS: true,
  ENABLE_WITHDRAWALS: true,
  ENABLE_RATE_UPDATES: true,
  SHOW_DEMO_MODE: false, // ← Demo mode OFF
};

export const DEMO_MODE_MESSAGE = '';
```

---

## 🎉 Success!

After updating:
- ✅ Demo banner removed
- ✅ All features enabled
- ✅ Transactions working
- ✅ Full functionality live

**Your Auto-Savings Protocol is now fully operational!** 🚀

---

**Quick Reference:**
- Program ID location: `frontend/src/config/solana.js`
- Vercel env vars: Dashboard → Settings → Environment Variables
- Redeploy: `git push` or `vercel --prod`
