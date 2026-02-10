# 🏦 Treasury Initialization Guide (Solana Playground)

Since the CLI initialization is encountering issues, let's use **Solana Playground** which is more reliable for this step.

---

## 📋 **Prerequisites**

✅ Program deployed: `FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn`  
✅ Wallet funded: `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG` (0.062 SOL)

---

## 🚀 **Step-by-Step Instructions**

### **Step 1: Open Solana Playground**

1. Go to: https://beta.solpg.io/
2. Make sure you're connected to **mainnet-beta** (check bottom status bar)
3. Make sure your wallet is connected (the one with 0.062 SOL)

---

### **Step 2: Go to Test Tab**

1. Click the **"Test"** tab (beaker icon) in the left sidebar
2. You should see your program's functions listed

---

### **Step 3: Find initialize_treasury Function**

Look for the `initialize_treasury` function in the list. It should show:
- Function name: `initialize_treasury`
- No parameters required
- Accounts will be auto-filled

---

### **Step 4: Execute the Function**

1. Click on `initialize_treasury`
2. The accounts should auto-populate:
   - `treasuryConfig`: (auto-derived PDA)
   - `treasury`: (auto-derived PDA)
   - `authority`: (your connected wallet)
   - `systemProgram`: (auto-filled)
3. Click **"Test"** or **"Send Transaction"** button
4. Approve the transaction in your wallet popup
5. Wait for confirmation (~5-10 seconds)

---

### **Step 5: Verify Success**

After the transaction confirms, you should see:
- ✅ Transaction signature
- ✅ Success message
- ✅ Link to view on Explorer

**Save the transaction signature!**

---

## 🔍 **Alternative: Manual Verification**

If you want to verify the treasury was initialized, check these PDAs:

### **Treasury Config PDA:**
```
Seeds: ["treasury_config"]
Program: FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn
```

### **Treasury Vault PDA:**
```
Seeds: ["treasury_vault"]
Program: FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn
```

You can check these on Solana Explorer to see if they have been created.

---

## ⚠️ **Troubleshooting**

### **"Account already exists" error**
- The treasury is already initialized!
- Skip to verification step

### **"Insufficient funds" error**
- You need at least 0.002 SOL
- Check your wallet balance

### **"Transaction failed" error**
- Check you're on mainnet-beta (not devnet)
- Verify the Program ID is correct
- Try again (network might be congested)

### **Can't find the Test tab**
- Make sure you have the program open in Playground
- The Test tab should be in the left sidebar
- Try refreshing the page

---

## ✅ **After Initialization**

Once the treasury is initialized:

1. **Update your deployment docs** with the transaction signature
2. **Test user initialization** (users can now create accounts)
3. **Test deposits** (users can deposit SOL)
4. **Deploy your frontend** (it's already configured for mainnet)

---

## 📝 **Expected Treasury Configuration**

After initialization, your treasury will have:
- **Authority:** `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`
- **Is Paused:** `false`
- **Total TVL:** `0 SOL`
- **TVL Cap:** `10 SOL`
- **Bump:** (auto-generated)

---

## 🎯 **Next Steps After Success**

1. ✅ Treasury initialized
2. 🚀 Deploy frontend to production
3. 📱 Test with real users
4. 💰 Monitor fee collection
5. 📊 Track TVL growth

---

**Ready? Open Solana Playground and let's initialize! 🚀**
