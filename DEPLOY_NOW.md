# Quick Deployment Guide - Use Solana Playground

## Current Status
✅ Program built successfully in Solana Playground  
✅ Wallet funded with ~1 SOL  
✅ Connected to mainnet-beta  

## Deploy Now (Simplest Method)

Since the program is already built in Solana Playground, you can deploy it directly from there:

### Step 1: Import Your Wallet to Solana Playground

1. In Solana Playground (already open at beta.solpg.io)
2. Click the "Wallet" button in the top right
3. Click the "..." (More) menu
4. Select "Import"
5. Paste your private key: `65vpNgiMKa5chXu9z7d3uHW8dU1M7UUdvPRAo9wtna9XQYBzYDb2BCT6Z3tnpKPZnSLmtFFFjAtQwpaWVQfjPrqB`
6. Confirm the import

### Step 2: Deploy

1. Click the "Deploy" button in the left sidebar (under "Build & Deploy")
2. Confirm the transaction in the wallet popup
3. Wait for deployment to complete (~30-60 seconds)

### Step 3: Verify

After deployment, you'll see:
- Program ID in the left sidebar
- Deployment transaction signature
- Success message in the terminal

## Important Notes

- **Cost**: Deployment will cost approximately 1-2 SOL (for program storage rent)
- **Program ID**: After deployment, you'll get a new program ID - you'll need to update `declare_id!` in your code if you want to redeploy
- **Upgradeable**: The program will be upgradeable by default using the wallet you deployed with

## Alternative: Use CLI (If Playground Fails)

If Solana Playground deployment fails, you can use the CLI:

```powershell
# Your wallet is already configured at:
# C:\Users\vclin_jjufoql\.config\solana\deployer.json

# Once you have the .so file, deploy with:
solana program deploy auto_savings.so

# Or deploy with a specific program ID:
solana program deploy auto_savings.so --program-id target/deploy/auto_savings-mainnet-keypair.json
```

## Next Steps After Deployment

1. **Initialize Treasury**: Run `node scripts/initialize-mainnet-treasury.js`
2. **Update Frontend**: Update the program ID in your frontend configuration
3. **Test**: Create a test deposit to verify everything works

---

**Ready to deploy?** Just follow Step 1 and Step 2 above in Solana Playground!
