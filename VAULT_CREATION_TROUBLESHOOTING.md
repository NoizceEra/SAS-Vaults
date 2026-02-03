# 🔧 Vault Creation Troubleshooting Guide

## Issue: "Failed to create vault" Error

Users are reporting that they can connect their wallets but cannot create vaults. This guide explains the root causes and solutions implemented.

---

## 🔍 Root Causes Identified

### 1. **Insufficient Devnet SOL** (Primary Cause)
- **Problem:** Users connect wallets with 0 SOL on Devnet
- **Why it fails:** Creating a vault requires ~0.003 SOL for:
  - UserConfig PDA account rent (~0.0015 SOL)
  - Vault PDA account rent (~0.0015 SOL)
  - Transaction fees (~0.0001 SOL)
- **Impact:** Transaction simulation fails before reaching the blockchain

### 2. **Unreliable Public RPC**
- **Problem:** `https://api.devnet.solana.com` is notoriously unstable
- **Why it fails:** 
  - Frequent timeouts
  - Rate limiting (429 errors)
  - Dropped transactions
  - Blockhash expiration
- **Impact:** Transactions fail to broadcast or confirm

### 3. **Network Mismatch**
- **Problem:** Users' wallets are set to Mainnet-Beta
- **Why it fails:** Program only exists on Devnet
- **Impact:** Wallet refuses to sign or silently fails

---

## ✅ Solutions Implemented

### 1. Automatic Devnet SOL Airdrop
**File:** `frontend/src/sdk/useAutoSavings.jsx`

```javascript
// Check balance before vault creation
const balance = await client.getWalletBalance();
const MIN_BALANCE = 0.003;

if (balance < MIN_BALANCE) {
    const endpoint = connection.rpcEndpoint;
    const isDevnet = endpoint.includes('devnet');
    
    if (isDevnet) {
        // Automatically request 0.5 SOL airdrop
        const airdropSignature = await connection.requestAirdrop(
            wallet.publicKey,
            0.5 * 1e9
        );
        await connection.confirmTransaction(airdropSignature);
    }
}
```

**Benefits:**
- ✅ Seamless user experience
- ✅ No manual faucet visits required
- ✅ Works automatically on Devnet

### 2. Enhanced Error Messages
**File:** `frontend/src/sdk/useAutoSavings.jsx`

Specific error messages for common scenarios:
- ❌ "Transaction was rejected" → User declined in wallet
- ❌ "Insufficient SOL balance" → Not enough funds
- ❌ "Network timeout" → RPC is slow
- ❌ "Rate limit exceeded" → Too many requests
- ❌ "Transaction expired" → Blockhash issues

**Benefits:**
- ✅ Users understand what went wrong
- ✅ Clear actionable guidance
- ✅ Reduced support burden

### 3. "Get Devnet SOL" Button
**File:** `frontend/src/components/OnboardingScreen.jsx`

```jsx
{walletBalance < 0.003 && (
    <div className="low-balance-warning">
        <a href="https://faucet.solana.com" target="_blank">
            🚰 Get Devnet SOL
        </a>
    </div>
)}
```

**Benefits:**
- ✅ Visible warning for low balance
- ✅ Direct link to Solana faucet
- ✅ Fallback if airdrop fails

### 4. Balance Validation
**File:** `frontend/src/sdk/useAutoSavings.jsx`

Pre-flight checks before attempting vault creation:
- Check wallet balance
- Validate network (Devnet vs Mainnet)
- Provide specific error if insufficient

**Benefits:**
- ✅ Fail fast with clear messages
- ✅ No wasted transaction attempts
- ✅ Better UX

---

## 📊 Transaction Analysis

### Successful Transaction Example
**Signature:** `2D6PbaLidyTyD58EEroLHuHih67m2oaFGH2bXgWNNcQPHorL3xzt4u2mNxK6Bt93oMWcK32bJLzR3wFPFo3Jk3rc`

**Accounts Created:**
1. UserConfig PDA: `GMHTMMeTw64ab4FSf8bRSJu1kucGMvmtnF5kaGqvirWW`
2. Vault PDA: `6CgCo8ZeGEpxERR7q3taNUeK9Wgo4QJwupffy1UzK81b`

