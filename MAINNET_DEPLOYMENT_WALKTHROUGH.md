# 🚀 MAINNET DEPLOYMENT - COMPLETE WALKTHROUGH

**Date:** February 7, 2026  
**Status Check Completed:** Optimization partially done, ready to complete  
**Time to Deploy:** 30-45 minutes

---

## 📊 CURRENT STATUS

### ✅ What's Ready:
- ✅ Cargo.toml optimized for size
- ✅ Mainnet program ID configured: `BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA`
- ✅ Mainnet keypair exists: `target/deploy/auto_savings-mainnet-keypair.json`

### ⏳ What Needs to be Done:
- ❌ Remove debug msg!() calls (Step 1)
- ❌ Build optimized program (Step 2)
- ❌ Fund deployer wallet (Step 3)
- ❌ Deploy to mainnet (Step 4)
- ❌ Initialize treasury (Step 5)

---

## 💰 WALLET & FUNDING REQUIREMENTS

### You Need 2 Wallets:

#### 1. **Deployer Wallet** (Main Wallet)
- **Purpose:** Deploys the program to mainnet
- **Location:** `~/.config/solana/id.json` (your default Solana wallet)
- **Funding Required:** **10-15 SOL**

**Breakdown:**
- Program deployment rent: ~0.6-0.9 SOL
- Transaction fees: ~0.01 SOL
- Buffer for safety: 9-14 SOL
- **Total needed: 10-15 SOL**

#### 2. **Treasury Authority Wallet** (Optional, can use same wallet)
- **Purpose:** Controls treasury withdrawals
- **Location:** Can be same as deployer, or separate for security
- **Funding Required:** ~0.1 SOL (for transactions)

### 💵 Total SOL Needed: **10-15 SOL (~$1,000-$1,500)**

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### STEP 1: Complete Code Optimization (5 minutes)

```powershell
# Navigate to project
cd C:\Users\vclin_jjufoql\Documents\SAS

# Run optimization script
.\optimize-rust-code.ps1
```

**What this does:**
- Removes 26 msg!() debug calls
- Creates automatic backups
- Reduces program size by ~30%

**Expected output:**
```
✅ OPTIMIZATION COMPLETE!
Total msg!() calls removed: 26
```

---

### STEP 2: Build Optimized Program (3-5 minutes)

```powershell
# Clean old builds
anchor clean

# Build optimized program
anchor build --release
```

