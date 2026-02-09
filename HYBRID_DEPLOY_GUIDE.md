# 🚀 Hybrid Deployment Guide (Best of Both Worlds)

**Why:** Local build is failing due to Rust version conflicts. Playground deploy is flaky.
**Solution:** Build in Playground (easy) -> Deploy via CLI (reliable).

---

## 📋 **Step 1: Get Your Program ID**

We generated a fresh Program ID locally to ensure stability.

**Program ID:** `FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn`

---

## 🛠️ **Step 2: Build in Solana Playground**

1. Open **Solana Playground** (https://beta.solpg.io/)
2. Open `src/lib.rs`
3. Update line 4 with your Program ID:
   ```rust
   declare_id!("FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn");
   ```
4. Click **"Build"** (Hammer icon)
5. Wait for "Build successful!"

---

## 📥 **Step 3: Download the Binary**

1. After build succeeds, look for the **"Export"** option:
   - It might be a "Download" icon next to the Build button
   - Or click the **Tools icon** (wrench) -> **"Export to .so"**
   - Or check the terminal output for a download link
2. Save the file as `auto_savings.so`
3. Move/Copy this file to:
   `C:\Users\vclin_jjufoql\Documents\SAS\auto_savings.so`

---

## 🚀 **Step 4: Deploy via CLI**

Once the file is in place, run this command in your terminal:

```powershell
# Navigate to project
cd C:\Users\vclin_jjufoql\Documents\SAS

# Deploy using your funded CLI wallet
solana program deploy auto_savings.so --program-id target\deploy\auto_savings-keypair.json
```

**Note:** This uses the Helius RPC we configured earlier (`solana config get` to verify).

---

## 🎉 **Step 5: Verify**

After deployment, you'll see a **Program ID** and **Signature**.

Verify it on Explorer:
https://explorer.solana.com/address/FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn

---

## ⚠️ **Troubleshooting**

- **"File not found":** Make sure you saved `auto_savings.so` in the `SAS` folder.
- **"Insufficient funds":** Check `solana balance` (should be ~0.5 SOL).
- **"Deploy failed":** Try switching CLI to a different RPC if Helius fails:
  `solana config set --url https://api.mainnet-beta.solana.com`

**Ready? Let's do this!** 🚀
