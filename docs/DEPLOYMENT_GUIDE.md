# 🚀 Deployment Guide - Solana Auto-Savings Protocol

**Last Updated:** February 4, 2026  
**Status:** Comprehensive deployment guide for Devnet and Mainnet

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Build Process](#build-process)
4. [Deployment Methods](#deployment-methods)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Troubleshooting](#troubleshooting)
7. [Mainnet Deployment](#mainnet-deployment)

---

## ✅ Prerequisites

### Required Tools
- **Solana CLI** 1.18+ installed and configured
- **Anchor Framework** 0.29.0
- **Rust** 1.70+
- **Node.js** 18+
- **Git** for version control

### Required Accounts
- Solana wallet with sufficient SOL:
  - **Devnet:** ~3 SOL (can use faucet)
  - **Mainnet:** ~5-10 SOL (for deployment + rent)
- Upgrade authority wallet (keep private key secure!)

### Verify Installation
```bash
# Check versions
solana --version
anchor --version
rustc --version
node --version

# Check Solana config
solana config get

# Check wallet balance
solana balance
```

---

## 📝 Pre-Deployment Checklist

### Code Readiness
- [ ] All tests passing (`anchor test`)
- [ ] Build completes without errors (`anchor build`)
- [ ] Program binary exists at `target/deploy/auto_savings.so`
- [ ] IDL generated at `target/idl/auto_savings.json`
- [ ] No compilation warnings or errors
- [ ] Code reviewed and audited (for Mainnet)

### Configuration
- [ ] Program ID generated (`solana-keygen new -o target/deploy/auto_savings-keypair.json`)
- [ ] Program ID updated in `lib.rs` (`declare_id!()`)
- [ ] Program ID updated in `Anchor.toml`
- [ ] Network set correctly (`solana config set --url <network>`)
- [ ] Wallet has sufficient balance

### Documentation
- [ ] README updated with new Program ID
- [ ] Frontend config updated
- [ ] Integration docs updated
- [ ] Changelog updated

---

## 🔨 Build Process

### 1. Clean Build
```bash
# Clean previous builds
anchor clean

# Build the program
anchor build

# Verify build output
ls -la target/deploy/
```

**Expected Output:**
```
auto_savings.so           # Compiled program
auto_savings-keypair.json # Program keypair
```

### 2. Run Tests
```bash
# Run all tests
anchor test

# Run specific test
anchor test --skip-deploy -- --test <test_name>
```

### 3. Verify Program Size
```bash
# Check program size (should be < 200KB for efficiency)
ls -lh target/deploy/auto_savings.so
```

---

## 🌐 Deployment Methods

### Method 1: Anchor CLI (Recommended)

#### Deploy to Devnet
```bash
# Set network
solana config set --url devnet

# Check balance
solana balance

# Deploy
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <PROGRAM_ID>
```

#### Deploy with Specific Program ID
```bash
# Use existing keypair
anchor deploy --program-id target/deploy/auto_savings-keypair.json --provider.cluster devnet
```

### Method 2: Solana Playground (Alternative)

**Use Case:** When local build fails or for quick testing

1. **Go to:** https://beta.solpg.io
2. **Import Project:**
   - Click "Import" → "From GitHub" or paste `lib.rs`
3. **Build:**
   - Click "Build" button
   - Wait for compilation
4. **Deploy:**
   - Click "Deploy" button
   - Confirm wallet connection
   - Approve transaction
5. **Copy Program ID** from terminal output

**⚠️ Important:** Export your Playground wallet keypair for future upgrades!

### Method 3: Solana CLI (Manual)

```bash
# Deploy program
solana program deploy target/deploy/auto_savings.so \
  --program-id target/deploy/auto_savings-keypair.json \
  --url devnet

# Verify
solana program show <PROGRAM_ID> --url devnet
```

---

## 🔄 Post-Deployment Steps

### 1. Update Program ID

**File:** `programs/auto-savings/src/lib.rs`
```rust
// Line 5 - Update this:
declare_id!("YOUR_NEW_PROGRAM_ID_HERE");
```

**File:** `Anchor.toml`
```toml
[programs.devnet]
auto_savings = "YOUR_NEW_PROGRAM_ID_HERE"
```

### 2. Rebuild with New Program ID

**⚠️ CRITICAL:** The Program ID must be embedded in the binary!

```bash
# Rebuild
anchor build

# Redeploy (this is an upgrade)
anchor deploy --provider.cluster devnet
```

### 3. Initialize Treasury

**One-time setup** (admin only):
```bash
# Using Anchor client
anchor run initialize-treasury
```

Or via Solana Playground:
1. Select `initializeTreasury` instruction
2. Click "Test"
3. Confirm transaction

### 4. Verify Deployment

```bash
# Check program account
solana program show <PROGRAM_ID>

# Check program size
solana program show <PROGRAM_ID> --programs

# View recent transactions
solana transaction-history <PROGRAM_ID> --limit 5
```

### 5. Update Frontend

**File:** `frontend/src/config/solana.js`
```javascript
export const PROGRAM_ID = new PublicKey('YOUR_NEW_PROGRAM_ID_HERE');
```

**File:** `frontend/.env.local`
```env
NEXT_PUBLIC_PROGRAM_ID=YOUR_NEW_PROGRAM_ID_HERE
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

### 6. Copy IDL to Frontend

```bash
# Copy IDL
cp target/idl/auto_savings.json frontend/src/idl/

# Verify
cat frontend/src/idl/auto_savings.json | grep "version"
```

### 7. Test Deployment

```bash
# Test user initialization
node scripts/test-user-init.js

# Test deposit
node scripts/test-deposit.js

# Test withdrawal
node scripts/test-withdraw.js
```

---

## 🐛 Troubleshooting

### Build Errors

#### Error: "Access denied"
**Solution:** Run PowerShell as Administrator
```powershell
# Right-click PowerShell → Run as Administrator
```

#### Error: "Program ID mismatch"
**Solution:** Update `declare_id!()` and rebuild
```bash
# 1. Update lib.rs with new Program ID
# 2. Rebuild
anchor build
# 3. Redeploy
anchor deploy --provider.cluster devnet
```

#### Error: "Anchor version mismatch"
**Solution:** Update Anchor version in `Cargo.toml`
```toml
[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

### Deployment Errors

#### Error: "Insufficient funds"
**Solution:** Get more SOL
```bash
# Devnet airdrop
solana airdrop 2

# Or use faucet: https://faucet.solana.com
```

#### Error: "Program already deployed"
**Solution:** Use upgrade instead
```bash
anchor upgrade target/deploy/auto_savings.so \
  --program-id <PROGRAM_ID> \
  --provider.cluster devnet
```

#### Error: "Transaction timeout"
**Solution:** Retry with higher priority fee
```bash
# Set higher compute budget
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
anchor deploy --provider.cluster devnet
```

#### Error: "Program too large"
**Solution:** Optimize build
```bash
# Add to Cargo.toml
[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
```

### Frontend Errors

#### Error: "Program not found"
**Solution:** Check Program ID in config
```javascript
// Verify this matches deployed program
console.log(PROGRAM_ID.toString());
```

#### Error: "IDL mismatch"
**Solution:** Copy latest IDL
```bash
cp target/idl/auto_savings.json frontend/src/idl/
```

#### Error: "Transaction failed"
**Solution:** Check wallet connection and balance
```javascript
// Ensure wallet is connected
if (!wallet.connected) {
  await wallet.connect();
}

// Check balance
const balance = await connection.getBalance(wallet.publicKey);
console.log('Balance:', balance / 1e9, 'SOL');
```

---

## 🌟 Mainnet Deployment

### Pre-Mainnet Checklist

**⚠️ CRITICAL - Do NOT skip these steps!**

- [ ] **Security Audit** completed by third party
- [ ] **Extensive testing** on Devnet (minimum 2 weeks)
- [ ] **Stress testing** with realistic transaction volumes
- [ ] **Gas optimization** completed
- [ ] **Emergency procedures** documented
- [ ] **Rollback plan** prepared
- [ ] **Insurance/bug bounty** program set up
- [ ] **Legal review** completed
- [ ] **Sufficient SOL** for deployment (~10 SOL recommended)

### Mainnet Deployment Process

```bash
# 1. Switch to Mainnet
solana config set --url mainnet-beta

# 2. Verify wallet balance (need ~10 SOL)
solana balance

# 3. Generate new Program ID for Mainnet
solana-keygen new -o target/deploy/auto_savings-mainnet-keypair.json

# 4. Update Program ID in code
# Edit lib.rs and Anchor.toml with new Mainnet Program ID

# 5. Build for Mainnet
anchor build

# 6. Final verification
anchor test

# 7. Deploy to Mainnet
anchor deploy --provider.cluster mainnet-beta

# 8. Verify deployment
solana program show <MAINNET_PROGRAM_ID>

# 9. Initialize treasury (admin only)
anchor run initialize-treasury --provider.cluster mainnet-beta

# 10. Monitor for first 24 hours
solana logs <MAINNET_PROGRAM_ID> --url mainnet-beta
```

### Post-Mainnet Steps

1. **Update all configs** to Mainnet Program ID
2. **Deploy frontend** with Mainnet configuration
3. **Monitor transactions** closely for 24-48 hours
4. **Set up alerts** for unusual activity
5. **Prepare support** for user questions
6. **Announce launch** on social media
7. **Update documentation** with Mainnet info

### Mainnet Monitoring

```bash
# Watch program logs
solana logs <PROGRAM_ID> --url mainnet-beta

# Monitor transactions
watch -n 5 'solana transaction-history <PROGRAM_ID> --limit 10'

# Check program account
solana program show <PROGRAM_ID> --url mainnet-beta
```

---

## 📊 Deployment Verification Checklist

### Smart Contract
- [ ] Program deployed successfully
- [ ] Program ID matches in all files
- [ ] Treasury initialized
- [ ] Can create user accounts
- [ ] Can deposit SOL
- [ ] Can withdraw SOL
- [ ] Fees collected correctly
- [ ] All instructions working

### Frontend
- [ ] Deployed to hosting (Vercel/Netlify)
- [ ] Connects to correct network
- [ ] Wallet connection works
- [ ] UI displays correctly
- [ ] Transactions execute successfully
- [ ] Error handling works
- [ ] Analytics tracking enabled

### Explorer Verification
```bash
# View on Solana Explorer
# Devnet: https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
# Mainnet: https://explorer.solana.com/address/<PROGRAM_ID>
```

---

## 🎯 Quick Reference Commands

```bash
# Build
anchor build

# Test
anchor test

# Deploy to Devnet
anchor deploy --provider.cluster devnet

# Deploy to Mainnet
anchor deploy --provider.cluster mainnet-beta

# Upgrade existing program
anchor upgrade target/deploy/auto_savings.so --program-id <PROGRAM_ID>

# Get Program ID from keypair
solana-keygen pubkey target/deploy/auto_savings-keypair.json

# Check program
solana program show <PROGRAM_ID>

# View logs
solana logs <PROGRAM_ID>

# Airdrop (Devnet only)
solana airdrop 2
```

---

## 📞 Support

If you encounter issues:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review error messages carefully
3. Verify all prerequisites are met
4. Check Solana status: https://status.solana.com
5. Open an issue on GitHub

---

**Happy Deploying! 🚀**
