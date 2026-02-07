# 🚀 Slice Protocol: Road to Mainnet

This document outlines the critical steps remaining before we can safely deploying Slice to the Solana Mainnet.

## 1. 🏗️ Core Features (Must Have)
- [ ] **Multi-Split Architecture**  
  *Current status: Single split (Savings Only).*  
  We need to upgrade the contract to support multiple destination "buckets":
  - **Savings Vault** (Fixed %)
  - **Holiday Fund** (Optional %)
  - **Charity/Donation** (Optional %)
  - **Recipient** (Remainder)

- [ ] **Fee Treasury Verification**  
  Ensure the `treasury` address is hardcoded or reliably configurable to a safe wallet you control (hardware wallet recommended).

## 2. 🛡️ Security & Sadety
- [ ] **Access Control Review**  
  Verify that ONLY the PDA owner can withdraw funds. (Current code looks good, but double-check `has_one` constraints).
- [ ] **Emergency Stop (Pause)**  
  Ensure the `deactivate` function works instantly to freeze a user's vault if they suspect a compromise.
- [ ] **Slippage Limits (Swap)**  
  Ensure the `Auto-Swap` feature (if enabled) has hard-coded slippage protection (e.g., max 1% slippage) so users don't get sandwiched/exploited.

## 3. 🕸️ Infrastructure
- [ ] **RPC Provider**  
  Switch from Public RPC (unreliable) to a dedicated provider (Helius, Triton, QuickNode) for the production frontend.
- [ ] **Analytics Indexer**  
  Replace the "Mock Stats" on the landing page with real on-chain data fetching (Total Volume Locked, Active Users).

## 4. 🧪 Final Testing ("The $10 Challenge")
1. Deploy to Mainnet (marked as Beta).
2. Connect with a real wallet (Phantom/Backpack) and $10 SOL.
3. Perform every action: Deposit, Transfer, Split, Withdraw, Swap.
4. Verify balances match exactly.

---

## 📅 Recommended Next Step
**Implement the Multi-Split Feature.**  
This is the major architectural change. It's better to do this *before* auditing/deploying so we don't have to migrate data later.