**Cost Breakdown:**
- UserConfig rent: ~0.0015 SOL
- Vault rent: ~0.0015 SOL
- Transaction fee: ~0.00005 SOL
- **Total:** ~0.003 SOL

### On-Chain Status
- **Program ID:** `AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j`
- **Network:** Devnet
- **Status:** Executable ✅
- **Successful Transactions:** 2 (as of investigation)
- **Failed Transactions:** 0 (failures happen client-side)

---

## 🚀 User Flow (After Fixes)

### Scenario 1: User with 0 SOL (Devnet)
1. User connects wallet
2. App detects balance < 0.003 SOL
3. **Automatic airdrop** of 0.5 SOL
4. Vault creation proceeds
5. ✅ Success!

### Scenario 2: User with 0 SOL (Mainnet)
1. User connects wallet
2. App detects balance < 0.003 SOL
3. App detects Mainnet (not Devnet)
4. Error: "Insufficient SOL balance. You need at least 0.003 SOL..."
5. User sees "Get Devnet SOL" button
6. User switches to Devnet or adds funds
7. ✅ Success!

### Scenario 3: Airdrop Fails
1. User connects wallet
2. Automatic airdrop attempted
3. Airdrop fails (rate limit, network error)
4. Error: "Insufficient SOL balance (0.0000 SOL). Please get Devnet SOL from https://faucet.solana.com..."
5. User clicks "Get Devnet SOL" button
6. User manually requests from faucet
7. ✅ Success!

---

## 🔮 Future Improvements

### Short-term
1. **Better RPC Provider**
   - Switch from public `api.devnet.solana.com`
   - Use Helius, QuickNode, or Alchemy
   - Reduces timeout and rate limit errors

2. **Network Detection**
   - Detect wallet's current network
   - Show warning if not on Devnet
   - Provide "Switch to Devnet" button

3. **Transaction Retry Logic**
   - Automatically retry failed transactions
   - Exponential backoff
   - Fresh blockhash on retry

### Long-term
1. **Mainnet Deployment**
   - Deploy program to Mainnet-Beta
   - No airdrop needed
   - Real SOL transactions

2. **Error Monitoring**
   - Integrate Sentry or similar
   - Track error rates
   - Identify patterns

3. **Transaction Status UI**
   - Show transaction progress
   - "Requesting airdrop..."
   - "Confirming transaction..."
   - "Vault created!"

---

## 📝 Testing Checklist

Before deploying to production:

- [ ] Test with wallet that has 0 SOL on Devnet
- [ ] Verify automatic airdrop works
- [ ] Test with wallet on Mainnet (should show error)
- [ ] Test with sufficient SOL (should skip airdrop)
- [ ] Verify error messages are user-friendly
- [ ] Test "Get Devnet SOL" button link
- [ ] Verify low balance warning appears
- [ ] Test vault creation after airdrop
- [ ] Check console logs for debugging info
- [ ] Verify transaction appears on Solana Explorer

---

## 🐛 Known Issues

1. **Airdrop Rate Limiting**
   - Solana faucet limits airdrops per IP/wallet
   - May fail if user recently requested
   - Fallback: Manual faucet link

2. **RPC Instability**
   - Public Devnet RPC is unreliable
   - Timeouts are common
   - Solution: Retry or use better RPC

3. **Network Detection**
   - Currently checks RPC endpoint
   - Doesn't detect wallet's network setting
   - May cause confusion if mismatch

---

## 📞 Support Resources

**For Users:**
- Solana Faucet: https://faucet.solana.com
- Solana Explorer: https://explorer.solana.com/?cluster=devnet
- Program ID: `AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j`

**For Developers:**
- RPC Endpoint: `https://api.devnet.solana.com`
- Alternative RPC: Consider Helius, QuickNode, Alchemy
- IDL: Located in `frontend/src/idl/idl.js`

---

## 📈 Success Metrics

After deployment, monitor:
- Vault creation success rate (target: >95%)
- Average time to create vault (target: <10s)
- Airdrop success rate (target: >80%)
- Error rate by type
- User drop-off at onboarding

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Fixes Implemented, Ready for Testing
