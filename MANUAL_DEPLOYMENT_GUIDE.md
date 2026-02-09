# 🚀 MANUAL DEPLOYMENT GUIDE - Simple Steps

**Status:** Wallet funded with 0.5 SOL ✅  
**Wallet:** `skdnpzg9EecPCKutzi7uhF8drrU8sFiveLmpxbdk64Z`  
**Time:** ~10 minutes to complete

---

## 📝 **EASIEST METHOD: Copy/Paste the Code**

### Step 1: Open the Code File

The complete deployment code is in your local file:
```
C:\Users\vclin_jjufoql\Documents\SAS\programs\auto-savings\src\lib.rs
```

1. Open this file in Notepad or VS Code
2. Select ALL the code (Ctrl+A)
3. Copy it (Ctrl+C)

---

### Step 2: Paste into Solana Playground

1. Go to https://beta.solpg.io/
2. In the file explorer (left side), click on `src/lib.rs`
3. In the editor, select all (Ctrl+A)
4. Paste your code (Ctrl+V)
5. Save (Ctrl+S)

---

### Step 3: Build the Program

1. Click the **"Build"** button in the left sidebar (hammer icon)
2. Wait 30-60 seconds for compilation
3. Look for "Build successful!" in the terminal

**Expected output:**
```
Building...
Build successful!
Program ID: [some address]
```

---

### Step 4: Update the Program ID

After build succeeds, you'll see a Program ID in the terminal.

1. Copy the Program ID (example: `AbC123...XyZ`)
2. In the code, find line 4: `declare_id!("11111111111111111111111111111111");`
3. Replace the `1111...` with your actual Program ID
4. Save the file (Ctrl+S)
5. **Build again** (click Build button)

---

### Step 5: Deploy to Mainnet

1. Make sure you're on **mainnet-beta** (check bottom status bar)
2. Click the **"Deploy"** button in left sidebar (rocket icon)
3. Review the deployment details:
   - Program size
   - Cost (~0.3-0.4 SOL)
   - Your wallet balance
4. Click **"Deploy"** to confirm
5. Wait 30-60 seconds

**Success message:**
```
Deployment successful!
Program ID: [your program ID]
Transaction: [transaction signature]
```

---

### Step 6: Save Your Program ID

**CRITICAL:** Write down your Program ID immediately!

**Program ID:** `_______________________________________`

Save it to:
- This document (write above)
- Email yourself
- Text file on desktop
- Paper backup

---

### Step 7: Initialize the Treasury

After deployment, initialize the treasury (one-time):

1. In Playground, look for the "Test" tab
2. Find `initialize_treasury` function
3. Click "Test" or "Send"
4. Approve the transaction
5. Wait for confirmation

**Cost:** ~0.002 SOL

---

## 🎉 **YOU'RE DONE!**

Your program is now LIVE on Solana mainnet!

### Verify on Explorer:
1. Go to: https://explorer.solana.com/
2. Paste your Program ID
3. You should see your deployed program!

---

## ⚠️ **If You Get Stuck**

### "Can't paste code into editor"
- Try refreshing the Playground page
- Or create a new file: Click "+" → name it `lib.rs` → paste code there

### "Build failed"
- Check for syntax errors (red squiggly lines)
- Make sure you pasted the ENTIRE code
- Try building again

### "Deployment failed"
- Check wallet balance (should have ~0.5 SOL)
- Verify you're on mainnet-beta
- Try deploying again

### "Out of SOL"
- You need at least 0.35 SOL for deployment
- Add more SOL to your Playground wallet

---

## 📊 **What Happens Next?**

After successful deployment:

1. **Update Frontend**
   - Replace Program ID in frontend config
   - Test deposit/withdraw functions

2. **Test the Program**
   - Make a small test deposit (0.01 SOL)
   - Verify it appears in your vault
   - Test withdrawal

3. **Go Live!**
   - Deploy frontend to Vercel
   - Share with users
   - Start collecting fees!

---

## 💰 **Cost Summary**

- Program Deployment: ~0.35 SOL
- Treasury Init: ~0.002 SOL
- **Total:** ~0.352 SOL (~$35)

**Remaining in wallet:** ~0.148 SOL (for future operations)

---

## 🔐 **Security Reminder**

- Keep your 12-word seed phrase safe!
- This wallet is now your "Protocol Authority"
- It controls the treasury and can pause the protocol
- Consider moving to a hardware wallet later

---

**Ready? Open Solana Playground and let's deploy! 🚀**
