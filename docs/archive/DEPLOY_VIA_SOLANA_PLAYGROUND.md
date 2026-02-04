# 🚨 CRITICAL: Deploy via Solana Playground

## Situation Summary

After extensive testing, I've discovered that **both** deployed programs have mismatches:
- `B4Zbm8qH2zLYSt7b3E79NNBCPvG1zQyUDiGWwDXcvG8Z` - IDL doesn't match (InstructionFallbackNotFound)
- `8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR` - Declared ID doesn't match (DeclaredProgramIdMismatch)

Local builds fail due to Windows permission errors.

## ✅ SOLUTION: Deploy via Solana Playground

This is the cleanest, fastest way to get a working deployment.

### Step 1: Open Solana Playground
1. Go to https://beta.solpg.io/
2. Click "Connect Wallet" (use your funded wallet)
3. Ensure you're on **Devnet**

### Step 2: Create New Project
1. Click "Create a new project"
2. Select "Anchor" template
3. Name it "auto-savings"

### Step 3: Copy Your Source Code
1. Delete the default `lib.rs` content
2. Copy the entire contents of `programs/auto-savings/src/lib.rs`
3. Paste into Solana Playground

### Step 4: Update Cargo.toml
In Solana Playground, update `Cargo.toml`:
```toml
[package]
name = "auto-savings"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "auto_savings"

[dependencies]
anchor-lang = "0.32.1"
```

### Step 5: Build
1. Click the "Build" button (🔨 icon)
2. Wait for compilation to complete
3. You should see "Build successful"

### Step 6: Deploy
1. Click the "Deploy" button
2. Approve the transaction in your wallet
3. **SAVE THE PROGRAM ID** that appears after deployment

### Step 7: Download the IDL
1. After deployment, click "Export IDL"
2. Save the JSON file
3. This is your correct, matching IDL

### Step 8: Update Frontend
1. Copy the Program ID from Step 6
2. Update `frontend/.env.local`:
   ```
   VITE_PROGRAM_ID=<YOUR_NEW_PROGRAM_ID>
   ```
3. Update `frontend/src/config/solana.js`:
   ```javascript
   export const PROGRAM_ID = new PublicKey('<YOUR_NEW_PROGRAM_ID>');
   ```
4. Replace `frontend/src/idl/idl.js` with the downloaded IDL (convert JSON to JS format)

### Step 9: Test
```bash
node test-vault-creation.js
```

Should work perfectly!

### Step 10: Deploy to Vercel
1. Update Vercel environment variable:
   - `VITE_PROGRAM_ID` = `<YOUR_NEW_PROGRAM_ID>`
2. Push changes:
   ```bash
   git add .
   git commit -m "Fix: Deploy working program via Solana Playground"
   git push
   ```

## Why This Works

Solana Playground:
- ✅ Handles all build tooling
- ✅ Generates correct IDL automatically
- ✅ No Windows permission issues
- ✅ Ensures `declare_id!` matches deployment
- ✅ Takes 5 minutes total

## Alternative (If You Prefer CLI)

If you want to fix the local build:
1. Run PowerShell as Administrator
2. `anchor clean`
3. `anchor build`
4. `anchor deploy`

But Solana Playground is faster and more reliable.
