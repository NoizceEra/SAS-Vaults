# 🚀 Deploy via Solana CLI (Alternative Method)

**Why:** Solana Playground RPC is having issues. The CLI is more reliable.

**Time:** ~15 minutes

---

## ✅ **Prerequisites Check**

You should already have:
- ✅ Solana CLI installed (from previous setup)
- ✅ Anchor installed
- ✅ Code ready in `programs/auto-savings/src/lib.rs`
- ✅ Wallet with 0.5 SOL

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Import Your Playground Wallet**

First, we need to get your Playground wallet's private key:

1. **In Solana Playground:**
   - Click the wallet icon (👛) in top-right
   - Click "Export Private Key"
   - Copy the private key (long string of characters)

2. **Save it temporarily:**
   - Open Notepad
   - Paste the private key
   - Save as `playground-key.txt` on your Desktop
   - **IMPORTANT:** Delete this file after deployment!

---

### **Step 2: Configure Solana CLI**

Open PowerShell and run these commands:

```powershell
# Set to mainnet
solana config set --url https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e

# Import your wallet
solana-keygen recover -o C:\Users\vclin_jjufoql\.config\solana\playground.json

# When prompted, paste your private key from Playground
# (The one you saved in playground-key.txt)

# Set this as your default keypair
solana config set --keypair C:\Users\vclin_jjufoql\.config\solana\playground.json

# Verify balance
solana balance
```

**Expected output:** `0.5 SOL`

---

### **Step 3: Build the Program**

```powershell
cd C:\Users\vclin_jjufoql\Documents\SAS

# Clean previous builds
anchor clean

# Build for mainnet
anchor build
```

**Expected:** "Build successful!"

---

### **Step 4: Get the Program ID**

```powershell
# This shows your program ID
solana address -k target/deploy/auto_savings-keypair.json
```

**Copy this Program ID!** Example: `AbC123...XyZ`

---

### **Step 5: Update declare_id!**

1. Open `programs/auto-savings/src/lib.rs`
2. Find line 4: `declare_id!("11111111111111111111111111111111");`
3. Replace with your Program ID: `declare_id!("AbC123...XyZ");`
4. Save the file

---

### **Step 6: Update Anchor.toml**

1. Open `Anchor.toml` in the project root
2. Find the `[programs.mainnet]` section (or add it if missing)
3. Update it to:

```toml
[programs.mainnet]
auto_savings = "YOUR_PROGRAM_ID_HERE"
```

4. Save the file

---

### **Step 7: Rebuild with Correct Program ID**

```powershell
# Rebuild with the correct program ID
anchor build
```

---

### **Step 8: Deploy to Mainnet! 🚀**

```powershell
# Deploy the program
anchor deploy --provider.cluster mainnet

# Or if that doesn't work, use:
solana program deploy target/deploy/auto_savings.so --program-id target/deploy/auto_savings-keypair.json
```

**This will:**
- Upload your program to Solana mainnet
- Cost ~0.3-0.4 SOL
- Take 1-2 minutes

**Expected output:**
```
Program Id: AbC123...XyZ
Signature: 5a1b2c3d...
```

---

### **Step 9: Verify Deployment**

```powershell
# Check if program exists
solana program show YOUR_PROGRAM_ID_HERE
```

**Or visit:**
https://explorer.solana.com/address/YOUR_PROGRAM_ID_HERE

---

### **Step 10: Initialize Treasury**

After deployment, initialize the treasury:

```powershell
# This will be done via your frontend or a test script
# For now, just save your Program ID
```

---

## 🎉 **Success!**

Your program is now deployed to Solana mainnet!

**Save these:**
- ✅ Program ID: `_______________________`
- ✅ Deployment transaction: `_______________________`
- ✅ Wallet address: `skdnpzg9EecPCKutzi7uhF8drrU8sFiveLmpxbdk64Z`

---

## 🔐 **Security Cleanup**

**CRITICAL - Do this immediately after deployment:**

```powershell
# Delete the temporary key file
del C:\Users\vclin_jjufoql\Desktop\playground-key.txt

# Clear PowerShell history (so private key isn't saved)
Clear-History
```

---

## ⚠️ **Troubleshooting**

### "solana: command not found"
```powershell
# Verify Solana is installed
solana --version

# If not installed, install it:
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
```

### "anchor: command not found"
```powershell
# Verify Anchor is installed
anchor --version

# If not installed:
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### "Insufficient funds"
- Check balance: `solana balance`
- Make sure you imported the correct wallet
- Verify it has 0.5 SOL

### "Program deploy failed"
- Try again with a different RPC:
  ```powershell
  solana config set --url https://api.mainnet-beta.solana.com
  ```
- Or use Quicknode/Alchemy RPC

---

## 💡 **Why This Works Better**

**CLI vs Playground:**
- ✅ More reliable (direct connection)
- ✅ Better error messages
- ✅ More control over RPC
- ✅ Can retry easily
- ✅ Works even when Playground is down

---

**Ready to try? Let me know if you need help with any step!** 🚀
