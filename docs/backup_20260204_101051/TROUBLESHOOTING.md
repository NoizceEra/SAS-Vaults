# 🔧 Troubleshooting Guide

**Last Updated:** February 4, 2026  
**Version:** 2.0  
**Status:** Comprehensive

---

## 📋 Table of Contents

1. [Build Issues](#build-issues)
2. [Deployment Issues](#deployment-issues)
3. [Frontend Issues](#frontend-issues)
4. [Wallet Connection Issues](#wallet-connection-issues)
5. [Transaction Failures](#transaction-failures)
6. [IDL/Program Mismatch](#idl-program-mismatch)
7. [Treasury Management](#treasury-management)

---

## 🔨 Build Issues

### "Access is denied" Error (Windows)

**Error:**
```
error: failed to execute command
Error: Access is denied. (os error 5)
```

**Cause:** Solana BPF tools installation requires elevated permissions

**Solutions:**

#### Solution 1: Run as Administrator (Recommended)

**PowerShell:**
1. Close current terminal
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to project:
   ```powershell
   cd C:\Users\<username>\Documents\SAS
   anchor build
   ```

**VS Code:**
1. Close VS Code
2. Right-click VS Code → "Run as Administrator"
3. Open project and run `anchor build`

#### Solution 2: Fix Solana Tools Permissions

```powershell
# Run as Administrator
$solanaPath = "$env:USERPROFILE\.local\share\solana"
icacls $solanaPath /grant "${env:USERNAME}:(OI)(CI)F" /T
```

Verify permissions:
```powershell
icacls "$env:USERPROFILE\.local\share\solana\install"
```

#### Solution 3: Clean Reinstall

```powershell
# Remove existing installation (as Administrator)
Remove-Item -Recurse -Force "$env:USERPROFILE\.local\share\solana"
Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\solana"

# Reinstall Solana CLI
cmd /c "curl https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
Start-Process "C:\solana-install-tmp\solana-install-init.exe" -Wait -Verb RunAs

# Reinstall Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

#### Solution 4: Use Solana Playground (Fastest)

If local build continues to fail:

1. Go to https://beta.solpg.io
2. Create new Anchor project
3. Copy `lib.rs` content
4. Click "Build" in IDE
5. Click "Deploy" to Devnet
6. Copy Program ID and update local config

**Advantages:**
- ✅ No permission issues
- ✅ Fast build times
- ✅ Built-in deployment
- ✅ Automatic IDL generation

#### Solution 5: WSL2 (Linux Subsystem)

```powershell
# Install WSL2 (as Administrator)
wsl --install
```

In WSL2:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Build
cd /mnt/c/Users/<username>/Documents/SAS
anchor build
```

### Other Build Errors

**Error: "Failed to install platform-tools"**
- Solution: Clean install (Solution 3 above)

**Error: "Cannot find solana-install"**
- Solution: Reinstall Solana CLI

**Error: "Disk full"**
- Solution: Free up space (need ~10GB for build)

---

## 🚀 Deployment Issues

### Program ID Mismatch

**Error:**
```
The program ID in lib.rs doesn't match the deployed program
```

**Cause:** `declare_id!` in source code doesn't match deployed program ID

**Solution:**

1. Get your deployed Program ID:
   ```bash
   solana address -k target/deploy/auto_savings-keypair.json
   ```

2. Update `programs/auto-savings/src/lib.rs` (line 4):
   ```rust
   declare_id!("YOUR_PROGRAM_ID_HERE");
   ```

3. Update `Anchor.toml`:
   ```toml
   [programs.devnet]
   auto_savings = "YOUR_PROGRAM_ID_HERE"
   ```

4. Rebuild:
   ```bash
   anchor build
   ```

### Insufficient Funds for Deployment

**Error:**
```
Error: Insufficient funds
```

**Solution:**

**Devnet:**
```bash
solana airdrop 2 --url devnet
```

**Mainnet:**
- Transfer SOL from exchange or another wallet
- Need 2-5 SOL for program deployment

### Deployment Transaction Failed

**Error:**
```
Transaction simulation failed
```

**Solution:**

1. Check network status:
   ```bash
   solana cluster-version --url devnet
   ```

2. Try again (network might be congested)

3. Increase priority fee (for mainnet):
   ```bash
   anchor deploy --provider.cluster mainnet-beta --priority-fee 0.001
   ```

---

## 💻 Frontend Issues

### "npm install" Failed

**Error:**
```
npm ERR! code 1
npm ERR! exited with 1
```

**Solution:**

Create `.npmrc` file in `frontend/`:
```
legacy-peer-deps=true
engine-strict=false
```

Add `engines` field to `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

Clean and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Build Fails on Vercel

**Error:**
```
Build failed with exit code 1
```

**Solution:**

1. **Set Root Directory:**
   - Vercel Dashboard → Settings → General
   - Root Directory: `frontend`
   - ✅ Include source files outside Root Directory

2. **Configure Build Settings:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   ```
   VITE_PROGRAM_ID=<your-program-id>
   VITE_NETWORK=devnet
   ```

### Blank Page After Deployment

**Cause:** Router configuration or incorrect base path

**Solution:**

Check `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Check `vite.config.js`:
```javascript
export default defineConfig({
  base: '/', // Make sure this is '/'
  // ...
})
```

---

## 👛 Wallet Connection Issues

### Wallet Doesn't Connect

**Symptoms:**
- Connect button does nothing
- No wallet popup appears

**Solution:**

1. **Check Wallet Installation:**
   - Ensure Phantom/Solflare is installed
   - Try refreshing the page

2. **Check Network:**
   - Ensure wallet is on correct network (Devnet/Mainnet)
   - Switch network in wallet settings

3. **Check Console for Errors:**
   - Open browser console (F12)
   - Look for wallet adapter errors

4. **Try Different Wallet:**
   - If Phantom fails, try Solflare
   - Test with multiple wallets

### Wrong Network

**Symptoms:**
- Wallet connects but transactions fail
- "Program not found" error

**Solution:**

Check wallet network setting:
- Phantom: Settings → Change Network → Devnet
- Solflare: Settings → Network → Devnet

Update environment variable:
```bash
# In .env.local
VITE_NETWORK=devnet
```

---

## ❌ Transaction Failures

### "Failed to create vault"

**Symptoms:**
- User clicks "Create Vault"
- Transaction fails or wallet rejects

**Common Causes & Solutions:**

#### Cause 1: Insufficient SOL Balance

**Error:** "Insufficient funds"

**Solution:**
```bash
# Devnet: Get free SOL
solana airdrop 2 --url devnet

# Or use Solana faucet
https://faucet.solana.com
```

Minimum required: ~0.003 SOL for account creation

#### Cause 2: Network Timeout

**Error:** "Transaction timeout" or "Blockhash expired"

**Solution:**
- Wait and try again
- Public RPC is unreliable
- Consider using private RPC (Helius, QuickNode)

#### Cause 3: Rate Limiting

**Error:** "Rate limit exceeded" or "429"

**Solution:**
- Wait 1-2 minutes
- Use different RPC endpoint
- Consider upgrading to private RPC

#### Cause 4: User Rejected Transaction

**Error:** "User rejected the request"

**Solution:**
- User needs to approve in wallet
- Check wallet popup isn't blocked

### "Transaction simulation failed"

**Cause:** Program error or account state issue

**Solution:**

1. **Check Program is Deployed:**
   ```bash
   solana program show <PROGRAM_ID> --url devnet
   ```

2. **Verify IDL Matches Program:**
   - Check `metadata.address` in IDL
   - Should match deployed Program ID

3. **Check Account State:**
   - Ensure accounts aren't already initialized
   - Check for corrupted state

4. **Review Transaction Logs:**
   ```bash
   solana logs <PROGRAM_ID> --url devnet
   ```

---

## 🔄 IDL/Program Mismatch

### "InstructionFallbackNotFound" Error

**Error Code:** 101

**Cause:** IDL doesn't match deployed program

**Symptoms:**
- Transactions fail with error code 101
- "Instruction not found" or similar

**Diagnosis:**

Check if there are multiple programs:
```bash
# List all your programs
solana program show <PROGRAM_ID_1> --url devnet
solana program show <PROGRAM_ID_2> --url devnet
```

**Solution 1: Use Correct Program**

If you have an old program that matches your IDL:

1. Update `.env.local`:
   ```
   VITE_PROGRAM_ID=<old-program-id>
   ```

2. Update `frontend/src/config/solana.js`:
   ```javascript
   export const PROGRAM_ID = new PublicKey('<old-program-id>');
   ```

3. Redeploy frontend

**Solution 2: Regenerate IDL**

If your code is newer than deployed program:

1. Rebuild program:
   ```bash
   anchor build
   ```

2. Deploy updated program:
   ```bash
   anchor deploy --provider.cluster devnet
   ```

3. Copy new IDL:
   ```bash
   cp target/idl/auto_savings.json frontend/src/idl/
   ```

4. Update Program ID in frontend

5. Redeploy frontend

---
## 💰 Treasury Management

### "Unauthorized access" Error

**Error:**
```
Error: Unauthorized to withdraw from treasury
```

**Cause:** Not using the treasury authority wallet

**Solution:**

1. Check treasury authority:
   ```bash
   node scripts/manage-treasury.js check
   # Look for "Authority: <PUBKEY>"
   ```

2. Use correct keypair:
   ```bash
   AUTHORITY_KEYPAIR=/path/to/authority.json node scripts/manage-treasury.js withdraw 0.1
   ```

3. Verify wallet:
   ```bash
   solana-keygen pubkey ~/.config/solana/id.json
   # Should match treasury authority
   ```

### "Insufficient funds in vault"

**Error:**
```
Error: Treasury has insufficient balance
```

**Solution:**

1. Check current balance:
   ```bash
   node scripts/manage-treasury.js check
   ```

2. Withdraw smaller amount

3. Remember to leave ~0.001 SOL for rent-exempt minimum

### "Authority keypair not found"

**Error:**
```
Error: ENOENT: no such file or directory
```

**Solution:**

1. Verify file exists:
   ```bash
   ls ~/.config/solana/id.json
   ```

2. Specify explicit path:
   ```bash
   AUTHORITY_KEYPAIR="C:\Users\username\.config\solana\id.json" node scripts/manage-treasury.js check
   ```

3. Check file permissions (Windows):
   ```powershell
   Get-Acl ~/.config/solana/id.json
   ```

---

## 🔍 Diagnostic Commands

### Check Solana Installation

```bash
# Verify Solana CLI
solana --version

# Verify Anchor
anchor --version

# Verify Rust
rustc --version
```

### Check Network Status

```bash
# Check cluster health
solana cluster-version --url devnet

# Check if running as Admin (Windows)
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

### Check Program Status

```bash
# View program details
solana program show <PROGRAM_ID> --url devnet

# View program logs
solana logs <PROGRAM_ID> --url devnet

# Check account
solana account <ACCOUNT_ADDRESS> --url devnet
```

### Check Wallet Balance

```bash
# Check balance
solana balance --url devnet

# Check specific wallet
solana balance <WALLET_ADDRESS> --url devnet

# Get wallet address
solana address
```

### Check Disk Space

```bash
# Windows
Get-PSDrive C | Select-Object Used,Free

# Linux/Mac
df -h
```

---

## 🐛 Common Error Codes

| Error Code | Meaning | Common Cause | Solution |
|------------|---------|--------------|----------|
| 101 | InstructionFallbackNotFound | IDL/Program mismatch | Regenerate IDL or use correct program |
| 5 | Access Denied | Permission issue | Run as Administrator |
| 429 | Too Many Requests | Rate limiting | Wait or use private RPC |
| 3001 | AccountNotFound | Account doesn't exist | Initialize account first |
| 3003 | InsufficientFunds | Not enough SOL | Add more SOL to wallet |
| 3012 | ConstraintSeeds | PDA derivation mismatch | Check PDA seeds |

---

## 📊 Performance Issues

### Slow Build Times

**Symptom:** `anchor build` takes 10+ minutes

**Solutions:**

1. **Use release profile:**
   ```bash
   anchor build --release
   ```

2. **Clean build directory:**
   ```bash
   anchor clean
   anchor build
   ```

3. **Use Solana Playground:**
   - Cloud-based builds are faster
   - No local compilation needed

### Slow Transaction Confirmation

**Symptom:** Transactions take 30+ seconds

**Solutions:**

1. **Use private RPC:**
   - Helius: https://helius.xyz
   - QuickNode: https://quicknode.com
   - Alchemy: https://alchemy.com

2. **Check network congestion:**
   ```bash
   solana ping --url devnet
   ```

3. **Increase confirmation commitment:**
   ```javascript
   const connection = new Connection(RPC_URL, 'confirmed');
   // Instead of 'finalized'
   ```

---

## 🔐 Security Issues

### Wallet Security Warning

**Issue:** "This dApp could be malicious" (Phantom)

**Cause:** Blowfish security scanner flags unknown programs

**Solutions:**

1. **Normal for new programs** - Warning is expected
2. **Verify on Explorer:**
   - Check program on Solana Explorer
   - Verify code matches deployment
3. **Wait for reputation** - Warning may disappear after successful transactions
4. **Contact Phantom** - Request whitelisting for verified programs

### SSL Certificate Errors

**Issue:** "Certificate error" in browser

**Cause:** Mixed content or invalid certificate

**Solution:**

1. Ensure using HTTPS (Vercel provides automatic SSL)
2. Check for mixed content (HTTP resources on HTTPS page)
3. Clear browser cache and cookies
4. Try incognito/private mode

---

## 🧪 Testing Issues

### Tests Fail Locally

**Error:**
```
Error: Test failed with exit code 1
```

**Solution:**

1. **Start local validator:**
   ```bash
   solana-test-validator
   ```

2. **Reset ledger:**
   ```bash
   solana-test-validator --reset
   ```

3. **Check test configuration:**
   ```javascript
   // In test file
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   ```

4. **Run with logs:**
   ```bash
   anchor test -- --nocapture
   ```

### Tests Pass Locally But Fail on Devnet

**Solution:**

1. **Check network:**
   ```bash
   anchor test --provider.cluster devnet
   ```

2. **Verify program deployed:**
   ```bash
   solana program show <PROGRAM_ID> --url devnet
   ```

3. **Check RPC endpoint:**
   - Devnet RPC is unreliable
   - Consider using private endpoint

---

## 📱 Mobile/Browser Issues

### Mobile Wallet Connection Fails

**Solution:**

1. **Use WalletConnect:**
   - Enable WalletConnect in wallet adapter
   - Follow mobile wallet instructions

2. **Check mobile wallet app:**
   - Ensure latest version installed
   - Try reinstalling wallet app

3. **Browser compatibility:**
   - Use Chrome/Safari on mobile
   - Avoid in-app browsers

### Browser Extension Conflicts

**Issue:** Multiple wallet extensions conflict

**Solution:**

1. **Disable unused wallets:**
   - Keep only one wallet enabled at a time
   - Reload page after disabling

2. **Try incognito mode:**
   - Test with single wallet extension
   - Isolate the issue

3. **Clear extension data:**
   - Reset wallet extension
   - Reimport wallet

---

## 🔄 Recovery Procedures

### Lost Transaction

**Issue:** Transaction submitted but not confirmed

**Solution:**

1. **Check transaction status:**
   ```bash
   solana confirm <TX_SIGNATURE> --url devnet
   ```

2. **View on Explorer:**
   ```
   https://explorer.solana.com/tx/<TX_SIGNATURE>?cluster=devnet
   ```

3. **If failed, retry transaction**

4. **Check for duplicate accounts** (if initialization failed)

### Corrupted Account State

**Issue:** Account exists but in bad state

**Solution:**

1. **Close and reinitialize:**
   - Add `close_account` instruction
   - Reclaim rent
   - Initialize fresh account

2. **Contact support** if funds are at risk

3. **For devnet:** Just create new account

---

## 📞 Getting Help

### Before Asking for Help

1. **Check error message carefully**
2. **Search this troubleshooting guide**
3. **Check Solana Stack Exchange**
4. **Review documentation**
5. **Try basic diagnostics**

### When Asking for Help

Include:
- **Error message** (complete text)
- **What you tried** (steps to reproduce)
- **Environment:**
  - OS (Windows/Mac/Linux)
  - Node version
  - Solana CLI version
  - Anchor version
- **Network** (Devnet/Mainnet)
- **Program ID**
- **Transaction signature** (if applicable)

### Support Resources

**Solana:**
- Stack Exchange: https://solana.stackexchange.com
- Discord: https://discord.gg/solana
- Forum: https://forums.solana.com

**Anchor:**
- Discord: https://discord.gg/anchor
- GitHub: https://github.com/coral-xyz/anchor/issues

**Project-Specific:**
- Check project README
- Review documentation
- Create GitHub issue

---

## ✅ Quick Fix Checklist

When something goes wrong, try these in order:

- [ ] Restart terminal/IDE
- [ ] Clear browser cache
- [ ] Refresh the page
- [ ] Disconnect and reconnect wallet
- [ ] Check network status
- [ ] Verify wallet has sufficient SOL
- [ ] Check program is deployed
- [ ] Verify environment variables
- [ ] Review recent changes
- [ ] Check error logs
- [ ] Try in incognito mode
- [ ] Test with different wallet
- [ ] Run on different network
- [ ] Clean and rebuild
- [ ] Restart development server

---

**Last Updated:** February 4, 2026  
**Version:** 2.0  
**Status:** Comprehensive ✅
