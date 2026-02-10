# 🎯 Manual Treasury Initialization Steps

Since the automated browser approach is encountering RPC connection issues, here are the **exact manual steps** to initialize your treasury:

---

## 🔧 **Step 1: Fix RPC Connection in Solana Playground**

1. **Click the Settings icon** (gear ⚙️) in the bottom-left corner
2. **Click on the "Endpoint" dropdown**
3. **Select "custom"**
4. **Enter this RPC URL:**
   ```
   https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e
   ```
5. **Click "Add"** to save the custom RPC

**Alternative RPC (if Helius doesn't work):**
```
https://solana-mainnet.g.alchemy.com/v2/LskpwPKNYFiPPn4V1Vrgl
```

---

## 🧪 **Step 2: Access the Test Tab**

1. **Click the Test tab** (beaker/flask icon 🧪) in the left sidebar
2. Wait for it to load (should show "Loading..." then display functions)
3. If you see a connection error, go back to Step 1 and try the alternative RPC

---

## 🚀 **Step 3: Execute initialize_treasury**

1. **Find "initialize_treasury"** in the list of functions
2. **Click on it** to expand
3. **Verify the accounts are filled:**
   - `treasuryConfig`: Should show a PDA address (starts with letters/numbers)
   - `treasury`: Should show a PDA address
   - `authority`: Should show your wallet: `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`
   - `systemProgram`: Should be auto-filled

4. **Click the "Test" or "Send Transaction" button**
5. **Wait for the transaction** (10-30 seconds)

---

## ✅ **Step 4: Verify Success**

You'll see ONE of these outcomes:

### **Success Option 1: Transaction Signature**
```
✅ Transaction successful!
Signature: [long string of characters]
```
**This means:** Treasury initialized successfully! 🎉

### **Success Option 2: "Account Already Exists" Error**
```
❌ Error: Account already exists
```
**This also means SUCCESS!** The treasury was already initialized (possibly from a previous attempt).

### **Failure: Other Errors**
If you see any other error:
- Copy the error message
- Share it with me
- We'll troubleshoot together

---

## 📝 **After Success**

Once you see either success message:

1. **Copy the transaction signature** (if shown)
2. **Verify on Explorer:**
   ```
   https://explorer.solana.com/tx/[YOUR_SIGNATURE]
   ```

3. **Update the deployment docs** with the initialization transaction

---

## 🆘 **Troubleshooting**

### **"Connection Error" in Test Tab**
- Go back to Settings
- Try the alternative RPC (Alchemy)
- Refresh the page and try again

### **"Wallet Not Connected"**
- Click the wallet icon (👛) in top-right
- Make sure `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG` is selected
- Click "Connect" if needed

### **"Insufficient Funds"**
- Check wallet balance (should have 0.062 SOL)
- If balance is too low, add more SOL

### **Test Tab Shows "No Functions"**
- Go to Build & Deploy tab
- Click "Build" again
- Wait for build to complete
- Go back to Test tab

---

## 🎯 **Quick Checklist**

Before you start:
- [ ] Solana Playground is open: https://beta.solpg.io/
- [ ] Network is set to mainnet-beta (or custom with mainnet RPC)
- [ ] Program ID in code is: `FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn`
- [ ] Build was successful
- [ ] Wallet `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG` is connected
- [ ] Wallet has 0.062 SOL balance

---

**Ready? Follow the steps above and let me know the result!** 🚀

**Expected time:** 2-5 minutes
**Cost:** ~0.002 SOL
