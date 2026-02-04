# 🚀 Swap Feature Deployment Guide

> **⚠️ DEPLOYMENT PAUSED - WAITING FOR DEVNET FUNDS**
> **Status**: Code Fixed & Built. Deployment Pending.
> **Reason**: Devnet faucet rate limit reached. Access blocked for today.
> **Resume Date**: Tomorrow (Feb 5, 2026)
> **Wallet to Fund**: `GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U` (Needs ~3 SOL total)

**Date:** February 4, 2026
**Feature:** Token Swap Integration (Phase 1)
**Network:** Devnet → Mainnet

---

## 📋 Pre-Deployment Checklist

### Build Status
- [ ] `anchor build` completed successfully
- [ ] No compilation errors
- [ ] Program binary exists at `target/deploy/auto_savings.so`
- [ ] IDL generated at `target/idl/auto_savings.json`

### Configuration
- [ ] Program ID updated in `lib.rs`
- [ ] Program ID updated in `Anchor.toml`
- [ ] Frontend config updated
- [ ] Environment variables set

### Testing
- [ ] Local tests passing
- [ ] Integration tests passing
- [ ] UI components tested locally

---

## 🔧 Step 1: Build the Program

### Option A: Local Build (If Successful)
```powershell
# Clean previous build
anchor clean

# Build program
anchor build

# Verify build
ls target/deploy/auto_savings.so
ls target/idl/auto_savings.json
```

### Option B: Solana Playground (If Local Build Fails)
1. Go to https://beta.solpg.io
2. Import project or paste `lib.rs`
3. Click "Build"
4. Download compiled program
5. Download IDL

---

## 🎯 Step 2: Deploy to Devnet

### Set Network to Devnet
```powershell
solana config set --url devnet
```

### Check Balance
```powershell
# Check deployer wallet balance
solana balance

# If low, airdrop SOL
solana airdrop 2
```

### Deploy Program
```powershell
# Deploy (will generate new Program ID if first time)
anchor deploy --provider.cluster devnet

# Or specify program ID
anchor deploy --program-id target/deploy/auto_savings-keypair.json --provider.cluster devnet
```

### Expected Output:
```
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: <YOUR_WALLET>
Deploying program "auto_savings"...
Program path: target/deploy/auto_savings.so...
Program Id: <NEW_PROGRAM_ID>

Deploy success
```

---

## 📝 Step 3: Update Program ID

### Get New Program ID
```powershell
# From deployment output, or:
solana-keygen pubkey target/deploy/auto_savings-keypair.json
```

### Update Smart Contract
**File:** `programs/auto-savings/src/lib.rs`
```rust
// Line 5 - Update this:
declare_id!("YOUR_NEW_PROGRAM_ID_HERE");
```

### Update Anchor Config
**File:** `Anchor.toml`
```toml
[programs.devnet]
auto_savings = "YOUR_NEW_PROGRAM_ID_HERE"

[programs.mainnet]
auto_savings = "YOUR_NEW_PROGRAM_ID_HERE"  # Update later for mainnet
```

### Update Frontend Config
**File:** `frontend/src/config/solana.js`
```javascript
export const PROGRAM_ID = new PublicKey('YOUR_NEW_PROGRAM_ID_HERE');
```

---

## 🔄 Step 4: Rebuild & Redeploy (Important!)

After updating Program ID, you MUST rebuild and redeploy:

```powershell
# Rebuild with new Program ID
anchor build

# Deploy again (this ensures Program ID matches)
anchor deploy --provider.cluster devnet
```

**Why?** The Program ID must be embedded in the compiled binary.

---

## 📦 Step 5: Update IDL

### Copy IDL to Frontend
```powershell
# Copy IDL
Copy-Item target/idl/auto_savings.json frontend/src/idl/

# Or manually copy the file
```

### Verify IDL
**Check:** `frontend/src/idl/auto_savings.json`
- Should contain new instructions: `initializeTokenVault`, `swapToToken`, `setAutoSwap`, `withdrawToken`
- Program address should match new Program ID

---

## 🏦 Step 6: Initialize Treasury (One-Time)

### Using Solana Playground (Recommended)
1. Go to https://beta.solpg.io
2. Import treasury authority wallet
3. Select `initializeTreasury` instruction
4. Click "Test"
5. Confirm transaction

### Using CLI (Alternative)
```powershell
# Create initialize script
node scripts/initialize-treasury.js
```

### Verify Treasury
```powershell
# Check treasury status
node scripts/manage-treasury.js check
```

---

## 🧪 Step 7: Test Deployment

### Test User Initialization
```powershell
# Test script
node scripts/test-user-init.js
```

### Test Token Vault Creation
```javascript
// Create test script: scripts/test-token-vault.js
const { PublicKey } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');

async function testTokenVault() {
  // Initialize token vault for USDC
  const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  
  const tx = await program.methods
    .initializeTokenVault(usdcMint)
    .accounts({
      user: wallet.publicKey,
    })
    .rpc();
    
  console.log('Token vault created:', tx);
}
```

### Test Auto-Swap Config
```javascript
// Test auto-swap configuration
const tx = await program.methods
  .setAutoSwap(
    true,  // enabled
    usdcMint,  // target token
    new BN(1000000000)  // 1 SOL minimum
  )
  .accounts({
    user: wallet.publicKey,
  })
  .rpc();
```

