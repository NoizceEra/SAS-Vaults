# Solana Auto-Savings Protocol - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React Frontend - Existing)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Deposit    │  │   Withdraw   │  │ Update Rate  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT SDK LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useAutoSavings() Hook                                    │  │
│  │  - State Management                                       │  │
│  │  - Wallet Integration                                     │  │
│  │  - Error Handling                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AutoSavingsClient                                        │  │
│  │  - PDA Derivation                                         │  │
│  │  - Transaction Building                                   │  │
│  │  - Balance Queries                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SOLANA NETWORK                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RPC Node                                                 │  │
│  │  - Transaction Processing                                 │  │
│  │  - Account Queries                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUTO-SAVINGS PROGRAM                          │
│                    (On-Chain Smart Contract)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Instructions:                                            │  │
│  │  ✓ initialize_user(savings_rate)                         │  │
│  │  ✓ update_savings_rate(new_rate)                         │  │
│  │  ✓ deposit(amount)                                        │  │
│  │  ✓ withdraw(amount)                                       │  │
│  │  ✓ process_transfer(transfer_amount)                     │  │
│  │  ✓ deactivate()                                           │  │
│  │  ✓ reactivate()                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ON-CHAIN ACCOUNTS                          │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │   UserConfig PDA   │         │     Vault PDA      │         │
│  │                    │         │                    │         │
│  │ • Owner            │◄────────┤ • SOL Balance     │         │
│  │ • Savings Rate     │         │ • Rent-Exempt     │         │
│  │ • Total Saved      │         │                    │         │
│  │ • Total Withdrawn  │         │                    │         │
│  │ • Tx Count         │         │                    │         │
│  │ • Is Active        │         │                    │         │
│  └────────────────────┘         └────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Initialization Flow

```
User Wallet
    │
    ├─► Connect Wallet
    │
    ├─► Click "Initialize" (10% rate)
    │
    ├─► SDK: client.initializeUser(10)
    │
    ├─► Build Transaction:
    │   ├─ Derive UserConfig PDA
    │   ├─ Derive Vault PDA
    │   └─ Call initialize_user instruction
    │
    ├─► Sign Transaction
    │
    ├─► Send to Solana Network
    │
    ├─► Program Execution:
    │   ├─ Create UserConfig account
    │   ├─ Set savings_rate = 10
    │   ├─ Initialize counters
    │   └─ Mark as active
    │
    └─► Success! User initialized
```

### 2. Deposit Flow

```
User Wallet (100 SOL)
    │
    ├─► Click "Deposit 1 SOL"
    │
    ├─► SDK: client.deposit(1)
    │
    ├─► Build Transaction:
    │   ├─ Get UserConfig PDA
    │   ├─ Get Vault PDA
    │   └─ Call deposit instruction
    │
    ├─► Program Execution:
    │   ├─ Validate user is active
    │   ├─ Transfer 1 SOL: Wallet → Vault
    │   ├─ Update total_saved += 1
    │   └─ Increment transaction_count
    │
    └─► Result:
        ├─ Wallet: 99 SOL
        └─ Vault: 1 SOL
```

### 3. Auto-Save Transfer Flow

```
User initiates 10 SOL transfer (15% savings rate)
    │
    ├─► SDK: client.processTransfer(10)
    │
    ├─► Calculate: 10 * 15% = 1.5 SOL to save
    │
    ├─► Build Transaction:
    │   ├─ Get UserConfig PDA
    │   ├─ Get Vault PDA
    │   └─ Call process_transfer instruction
    │
    ├─► Program Execution:
    │   ├─ Validate user is active
    │   ├─ Calculate savings: 1.5 SOL
    │   ├─ Transfer 1.5 SOL: Wallet → Vault
    │   ├─ Update total_saved += 1.5
    │   └─ Increment transaction_count
    │
    └─► Result:
        ├─ 1.5 SOL saved to vault
        └─ 8.5 SOL available for transfer
```

### 4. Withdrawal Flow

```
Vault (5 SOL)
    │
    ├─► Click "Withdraw 2 SOL"
    │
    ├─► SDK: client.withdraw(2)
    │
    ├─► Build Transaction:
    │   ├─ Get UserConfig PDA
    │   ├─ Get Vault PDA (signer)
    │   └─ Call withdraw instruction
    │
    ├─► Program Execution:
    │   ├─ Validate user is active
    │   ├─ Check vault balance >= 2 SOL
    │   ├─ Transfer 2 SOL: Vault → Wallet (PDA signs)
    │   ├─ Update total_withdrawn += 2
    │   └─ Increment transaction_count
    │
    └─► Result:
        ├─ Wallet: +2 SOL
        └─ Vault: 3 SOL remaining
```

## PDA (Program Derived Address) System

