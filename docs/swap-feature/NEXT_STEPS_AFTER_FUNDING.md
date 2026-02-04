# ⏭️ Next Steps: Resuming Deployment

**Context**: We fixed the smart contract bugs (`lib.rs`) but hit the Devnet faucet rate limit (`429 Too Many Requests`) when trying to deploy. The code is ready, but the wallet needs funds.

## 1. Fund the Wallet (Tomorrow)
Wait until the faucet limit resets (usually 24 hours).

**Target Wallet**: `GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U`
**Required Balance**: ~3 SOL (Deployment cost: ~2.89 SOL)

### How to Fund:
1. Open terminal: `solana airdrop 2 GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U --url devnet`
2. Or visit https://faucet.solana.com/ and enter the address.

> **CRITICAL WARNING**: Your Playground wallet (`GQxe...`) is stored in your browser's Local Storage. 
> * **DO NOT** clear your browser cache or cookies for solpg.io.
> * **RECOMMENDED**: In Solana Playground, click the "Settings" gear -> "Export Keypair" and save the JSON file to your `programs/auto-savings/` folder just for safety.

## 2. Deploy via Solana Playground
Once funds are confirmed:

1. **Open Solana Playground**: https://beta.solpg.io
2. **Verify Code**: ensure the editor contains the latest `lib.rs` (starts with `use anchor_lang...` and ends with `token::transfer(transfer_ctx, amount)?;`). 
   - *Note: If the editor is empty, copy content from `programs/auto-savings/src/lib.rs` on your local machine.*
3. **Switch to Devnet**:
   - In the Playground terminal: `solana config set --url devnet`
   - Check balance: `solana balance` (Must be > 3 SOL).
4. **Deploy**:
   - Click the "Deploy" button or run `solana program deploy target/deploy/auto_savings.so` in the Playground terminal.
5. **Capture Program ID**:
   - On success, copy the new Program ID from the terminal.

## 3. Update Frontend
After getting the new Program ID:

1. **Update `lib.rs`**: `declare_id!("NEW_ID");` (Local machine)
2. **Update `frontend/src/config/solana.js`**: `export const PROGRAM_ID = ...`
3. **Rebuild**: `npm run build` in frontend.

## 4. Launch!
You are then ready to verify the app on the live Devnet.
