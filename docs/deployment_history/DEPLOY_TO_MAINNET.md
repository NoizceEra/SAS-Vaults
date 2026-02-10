# Deploy Auto-Savings to Solana Mainnet

## Quick Deployment Guide

Since building locally has dependency issues, here's the **simplest path** to deploy:

### Option 1: Use Solana Playground (Recommended for Quick Deploy)

1. **Open Solana Playground**: https://beta.solpg.io ✅ (Already done - connected to mainnet-beta)

2. **Import Your Program**:
   - Click "Import" in the Projects section
   - Upload your entire `programs/auto-savings/src` folder
   - Or manually copy `lib.rs` content into the editor

3. **Build in Playground**:
   - Click the "Build" button in the sidebar
   - Wait for compilation (Playground handles all dependencies automatically)

4. **Deploy**:
   - Click "Deploy" button
   - Playground will use its wallet (you'll need to fund it with SOL for deployment costs)
   - **IMPORTANT**: After deployment, you'll get a new program ID - you'll need to update `declare_id!` in your code

### Option 2: Deploy from Command Line (If you can build successfully)

```powershell
# 1. Set Solana to mainnet
solana config set --url mainnet-beta

# 2. Check your wallet balance (you need ~5-10 SOL for deployment)
solana balance

# 3. Build the program (if this works)
anchor build

# 4. Deploy using your existing keypair
solana program deploy target/deploy/auto_savings.so --program-id target/deploy/auto_savings-mainnet-keypair.json

# 5. Initialize the treasury
node scripts/initialize-mainnet-treasury.js
```

### Option 3: Use Pre-Built Artifact from GitHub Actions

Once the GitHub Actions build succeeds:

1. Go to: https://github.com/NoizceEra/SAS-Vaults/actions
2. Click on the successful build run
3. Download `program-artifacts.zip`
4. Extract and deploy:
   ```powershell
   solana config set --url mainnet-beta
   solana program deploy auto_savings.so --program-id auto_savings-mainnet-keypair.json
   ```

## Current Status

- ✅ Program ID: `V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`
- ✅ Mainnet keypair exists: `target/deploy/auto_savings-mainnet-keypair.json`
- ✅ Solana Playground connected to mainnet-beta
- ⏳ GitHub Actions build in progress

## Next Steps

**Recommended**: Use Solana Playground since it handles all build dependencies automatically and you're already connected to mainnet-beta.

**Alternative**: Wait for GitHub Actions build to complete, then use Option 3.