```
┌─────────────────────────────────────────────────────────────┐
│                    PDA DERIVATION                           │
└─────────────────────────────────────────────────────────────┘

UserConfig PDA:
┌─────────────────────────────────────────────────────────────┐
│ Seeds: ["config", user_pubkey]                             │
│ Program ID: auto_savings                                    │
│ ──────────────────────────────────────────────────────────  │
│ Result: Deterministic address (no private key)             │
│ Purpose: Store user configuration                          │
└─────────────────────────────────────────────────────────────┘

Vault PDA:
┌─────────────────────────────────────────────────────────────┐
│ Seeds: ["vault", user_pubkey]                              │
│ Program ID: auto_savings                                    │
│ ──────────────────────────────────────────────────────────  │
│ Result: Deterministic address (no private key)             │
│ Purpose: Hold user's saved SOL                             │
│ Special: Program can sign on behalf of this PDA            │
└─────────────────────────────────────────────────────────────┘

Benefits:
✓ Deterministic - Same seeds = same address
✓ No private key needed
✓ Program-controlled
✓ Secure and auditable
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Ownership Validation
├─ Every instruction checks: user_config.owner == signer
├─ Prevents unauthorized access
└─ Enforced at program level

Layer 2: Account Validation
├─ Verify PDAs are correctly derived
├─ Check account discriminators
└─ Validate account ownership

Layer 3: Business Logic
├─ Savings rate: 1-90% only
├─ Amount validation: > 0
├─ Balance checks before withdrawal
└─ Active account requirement

Layer 4: Arithmetic Safety
├─ Checked addition/subtraction
├─ Overflow protection
└─ Safe type conversions

Layer 5: Emergency Controls
├─ Deactivate account (pause)
├─ Reactivate account (resume)
└─ User-controlled safety switch
```

## Transaction Lifecycle

```
1. USER ACTION
   └─► Click button in UI

2. SDK PREPARATION
   ├─► Derive PDAs
   ├─► Build instruction
   └─► Create transaction

3. WALLET SIGNING
   ├─► Request user approval
   ├─► Sign with private key
   └─► Return signature

4. NETWORK SUBMISSION
   ├─► Send to RPC node
   ├─► Propagate to validators
   └─► Include in block

5. PROGRAM EXECUTION
   ├─► Validate accounts
   ├─► Execute instruction
   ├─► Update state
   └─► Emit logs

6. CONFIRMATION
   ├─► Block finalized
   ├─► Transaction confirmed
   └─► UI updated

Total Time: ~400-800ms on Solana
```

## Cost Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                    COST ANALYSIS                            │
└─────────────────────────────────────────────────────────────┘

ONE-TIME COSTS (per user):
├─ UserConfig Account Creation: ~0.00089 SOL
│  (Rent-exempt minimum for 59 bytes)
│
└─ Vault Account: Rent-exempt based on balance
   (Minimum ~0.00089 SOL)

TRANSACTION COSTS:
├─ Initialize User: ~0.000005 SOL
├─ Deposit: ~0.000005 SOL
├─ Withdraw: ~0.000005 SOL
├─ Update Rate: ~0.000005 SOL
└─ Process Transfer: ~0.000005 SOL

PROTOCOL FEES:
└─ 0% (No protocol fees!)

TOTAL TO GET STARTED:
└─ ~0.002 SOL (~$0.30 at $150/SOL)
```

## Comparison: Traditional vs Auto-Savings

```
┌─────────────────────────────────────────────────────────────┐
│              TRADITIONAL SAVINGS                            │
└─────────────────────────────────────────────────────────────┘
User manually transfers to savings account
├─ Requires discipline
├─ Easy to forget
├─ Irregular amounts
└─ Custodial (bank controls funds)

┌─────────────────────────────────────────────────────────────┐
│              AUTO-SAVINGS PROTOCOL                          │
└─────────────────────────────────────────────────────────────┘
Automatic savings on every transaction
├─ No discipline required
├─ Never forget
├─ Consistent percentage
├─ Non-custodial (you control via PDA)
└─ Transparent on-chain
```

## Integration Points

```
Frontend Integration:
├─ Wallet Adapter
│  └─ Phantom, Solflare, etc.
│
├─ Auto-Savings SDK
│  ├─ client.ts (Core functionality)
│  └─ useAutoSavings.tsx (React hook)
│
└─ UI Components
   ├─ Deposit modal
   ├─ Withdraw modal
   ├─ Settings panel
   └─ Transaction history

Backend Integration:
├─ Solana Program (Rust)
│  └─ On-chain logic
│
├─ RPC Endpoints
│  └─ Transaction submission
│
└─ Account Queries
   └─ Balance checks
```

---

This architecture provides a secure, scalable, and user-friendly auto-savings solution on Solana!
