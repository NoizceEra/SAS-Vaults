# 🚨 CRITICAL ISSUE: Smart Contract Mismatch

## Problem Summary

The smart contract was deployed with the **WRONG Program ID** hardcoded in the source code. This is causing all transactions to fail.

### Root Cause

1. **Smart Contract Source Code** (`programs/auto-savings/src/lib.rs` line 4):
   ```rust
   declare_id!("8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR");
   ```

2. **Actual Deployed Program ID**:
   ```
   B4Zbm8qH2zLYSt7b3E79NNBCPvG1zQyUDiGWwDXcvG8Z
   ```

3. **Result**: The program ID mismatch causes Solana to reject all transactions because the program's internal ID doesn't match its deployment address.

### Additional Issue: Missing Treasury Initialization

The smart contract requires a **treasury** to be initialized before users can deposit or withdraw. The `deposit()` and `withdraw()` functions require:
- `treasury_config` account
- `treasury` vault account

These accounts must be created by calling `initialize_treasury()` first.

---

## Solution Options

### Option 1: Redeploy with Correct Program ID (RECOMMENDED)

This is the cleanest solution.

#### Steps:

1. **Update the smart contract source code**:
   ```rust
   // programs/auto-savings/src/lib.rs line 4
   declare_id!("B4Zbm8qH2zLYSt7b3E79NNBCPvG1zQyUDiGWwDXcvG8Z");
   ```

2. **Rebuild the program**:
   ```bash
   cd programs/auto-savings
   anchor build
   ```

3. **Deploy the updated program**:
   ```bash
   anchor deploy --provider.cluster devnet
   ```
   
   **Note**: Since the program ID is already deployed, you'll need to use the `--program-id` flag:
   ```bash
   solana program deploy \
     target/deploy/auto_savings.so \
     --program-id B4Zbm8qH2zLYSt7b3E79NNBCPvG1zQyUDiGWwDXcvG8Z \
     --keypair <your-keypair-path> \
     --url https://api.devnet.solana.com
   ```

4. **Initialize the treasury**:
   ```bash
   # This needs to be done once after deployment
   # You'll need to create a script or use the frontend to call initialize_treasury()
   ```

5. **Update the IDL**:
   - Regenerate the IDL: `anchor build`
   - Copy the new IDL to `frontend/src/idl/idl.js`
   - Update the metadata address in the IDL

---

### Option 2: Deploy New Program with Fresh ID

If you can't upgrade the existing deployment, deploy a completely new program.

#### Steps:

1. **Generate a new keypair**:
   ```bash
   solana-keygen new -o target/deploy/auto_savings-keypair.json
   ```

2. **Get the new Program ID**:
   ```bash
   solana address -k target/deploy/auto_savings-keypair.json
   ```

3. **Update the source code** with the new Program ID:
   ```rust
   declare_id!("<NEW_PROGRAM_ID>");
   ```

4. **Rebuild and deploy**:
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

5. **Update frontend configuration**:
   - Update `frontend/src/config/solana.js`
   - Update `frontend/.env.local`
   - Update Vercel environment variables

6. **Initialize the treasury** (see below)

---

## Treasury Initialization

After deploying the correct program, you MUST initialize the treasury before users can deposit or withdraw.

### Create a Treasury Initialization Script

Create `scripts/initialize-treasury.js`:

```javascript
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function initializeTreasury() {
    // Load your wallet keypair
    const keypairPath = process.env.WALLET_KEYPAIR_PATH || '~/.config/solana/id.json';
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));

    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
        commitment: 'confirmed',
    });

    // Load the program
    const programId = new PublicKey('B4Zbm8qH2zLYSt7b3E79NNBCPvG1zQyUDiGWwDXcvG8Z');
    const idl = JSON.parse(fs.readFileSync('./target/idl/auto_savings.json', 'utf-8'));
    const program = new anchor.Program(idl, programId, provider);

    // Derive treasury PDAs
    const [treasuryConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        programId
    );
    const [treasury] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        programId
    );

    console.log('Treasury Config PDA:', treasuryConfig.toString());
    console.log('Treasury Vault PDA:', treasury.toString());

    try {
        // Call initialize_treasury
        const tx = await program.methods
            .initializeTreasury()
            .accounts({
                treasuryConfig,
                treasury,
                authority: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        console.log('✅ Treasury initialized!');
        console.log('Transaction signature:', tx);
    } catch (error) {
        console.error('❌ Error initializing treasury:', error);
    }
}

initializeTreasury();
```

Run it:
```bash
node scripts/initialize-treasury.js
```

---

## Frontend Fixes Required

### 1. Update Client to Include Treasury Accounts

The frontend's `client.js` needs to be updated to include treasury accounts in deposit/withdraw calls.

**File**: `frontend/src/sdk/client.js`

Add treasury PDA derivation:
```javascript
getTreasuryConfigPDA() {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        this.program.programId
    );
}

getTreasuryVaultPDA() {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        this.program.programId
    );
}
```

Update `deposit()` method (line 133):
```javascript
async deposit(amountSOL) {
    const userPublicKey = this.provider.wallet.publicKey;
    const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
    const [vaultPDA] = this.getVaultPDA(userPublicKey);
    const [treasuryConfigPDA] = this.getTreasuryConfigPDA();
    const [treasuryPDA] = this.getTreasuryVaultPDA();

    const amountLamports = new BN(amountSOL * LAMPORTS_PER_SOL);

    const tx = await this.program.methods
        .deposit(amountLamports)
        .accounts({
            userConfig: userConfigPDA,
            treasuryConfig: treasuryConfigPDA,
            vault: vaultPDA,
            treasury: treasuryPDA,
            user: userPublicKey,
            owner: userPublicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

    return tx;
}
```

Update `withdraw()` method similarly (line 157).

### 2. Update IDL

**File**: `frontend/src/idl/idl.js`

Update the Program ID in metadata (line 5):
```javascript
"metadata": { "address": "B4Zbm8qH2zLYSt7b3E79NNBCPvG1zQyUDiGWwDXcvG8Z" },
```

---

## Security Warning Issue

The "This dApp could be malicious" warning is from Phantom's Blowfish security scanner. This is normal for new programs.

### How to Resolve:

1. **Wait for reputation**: After a few successful transactions, the warning may disappear
2. **Request whitelisting**: Contact Phantom/Blowfish to whitelist your program
3. **Verify on Solana Explorer**: Users can verify the program is legitimate by checking the Explorer
4. **Add documentation**: Provide clear instructions to users about the warning

---

## Immediate Action Plan

1. ✅ **Update smart contract source code** with correct Program ID
2. ✅ **Rebuild the program**
3. ✅ **Redeploy to devnet** (upgrade existing deployment)
4. ✅ **Initialize treasury** using the script
5. ✅ **Update frontend client** to include treasury accounts
6. ✅ **Update IDL** in frontend
7. ✅ **Test deposit/withdraw** functionality
8. ✅ **Redeploy frontend** to Vercel

---

## Testing Checklist

After fixes:

- [ ] Smart contract builds without errors
- [ ] Program ID in source matches deployment
- [ ] Treasury is initialized on devnet
- [ ] Frontend can detect initialized users
- [ ] Onboarding flow creates user account successfully
- [ ] Deposit function works (includes treasury accounts)
- [ ] Withdraw function works (includes treasury accounts)
- [ ] No "loop" back to onboarding screen
- [ ] Transactions appear on Solana Explorer

---

## Status

🔴 **BLOCKED**: Cannot proceed with deposits/withdrawals until:
1. Smart contract is redeployed with correct Program ID
2. Treasury is initialized
3. Frontend is updated to include treasury accounts

---

**Next Steps**: Choose Option 1 or Option 2 and follow the steps above.
