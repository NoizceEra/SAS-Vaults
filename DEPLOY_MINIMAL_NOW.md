# 🚀 Deploy Minimal Version NOW

## Current Status
✅ Minimal version created (420 lines vs 1510 lines)
✅ Phantom wallet connected with ~1 SOL
✅ Expected deployment cost: **~0.5-0.7 SOL** (not 11 SOL!)

## Step-by-Step Deployment in Solana Playground

### 1. Open Solana Playground
Go to: https://beta.solpg.io/

### 2. Paste the Minimal Code
1. Click on `lib.rs` in the left sidebar
2. **Select ALL** the current code (Ctrl+A)
3. **Delete** it
4. **Paste** the minimal code from: `programs\auto-savings\src\lib.rs`
   - This file has already been replaced with the minimal version

### 3. Configure Settings
1. Click the **Settings** icon (gear) at the bottom left
2. Set **Endpoint** to `mainnet-beta`
3. Ensure **Phantom** wallet is connected (top right)

### 4. Build the Program
1. Click the **Build** button (hammer icon)
2. Wait ~15-30 seconds for build to complete
3. Check terminal for "Build successful"
4. **IMPORTANT**: Look for the binary size in the output
   - Should be around **100-200 KB** (not 1.5 MB!)

### 5. Deploy to Mainnet
1. Click the **Deploy** button
2. Phantom wallet will pop up asking for approval
3. **CHECK THE COST**: Should be **~0.5-0.7 SOL** (not 11 SOL!)
4. If cost looks correct, approve the transaction
5. Wait for deployment confirmation

### 6. Save the Program ID
After successful deployment:
1. Copy the **Program ID** from the terminal
2. Save it to update `lib.rs` later
3. This will be your mainnet program address

## What's Included in This Minimal Version

✅ **Core Features**:
- Treasury initialization
- User account creation
- Deposit SOL with 0.4% fee
- Withdraw SOL with 0.4% fee
- Update savings rate
- TVL cap (10 SOL safety limit)
- Pause functionality

❌ **Removed** (to reduce size):
- Jupiter swap integration
- Token vaults (SPL tokens)
- Multi-account allocations
- Auto-swap features

## Troubleshooting

### If Build Fails
- Refresh the Solana Playground page
- Try pasting the code again
- Check that you're using the minimal version (420 lines)

### If Deployment Cost is Still High
- **STOP** - Don't deploy!
- The wrong code might be loaded
- Verify the file size in the build output

### If Deployment Succeeds
1. Copy the Program ID
2. Update `lib.rs` with the new ID in `declare_id!()`
3. Test the program with the frontend

## Next Steps After Deployment

1. **Initialize Treasury**:
   ```bash
   node scripts/manage-treasury.js
   ```

2. **Update Frontend**:
   - Update `PROGRAM_ID` in frontend config
   - Deploy frontend to Netlify

3. **Test Core Functions**:
   - Create user account
   - Test deposit
   - Test withdrawal

---

**Ready to deploy? Follow the steps above in Solana Playground!**
