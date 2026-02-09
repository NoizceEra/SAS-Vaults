# Mainnet Deployment Status

**Date:** February 8, 2026  
**Checklist followed:** `DEPLOYMENT_CHECKLIST.md`

---

## What was done

### Phase 1 (partial)
- **1.1 Safety patches:** Already present in `lib.rs` (TVL cap 10 SOL, `SWAPS_ENABLED = false`, emergency pause, TVL tracking).
- **1.2 Review:** Confirmed `TVL_CAP_LAMPORTS = 10_000_000_000` and `SWAPS_ENABLED = false`.
- **1.3 Emergency functions:** `toggle_pause` and `update_tvl_cap` (and their context structs) already in `lib.rs`.
- **1.4 Optimize script:** Skipped (PowerShell syntax errors in `optimize-rust-code.ps1`).
- **1.5–1.6 Build:** **Blocked** – build fails (see below).

### Phase 2
- **2.1–2.2:** Solana CLI set to **mainnet-beta**. Wallet: `6FvyEfsRbRcvDDaUeu6xKDhiJCYzkZVx1n46QfnwMrsu`.
- **2.3–2.4:** **Mainnet balance: 0 SOL.** Checklist requires **10–15 SOL** (~$1,000–1,500) for deployment and buffer.

### Program ID / keypair
- New program keypair generated and saved as:
  - `target/deploy/auto_savings-keypair.json`
  - Program ID (for mainnet once deployed): **`V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`**
- `lib.rs` and `Anchor.toml` (devnet + mainnet) synced to this program ID.
- `scripts/initialize-mainnet-treasury.js` updated to use **`V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`**.

---

## What’s blocking deployment

### 1. Build failure
- **Symptom:** `anchor build` fails with:
  - Either: `The system cannot find the path specified` (path issue in Anchor/cargo-build-sbf on Windows), or
  - Or: `cargo metadata` / `wit-bindgen` (or similar) error about **`edition2024`** not being stabilized in the Cargo version used by the Solana/Anchor toolchain.
- **Cause:** Same class of dependency/toolchain issue as earlier (newer crates require Rust/Cargo that support edition2024; Solana’s `cargo-build-sbf` uses an older Cargo).
- **Needed:** Either:
  - Fix the build on this machine (e.g. newer Solana/Agave platform-tools, or dependency pins that work with current toolchain), or
  - Build on an environment where `anchor build` (or `cargo-build-sbf`) already succeeds (e.g. WSL2, Linux, or a CI that you know works).

### 2. Mainnet SOL
- **Current mainnet balance:** 0 SOL.
- **Checklist requirement:** 10–15 SOL for:
  - Program deployment (~0.6–0.9 SOL)
  - Treasury init, testing, and buffer.
- **Action:** Send 10–15 SOL to `6FvyEfsRbRcvDDaUeu6xKDhiJCYzkZVx1n46QfnwMrsu` on **mainnet** (e.g. from an exchange or another wallet).

---

## When build and funding are ready – next steps

1. **Build**
   - From repo root:  
     `anchor build`  
     (or use the same method that works on your side, e.g. `cargo-build-sbf` with the right toolchain).
   - Confirm `target/deploy/auto_savings.so` (or `programs/auto-savings/target/deploy/auto_savings.so`) is produced.

2. **Mainnet deploy**
   - Config already set to mainnet; ensure wallet has 10+ SOL.
   - Deploy:
     ```bash
     anchor deploy --provider.cluster mainnet-beta --program-name auto_savings
     ```
   - Or deploy the built `.so` with the keypair we created:
     ```bash
     solana program deploy target/deploy/auto_savings.so --program-id target/deploy/auto_savings-keypair.json
     ```
   - Program will be at: **`V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`**.

3. **Initialize treasury**
   - From repo root:
     ```bash
     cd scripts
     node initialize-mainnet-treasury.js
     ```
   - Script is already configured for program ID `V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q` and mainnet RPC.

4. **Frontend (mainnet)**
   - Set mainnet and program ID, e.g.:
     - `VITE_NETWORK=mainnet-beta`
     - `VITE_PROGRAM_ID=V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`
   - Rebuild and deploy frontend (e.g. Vercel).

5. **Monitoring and testing**
   - Use `scripts/monitor-mainnet.js` with:
     - `PROGRAM_ID=V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`
   - Follow Phase 7 of `DEPLOYMENT_CHECKLIST.md` (small-amount tests, TVL cap, pause, etc.).

---

## Summary

| Item                         | Status |
|-----------------------------|--------|
| Safety features in code     | Done   |
| Program keypair + ID sync   | Done (ID: `V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q`) |
| Solana config → mainnet     | Done   |
| Treasury script program ID  | Updated |
| **Build**                   | **Blocked** (toolchain/deps) |
| **Mainnet SOL (10–15 SOL)** | **0 SOL – need to fund** |
| Deploy / init / frontend    | Pending (after build + funding) |

You can continue from **DEPLOYMENT_CHECKLIST.md** from **Phase 3** once:
- `anchor build` (or your working build) succeeds, and  
- Mainnet balance is at least 10 SOL.
