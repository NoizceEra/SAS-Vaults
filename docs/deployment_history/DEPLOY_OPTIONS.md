# 🚀 Deploy Minimal Program to Mainnet

## Current Status
- ✅ Phantom wallet connected: `84iSdvKB88n8MQk2wXWd6jAwnMy7ZxzKcCNNh6GQ9pZs`
- ✅ Balance: ~1 SOL
- ✅ Program ID: `JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv`
- ✅ Code ready (420 lines minimal version)
- ❌ Solana Playground RPC connection failing

## 🎯 **SIMPLEST SOLUTION: Manual Deploy in Playground**

Since Phantom is already connected and the Program ID is set, you just need to:

### **Option A: Wait for Solana Playground to Recover (Recommended)**

The RPC connection error is temporary. Try again in 10-15 minutes:

1. Go to https://beta.solpg.io/
2. Project should still be `sliceprotocol_final`
3. Phantom should still be connected
4. Click **Build & Deploy** button (pink button on left)
5. Approve in Phantom when it pops up

### **Option B: Try Different RPC in Playground**

1. In Solana Playground, click **Settings** (gear icon)
2. Click the **Endpoint** dropdown
3. Select **Custom**
4. Enter: `https://api.mainnet-beta.solana.com`
5. Close settings
6. Click **Build & Deploy**

### **Option C: Deploy via CLI (If you have Solana CLI installed)**

```powershell
# Set RPC
solana config set --url https://api.mainnet-beta.solana.com

# Deploy (you'll need the .so file from a successful build)
solana program deploy target/deploy/auto_savings.so `
  --program-id JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv `
  --keypair C:\Users\vclin_jjufoql\.config\solana\deployer.json
```

---

## ⚠️ **Why Local Build Failed**

The local Anchor build requires Rust 1.75.0, but you have a different version. Solana Playground handles this automatically, which is why it's the easiest option.

---

## 📊 **Expected Results**

When deployment succeeds, you'll see:
- Transaction signature
- Deployment cost: **~0.5-0.7 SOL**
- Program ID confirmation: `JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv`

---

## 🎯 **Next Steps After Deployment**

1. **Initialize Treasury**:
   ```bash
   node scripts/initialize-mainnet-treasury.js
   ```

2. **Update Frontend**:
   - Edit `frontend/src/config/solana.js`
   - Change `PROGRAM_ID` to `JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv`

3. **Deploy Frontend**:
   ```bash
   cd frontend
   npm run build
   # Then deploy to Netlify
   ```

---

**Recommendation**: Try **Option A** (wait 10-15 min and retry in Playground). It's the simplest and most reliable.
