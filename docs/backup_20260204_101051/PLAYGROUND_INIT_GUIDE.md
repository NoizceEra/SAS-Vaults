# 🚀 Quick Treasury Initialization via Solana Playground

Since the Devnet airdrop is rate-limited, use Solana Playground to initialize the treasury quickly.

---

## Steps

### 1. Import Treasury Authority to Playground

1. Go to https://beta.solpg.io
2. Click on your wallet (bottom left)
3. Click "Import"
4. Paste your private key array from `~/.config/solana/treasury-authority.json`:
   ```
   [136,170,155,53,213,150,187,20,108,225,255,193,194,242,228,237,225,215,207,143,254,234,159,94,53,241,68,252,173,203,138,51,229,2,146,209,216,80,23,49,66,196,229,36,212,59,195,167,93,218,125,96,224,87,123,238,244,123,80,117,94,152,60,165]
   ```
5. Name it "Treasury Authority"
6. Click "Import"

### 2. Get Devnet SOL

1. In Playground, make sure "Treasury Authority" wallet is selected
2. Click "Airdrop" (or use the terminal: `solana airdrop 2`)
3. Wait for confirmation

### 3. Initialize Treasury

1. In the Playground terminal, run:
   ```bash
   build
   ```

2. Then run the initialization:
   ```typescript
   // In the Test tab or terminal
   const tx = await pg.program.methods
     .initializeTreasury()
     .accounts({
       treasuryConfig: treasuryConfigPDA,
       treasury: treasuryVaultPDA,
       authority: pg.wallet.publicKey,
       systemProgram: web3.SystemProgram.programId,
     })
     .rpc();
   
   console.log("Treasury initialized:", tx);
   ```

3. Or use the Test UI:
   - Select "initializeTreasury" from the instruction dropdown
   - Click "Test"

### 4. Verify Initialization

Run the check script locally:
```bash
node scripts/manage-treasury.js check
```

You should see:
```
✅ Treasury initialized
Authority: GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U
Total Fees: 0 SOL
```

---

## Alternative: Wait for Airdrop Rate Limit

If you prefer to wait, the rate limit usually resets in 1-2 hours. Then run:

```bash
solana airdrop 1 GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U --url devnet
node scripts/initialize-treasury.js
```

---

## ✅ Once Initialized

You're ready to move on to building the swap feature! The treasury will automatically collect fees from all deposits and withdrawals.
