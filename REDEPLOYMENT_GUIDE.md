# Redeployment Guide - Updated Smart Contract

## Why Redeploy?

You modified the smart contract (`lib.rs`) by adding `vault_bump` to `UserConfig`. This changes the program's bytecode, so it needs a new deployment.

## Steps to Redeploy

### 1. Copy Updated Code to Solana Playground

Go to https://beta.solpg.io and create a new project with your updated `lib.rs`:

```rust
// Make sure this line is at the top:
declare_id!("8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR");

// Your updated code with vault_bump...
```

### 2. Build in Solana Playground

Click **Build** button. Wait for compilation to complete.

### 3. Deploy to Devnet

1. Click **Deploy** button
2. Select **Devnet**
3. Confirm the transaction
4. **Copy the new Program ID** from the deployment output

### 4. Update lib.rs with New Program ID

Replace line 4 in `lib.rs`:

```rust
declare_id!("YOUR_NEW_PROGRAM_ID_FROM_STEP_3");
```

### 5. Download New IDL

From Solana Playground:
1. Click on the IDL tab
2. Copy the entire JSON
3. Save to `frontend/src/idl/auto_savings.json`

### 6. Update Frontend

**File**: `frontend/src/sdk/client.js`

```javascript
const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID || 'YOUR_NEW_PROGRAM_ID');
```

**File**: `frontend/src/idl/idl.js`

Update the metadata section:
```javascript
"metadata": {
  "address": "YOUR_NEW_PROGRAM_ID"
}
```

### 7. Update Environment Variables

If you have a `.env` file:
```
VITE_PROGRAM_ID=YOUR_NEW_PROGRAM_ID
```

### 8. Rebuild IDL.js

Update `frontend/src/idl/idl.js` with the new IDL that includes `vault_bump`:

```javascript
pub struct UserConfig {
    pub owner: Pubkey,
    pub savings_rate: u8,
    pub total_saved: u64,
    pub total_withdrawn: u64,
    pub transaction_count: u64,
    pub is_active: bool,
    pub bump: u8,
    pub vault_bump: u8,  // NEW FIELD
}
```

### 9. Test Again

```bash
node scripts/smoke_test.js
```

Should now work without `DeclaredProgramIdMismatch` error!

---

## Alternative: Quick Test with Old Program

If you just want to test quickly without redeploying:

1. **Revert lib.rs changes**:
   - Remove `vault_bump` field
   - Remove `user_config.vault_bump = ctx.bumps.vault;`
   - Change withdraw back to use `ctx.bumps.vault`

2. **Run smoke test** - Will work with existing deployment

---

## Which Should You Choose?

**Redeploy** (Option 1) if:
- ✅ You want the vault_bump improvements
- ✅ You're ready to update all references
- ✅ This is for production

**Revert** (Option 2) if:
- ✅ You just want to test quickly
- ✅ You'll redeploy later
- ✅ This is just for learning

---

**Recommendation**: Redeploy now to get the improved vault_bump functionality!