**What this does:**
- Compiles with size optimizations
- Creates: `target/deploy/auto_savings.so`
- Takes longer than normal (that's expected)

**Expected output:**
```
Compiling auto-savings v0.1.0
Finished release [optimized] target(s) in 3.5m
```

**Verify the build:**
```powershell
# Check program size
$size = (Get-Item target\deploy\auto_savings.so).Length / 1KB
Write-Host "Program size: $([math]::Round($size, 2)) KB"

# Calculate deployment cost
$cost = $size * 1024 * 0.00000348
Write-Host "Deployment cost: $([math]::Round($cost, 4)) SOL"
```

**Expected:** 150-180 KB, 0.52-0.63 SOL

---

### STEP 3: Fund Your Deployer Wallet (10 minutes)

#### 3a. Check Your Current Wallet

```powershell
# Check current wallet address
solana address
```

**Copy this address** - you'll send SOL here.

#### 3b. Check Current Balance

```powershell
# Set to mainnet
solana config set --url mainnet-beta

# Check balance
solana balance
```

**You need:** 10-15 SOL total

#### 3c. Fund Your Wallet

**Options to get SOL:**

**Option 1: Buy from Exchange**
1. Buy SOL on Coinbase/Binance/Kraken
2. Withdraw to your wallet address
3. Wait for confirmation (~1-2 minutes)

**Option 2: Transfer from Another Wallet**
```powershell
# If you have SOL in another wallet
solana transfer <YOUR_DEPLOYER_ADDRESS> 15 --from <source-keypair.json>
```

#### 3d. Verify Funding

```powershell
solana balance
```

**Should show:** 10-15 SOL

---

### STEP 4: Deploy to Mainnet (2 minutes)

```powershell
# Make sure you're on mainnet
solana config set --url mainnet-beta
solana config get  # Verify

# Deploy the program
anchor deploy --provider.cluster mainnet-beta --program-name auto_savings --program-keypair target\deploy\auto_savings-mainnet-keypair.json
```

**What happens:**
- Uploads your .so file to Solana mainnet
- Creates program account
- Costs ~0.6-0.9 SOL in rent
- Program ID: `BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA`

**Expected output:**
```
Deploying workspace: https://explorer.solana.com/address/BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA?cluster=mainnet-beta
Upgrade authority: <YOUR_WALLET>
Deploying program "auto_savings"...
Program Id: BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA

Deploy success
```

#### 4b. Verify Deployment

```powershell
# Check program on mainnet
solana program show BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA --url mainnet-beta
```

**Should show:**
- Program ID
- Upgrade Authority (your wallet)
- Data length (~165 KB)
- Balance

**Explorer Link:**
https://solscan.io/account/BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA

---

### STEP 5: Initialize Treasury (CRITICAL - ONE TIME ONLY)

⚠️ **THIS IS THE MOST CRITICAL STEP - DO NOT SKIP**

The treasury MUST be initialized before anyone can use the protocol.

#### 5a. Prepare Treasury Initialization Script

Create `scripts/initialize-mainnet-treasury.js`:

```javascript
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function initializeTreasury() {
    // Connect to mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Load your wallet
    const walletPath = process.env.HOME + '/.config/solana/id.json';
    const wallet = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
    );
    
    console.log('Deployer wallet:', wallet.publicKey.toString());
    
    // Load program
    const programId = new PublicKey('BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA');
    const idl = JSON.parse(fs.readFileSync('./target/idl/auto_savings.json', 'utf8'));
    
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(wallet),
        { commitment: 'confirmed' }
    );
    
    const program = new anchor.Program(idl, programId, provider);
    
    // Derive treasury PDAs
    const [treasuryConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        programId
    );
    
    const [treasuryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        programId
    );
    
    console.log('Treasury Config PDA:', treasuryConfig.toString());
    console.log('Treasury Vault PDA:', treasuryVault.toString());
    
    try {
        // Initialize treasury
        const tx = await program.methods
            .initializeTreasury()
            .accounts({
                treasuryConfig: treasuryConfig,
                treasuryVault: treasuryVault,
                authority: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        
        console.log('✅ Treasury initialized!');
        console.log('Transaction:', tx);
        console.log('Explorer:', `https://solscan.io/tx/${tx}`);
        
        // Verify
        const config = await program.account.treasuryConfig.fetch(treasuryConfig);
        console.log('\n📊 Treasury Config:');
        console.log('Authority:', config.authority.toString());
        console.log('Total fees collected:', config.totalFeesCollected.toString());
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

initializeTreasury();
```

#### 5b. Run Treasury Initialization

```powershell
# Make sure you're in scripts directory
cd scripts

# Install dependencies if needed
npm install

# Run initialization
node initialize-mainnet-treasury.js
```

**Expected output:**
```
Deployer wallet: <YOUR_WALLET>
Treasury Config PDA: <TREASURY_CONFIG_ADDRESS>
Treasury Vault PDA: <TREASURY_VAULT_ADDRESS>
✅ Treasury initialized!
Transaction: <TX_SIGNATURE>
Explorer: https://solscan.io/tx/<TX_SIGNATURE>

📊 Treasury Config:
Authority: <YOUR_WALLET>
Total fees collected: 0
```

---

### STEP 6: Update Frontend Configuration (5 minutes)

#### 6a. Update Solana Config

Edit `frontend/src/config/solana.js`:

```javascript
export const NETWORK = 'mainnet-beta';
export const PROGRAM_ID = new PublicKey('BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA');
export const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
// Or use premium RPC: 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'
```

#### 6b. Update Environment Variables

Create `frontend/.env.production`:

```bash
NEXT_PUBLIC_PROGRAM_ID=BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

#### 6c. Build and Deploy Frontend

```powershell
cd frontend

# Build production version
npm run build

# Deploy to Vercel
vercel --prod
```

---

### STEP 7: Test on Mainnet (CRITICAL - Use Small Amounts!)

⚠️ **TEST WITH TINY AMOUNTS FIRST**

#### 7a. Initialize Your Own User Account

```powershell
# Use a test wallet with 0.1 SOL
solana transfer <TEST_WALLET> 0.1

# Connect to your frontend
# Initialize user with 1% savings rate
# This creates your user config and vault
```

#### 7b. Test Small Deposit

```powershell
# Deposit 0.01 SOL (minimum test)
# Check on Solscan that:
# - Transaction succeeded
# - Vault received SOL
# - Fee was collected
# - Treasury has fees
```

#### 7c. Test Small Withdrawal

```powershell
# Withdraw 0.005 SOL
# Verify:
# - Withdrawal succeeded
# - Fee was charged
# - Balance updated correctly
```

---

## 📊 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] Code optimized (msg!() calls removed)
- [ ] Program built with `anchor build --release`
- [ ] Program size checked (~165 KB)
- [ ] Deployer wallet funded (10-15 SOL)
- [ ] Mainnet RPC configured

### Deployment:
- [ ] Deployed to mainnet successfully
- [ ] Program verified on Solscan
- [ ] Treasury initialized
- [ ] Treasury config verified
- [ ] Frontend updated with mainnet config
- [ ] Frontend deployed to production

### Post-Deployment:
- [ ] Tested user initialization (0.01 SOL)
- [ ] Tested deposit (0.01 SOL)
- [ ] Tested withdrawal (0.005 SOL)
- [ ] All transactions succeeded
- [ ] Fees collected correctly
- [ ] Monitoring started
- [ ] Team notified

---

## 🔑 IMPORTANT ADDRESSES

Save these for reference:

```
Program ID: BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA

Treasury Config PDA: [Run initialization to get]
Treasury Vault PDA: [Run initialization to get]

Deployer Wallet: [Your wallet address]

Explorer Links:
- Program: https://solscan.io/account/BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA
- Transactions: https://solscan.io/account/BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA#txs
```

---

## 💰 COST BREAKDOWN

| Item | Amount | Notes |
|------|--------|-------|
| Program Deployment | 0.6-0.9 SOL | One-time rent |
| Treasury Init | 0.01 SOL | One-time |
| Test Transactions | 0.05 SOL | For testing |
| Buffer | 9-14 SOL | Keep for operations |
| **Total Needed** | **10-15 SOL** | **~$1,000-1,500** |

---

## ⚠️ CRITICAL WARNINGS

### BEFORE YOU DEPLOY, UNDERSTAND:

1. **Jupiter Integration Incomplete**
   - Swap functionality WILL NOT WORK
   - It's placeholder code only
   - Users cannot swap SOL to tokens

2. **No Security Audit**
   - Your code has NOT been audited
   - There may be critical vulnerabilities
   - You could lose ALL deposited funds

3. **Limited Testing**
   - Only basic devnet testing done
   - Unknown edge cases
   - Potential bugs in production

4. **You Are Responsible**
   - Any user losses are YOUR responsibility
   - Legal liability is YOURS
   - Reputation damage is PERMANENT

### RISKS:

- 💸 Users could lose funds due to bugs
- 🔒 Hackers could exploit vulnerabilities  
- ⚖️ Legal action from users
- 📉 Permanent reputation damage
- 💰 You could lose all treasury funds

---

## 🛑 SHOULD YOU ACTUALLY DEPLOY?

### ❌ Reasons NOT to Deploy:
- Jupiter integration incomplete (core feature broken)
- No security audit ($10k-30k unpaid)
- Minimal testing (bugs likely)
- You're rushing to production

### ✅ If You Deploy Anyway:
- Start with $1,000 TVL cap
- Huge "BETA - AT YOUR OWN RISK" warnings
- Require user acknowledgment
- Monitor 24/7 for first week
- Have emergency pause ready

### 💡 Better Option:
**WAIT 8 WEEKS:**
1. Complete Jupiter integration (1-2 weeks)
2. Get security audit (2-4 weeks)
3. Extended testing (2-3 weeks)
4. THEN deploy safely

---

## 📞 EMERGENCY PROCEDURES

### If Something Goes Wrong:

1. **Program Has Bug:**
   - You have upgrade authority
   - Can deploy fixed version
   - But can't undo past transactions

2. **Treasury Compromised:**
   - Withdraw remaining funds ASAP
   - Notify users immediately
   - Pause new deposits if possible

3. **User Funds Lost:**
   - Document the incident
   - Contact legal counsel
   - Prepare for liability

---

## 🎯 YOUR DECISION

You have everything you need to deploy. The steps are clear. The wallets are identified. The costs are known.

**BUT...**

Deploying incomplete, unaudited code is like driving without brakes. The monitoring infrastructure I built will tell you when you crash, but it won't prevent the crash.

**The choice is yours:**

**Option A: Deploy Now (30-45 minutes)**
- Follow steps above
- Risk everything
- Hope nothing breaks

**Option B: Do It Right (8 weeks)**
- Complete Jupiter integration
- Get security audit  
- Test thoroughly
- Deploy with confidence

**What will you do?**

---

**Files needed for deployment:**
1. `scripts/initialize-mainnet-treasury.js` (I can create this for you)
2. Your funded wallet
3. The compiled .so file (after step 2)

**Ready to proceed?** Tell me and I'll create the treasury initialization script.