---

## 🌐 Step 8: Deploy Frontend

### Update Environment Variables
**File:** `frontend/.env.local`
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=YOUR_NEW_PROGRAM_ID_HERE
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Build Frontend
```powershell
cd frontend
npm run build
```

### Deploy to Vercel
```powershell
# If using Vercel CLI
vercel --prod

# Or push to GitHub (auto-deploys)
git add .
git commit -m "feat: Add swap feature Phase 1"
git push origin main
```

### Update Vercel Environment Variables
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add/Update:
   - `NEXT_PUBLIC_PROGRAM_ID`
   - `NEXT_PUBLIC_SOLANA_NETWORK`
4. Redeploy

---

## ✅ Step 9: Verification Checklist

### Smart Contract
- [ ] Program deployed successfully
- [ ] Program ID matches in all files
- [ ] Treasury initialized
- [ ] Can create user accounts
- [ ] Can create token vaults
- [ ] Can set auto-swap config

### Frontend
- [ ] Deployed to Vercel
- [ ] Connects to correct network
- [ ] Wallet connection works
- [ ] Swap interface displays
- [ ] Auto-swap config works
- [ ] Token vault dashboard shows

### Explorer Verification
```powershell
# Check program on Solana Explorer
start https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

---

## 📊 Step 10: Monitor & Test

### Create Test Accounts
```javascript
// Test script: scripts/create-test-data.js
async function createTestData() {
  // 1. Initialize user
  await program.methods.initializeUser(10).rpc();
  
  // 2. Create USDC vault
  await program.methods.initializeTokenVault(USDC_MINT).rpc();
  
  // 3. Set auto-swap
  await program.methods.setAutoSwap(true, USDC_MINT, new BN(1e9)).rpc();
  
  console.log('Test data created!');
}
```

### Monitor Transactions
```powershell
# Watch program logs
solana logs YOUR_PROGRAM_ID --url devnet
```

---

## 🚨 Troubleshooting

### Build Fails
**Error:** "Access denied"
**Solution:** Run PowerShell as Administrator

**Error:** "Program ID mismatch"
**Solution:** Update `declare_id!()` and rebuild

### Deployment Fails
**Error:** "Insufficient funds"
**Solution:** Airdrop more SOL
```powershell
solana airdrop 2
```

**Error:** "Program already deployed"
**Solution:** Use upgrade instead
```powershell
anchor upgrade target/deploy/auto_savings.so --program-id YOUR_PROGRAM_ID --provider.cluster devnet
```

### Frontend Issues
**Error:** "Program not found"
**Solution:** Check Program ID in config

**Error:** "IDL mismatch"
**Solution:** Copy latest IDL from `target/idl/`

---

## 🔐 Security Checklist

Before Mainnet:
- [ ] Code audit completed
- [ ] All tests passing
- [ ] Error handling robust
- [ ] Access controls verified
- [ ] Fee calculations correct
- [ ] PDA derivations secure
- [ ] No hardcoded values
- [ ] Upgrade authority set correctly

---

## 📈 Post-Deployment

### Announce
- [ ] Update documentation
- [ ] Notify users
- [ ] Post on social media
- [ ] Update README

### Monitor
- [ ] Track transaction volume
- [ ] Monitor error rates
- [ ] Check fee collection
- [ ] User feedback

### Iterate
- [ ] Collect user feedback
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Plan Phase 2

---

## 🎯 Quick Deploy Commands

### Full Deployment Flow
```powershell
# 1. Clean and build
anchor clean
anchor build

# 2. Deploy to Devnet
solana config set --url devnet
anchor deploy --provider.cluster devnet

# 3. Get Program ID
$PROGRAM_ID = solana-keygen pubkey target/deploy/auto_savings-keypair.json
Write-Host "New Program ID: $PROGRAM_ID"

# 4. Update configs (manual step - update files)
# - lib.rs: declare_id!()
# - Anchor.toml: [programs.devnet]
# - frontend/src/config/solana.js: PROGRAM_ID

# 5. Rebuild with new ID
anchor build

# 6. Redeploy
anchor deploy --provider.cluster devnet

# 7. Copy IDL
Copy-Item target/idl/auto_savings.json frontend/src/idl/

# 8. Deploy frontend
cd frontend
npm run build
vercel --prod
```

---

## 📋 Mainnet Deployment (Future)

When ready for Mainnet:

```powershell
# 1. Switch to Mainnet
solana config set --url mainnet-beta

# 2. Ensure sufficient SOL (deployment costs ~5-10 SOL)
solana balance

# 3. Deploy
anchor deploy --provider.cluster mainnet-beta

# 4. Update all configs to Mainnet Program ID

# 5. Initialize treasury with Mainnet authority

# 6. Deploy frontend with Mainnet config

# 7. Monitor closely for first 24 hours
```

---

## ✅ Success Criteria

Deployment is successful when:
- ✅ Program deployed to Devnet
- ✅ Program ID updated everywhere
- ✅ Treasury initialized
- ✅ Frontend deployed
- ✅ Can create user accounts
- ✅ Can create token vaults
- ✅ UI components working
- ✅ No errors in console

---

## 🎉 You're Ready!

Once build completes, run:
```powershell
anchor deploy --provider.cluster devnet
```

Then follow steps 3-10 above.

**Good luck with your deployment!** 🚀
