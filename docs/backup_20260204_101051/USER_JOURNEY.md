# 🗺️ Solana Auto-Savings Protocol - Complete User Journey

## 📋 Overview
This document walks through the complete user experience from first visit to active usage, showing every screen and interaction.

---

## 🎬 Journey Map

```
Landing Page → Wallet Connection → Onboarding → Dashboard → Deposit → Manage → Withdraw
```

---

## 1️⃣ Landing Page (Not Yet Connected)

### Screen Description
Clean, modern landing page introducing the Auto-Savings Protocol.

### Visual Elements
- **Hero Section:**
  - Large headline: "Save Automatically on Solana"
  - Subheadline: "Set your savings rate once, save effortlessly forever"
  - Glowing Solana logo animation
  - Large "Connect Wallet" button (purple gradient)

- **Features Section:**
  - 💰 "Automatic Savings" - Set it and forget it
  - 🔒 "Non-Custodial" - You always control your funds
  - ⚡ "Instant Withdrawals" - Access your money anytime
  - 📊 "Low Fees" - Only 0.4% platform fee

- **How It Works:**
  1. Connect your Solana wallet
  2. Set your savings rate (e.g., 50%)
  3. Deposit SOL - it auto-splits to savings & spending
  4. Watch your savings grow!

- **Stats Section:**
  - Total Value Locked: $XXX,XXX
  - Active Users: X,XXX
  - Total Saved: XXX SOL

### User Actions
- Click "Connect Wallet" button
- Scroll to learn more
- View FAQ

---

## 2️⃣ Wallet Connection

### Screen Description
Modal overlay for wallet selection.

### Visual Elements
- **Modal Title:** "Connect Your Wallet"
- **Wallet Options:**
  - 🦊 Phantom (Most popular)
  - 🌟 Solflare
  - 💼 Backpack
  - 🔗 WalletConnect
  - ➕ More wallets...

- Each option shows:
  - Wallet logo
  - Wallet name
  - "Recommended" badge (for Phantom)

### User Actions
1. Click preferred wallet
2. Wallet extension opens
3. Approve connection
4. App receives wallet public key
5. Check if user has existing vault

### Technical Flow
```javascript
// Check for existing vault
const vaultPDA = PublicKey.findProgramAddressSync(
  [Buffer.from("savings_vault"), wallet.publicKey.toBuffer()],
  programId
)[0];

const vault = await program.account.savingsVault.fetch(vaultPDA);

if (vault exists) {
  → Go to Dashboard
} else {
  → Go to Onboarding
}
```

---

## 3️⃣ Onboarding Screen (First-Time Users)

### Screen Description
*See mockup: onboarding_setup_view.png*

Interactive setup for new users to configure their savings rate.

### Visual Elements
- **Header:**
  - Glowing Solana logo with purple aura
  - "Welcome to Auto-Savings" (large white text)
  - "Set your savings rate to get started" (gray subtext)

- **Savings Rate Selector:**
  - Large circular dial showing "50%"
  - Purple gradient ring around percentage
  - Draggable or clickable to adjust (0-100%)

- **Visual Preview:**
  - Two horizontal bars:
    - Green bar: "Savings" (50% filled)
    - Blue bar: "Spending" (50% filled)
  
- **Example Calculation:**
  - "For every 1 SOL deposited:"
  - 💚 "0.50 SOL → Savings"
  - 💙 "0.50 SOL → Spending"
  - ℹ️ "Platform fee: 0.004 SOL (0.4%)"

- **CTA Button:**
  - Large gradient button: "Create Vault"
  - Small text below: "You can change this anytime"

### User Actions
1. Adjust savings rate (optional, defaults to 50%)
2. See real-time preview update
3. Click "Create Vault"
4. Approve transaction in wallet (~0.002 SOL for rent)
5. Wait for confirmation
6. Redirect to dashboard

### Technical Flow
```javascript
await program.methods
  .initializeVault(savingsRate) // e.g., 50
  .accounts({
    user: wallet.publicKey,
    vault: vaultPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// On success:
showSuccessToast("Vault created successfully!");
navigate("/dashboard");
```

---

## 4️⃣ Main Dashboard (Empty State)

### Screen Description
First view of dashboard after vault creation, with 0 balances.

### Visual Elements
- **Header:**
  - Solana logo (left)
  - "Auto-Savings" title
  - Wallet address (truncated): "SRtX...3t2"
  - Disconnect button

- **Balance Cards:**
  - **Total Savings:** 0.00 SOL (large, centered, purple glow)
  - **Savings Balance:** 0.00 SOL (green accent)
  - **Spending Balance:** 0.00 SOL (blue accent)

- **Savings Rate Control:**
  - Label: "Savings Rate: 50%"
  - Slider (interactive)
  - "Update Rate" button (appears when changed)

- **Empty State Message:**
  - 📭 "No transactions yet"
  - "Make your first deposit to start saving!"
  - Large "Deposit SOL" button (purple gradient)

### User Actions
- Click "Deposit SOL" to make first deposit
- Adjust savings rate (optional)
- View wallet balance

---

## 5️⃣ Deposit Modal

### Screen Description
*See mockup: deposit_modal_view.png*

Modal for depositing SOL with automatic split preview.

### Visual Elements
- **Header:**
  - "Deposit SOL" title
  - Close button (×)

- **Amount Input:**
  - Large input field with SOL icon
  - Placeholder: "0.00"
  - "MAX" button (fills with wallet balance)
  - Helper text: "Available: 5.23 SOL"

- **Fee & Split Breakdown:**
  - Small gray text: "After 0.4% fee (0.004 SOL)"
  - Green row: "→ Savings (50%): 0.498 SOL"
  - Blue row: "→ Spending (50%): 0.498 SOL"
  - White text: "You'll receive: 0.996 SOL"

- **Action Buttons:**
  - "Confirm Deposit" (purple gradient, large)
  - "Cancel" (outlined, gray)

### User Actions
1. Enter amount (e.g., 1.00 SOL)
2. See real-time calculation update
3. Review split and fee
4. Click "Confirm Deposit"
5. Approve transaction in wallet
6. See loading state: "Processing deposit..."
7. Transaction confirms
8. Success animation plays
9. Modal closes
10. Dashboard updates with new balances

### Calculation Logic
```javascript
// User input: 1.00 SOL (1,000,000,000 lamports)
const amount = 1_000_000_000;

// Platform fee: 0.4%
const platformFee = amount * 4 / 1000; // 4,000,000 lamports (0.004 SOL)

// Remaining after fee
const remaining = amount - platformFee; // 996,000,000 lamports (0.996 SOL)

// Split based on savings rate (50%)
const savingsAmount = remaining * 50 / 100; // 498,000,000 lamports (0.498 SOL)
const spendingAmount = remaining - savingsAmount; // 498,000,000 lamports (0.498 SOL)

// Display in modal:
"After 0.4% fee (0.004 SOL)"
"→ Savings (50%): 0.498 SOL"
"→ Spending (50%): 0.498 SOL"
"You'll receive: 0.996 SOL"
```

### Technical Flow
```javascript
await program.methods
  .deposit(new BN(amount))
  .accounts({
    user: wallet.publicKey,
    vault: vaultPDA,
    treasury: treasuryPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// On success:
confetti(); // Show celebration animation
showSuccessToast("Deposit successful! +1.00 SOL");
closeModal();
refreshBalances();
```

---

## 6️⃣ Main Dashboard (Active State)

### Screen Description
*See mockup: dashboard_main_view.png*

Dashboard after successful deposit, showing active balances.

### Visual Elements
- **Balance Cards:**
  - **Total Savings:** 2.45 SOL (glowing purple card)
  - **Savings Balance:** 1.47 SOL ↗ (green accent)
  - **Spending Balance:** 0.98 SOL ↘ (blue accent)

- **Savings Rate Control:**
  - "Savings Rate: 50%"
  - Interactive slider
  - Current position at 50%

- **Recent Transactions:**
  - List of recent activity:
    - ↑ Auto-Save | Oct 26, 2023 | +0.12 SOL
    - ↓ Deposit | Oct 25, 2023 | +0.50 SOL
    - ↑ Withdrawal | Oct 24, 2023 | -0.20 SOL
    - ↑ Auto-Save | Oct 23, 2023 | +0.08 SOL
  - Each row shows:
    - Icon (colored circle with arrow)
    - Transaction type
    - Date
    - Amount (green for deposits, red for withdrawals)
    - "View" button

- **Action Buttons:**
  - "Deposit" (purple gradient)
  - "Withdraw" (outlined)
  - "Settings" (icon button)

### User Actions
- View current balances
- Adjust savings rate
- Make another deposit
- Withdraw funds
- View transaction details
- Navigate to analytics

---

## 7️⃣ Adjust Savings Rate

### Screen Description
Inline interaction on dashboard to change savings rate.

### Visual Elements
- **Savings Rate Slider:**
  - Current: 50%
  - User drags to new value (e.g., 75%)
  - Visual preview updates in real-time:
    - Savings bar: 75% filled (green)
    - Spending bar: 25% filled (blue)

- **Update Button:**
  - Appears when rate changes
  - "Update to 75%" (purple gradient)
  - Shows confirmation modal

- **Confirmation Modal:**
  - "Update Savings Rate?"
  - "Future deposits will be split:"
  - "→ Savings: 75%"
  - "→ Spending: 25%"
  - "Existing balances won't change"
  - "Confirm" / "Cancel" buttons

### User Actions
1. Drag slider to new percentage
2. See preview update
3. Click "Update to X%"
4. Review confirmation modal
5. Click "Confirm"
6. Approve transaction in wallet
7. Success message: "Savings rate updated to 75%"
8. Slider updates to new position

### Technical Flow
```javascript
await program.methods
  .updateSavingsRate(newRate) // e.g., 75
  .accounts({
    user: wallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();

// On success:
showSuccessToast("Savings rate updated to 75%");
refreshVaultData();
```

---

## 8️⃣ Withdraw Modal

### Screen Description
Modal for withdrawing SOL from savings or spending.

### Visual Elements
- **Header:**
  - "Withdraw SOL" title
  - Close button (×)

- **Source Selector:**
  - Tab buttons:
    - [Savings] (active, green highlight)
    - [Spending] (inactive)
  - Shows available balance: "Available: 1.47 SOL"

- **Amount Input:**
  - Large input field
  - Placeholder: "0.00"
  - "Withdraw All" button
  - Helper text: "No withdrawal fees"

- **Summary:**
  - "You'll receive: 0.50 SOL"
  - "Remaining in savings: 0.97 SOL"

- **Action Buttons:**
  - "Confirm Withdrawal" (purple gradient)
  - "Cancel" (outlined)

### User Actions
1. Select source (Savings or Spending)
2. Enter amount or click "Withdraw All"
3. See remaining balance preview
4. Click "Confirm Withdrawal"
5. Approve transaction in wallet
6. See loading state: "Processing withdrawal..."
7. Transaction confirms
8. Success message: "Withdrawal successful! -0.50 SOL"
9. Modal closes
10. Dashboard updates

### Technical Flow
```javascript
await program.methods
  .withdraw(new BN(amount), fromSavings) // e.g., 500_000_000, true
  .accounts({
    user: wallet.publicKey,
    vault: vaultPDA,
  })
  .rpc();

// On success:
showSuccessToast("Withdrawal successful! -0.50 SOL");
closeModal();
refreshBalances();
```

---

## 9️⃣ Transaction History (Full View)

### Screen Description
Dedicated page showing all transactions with filtering.

### Visual Elements
- **Header:**
  - "Transaction History" title
  - Filter buttons:
    - [All] [Deposits] [Withdrawals] [Auto-Saves]
  - Date range selector

- **Transaction List:**
  - Each item shows:
    - Icon (colored, with arrow direction)
    - Type (Deposit, Withdrawal, Auto-Save, Rate Update)
    - Date & time
    - Amount (colored)
    - Transaction signature (truncated)
    - "View on Explorer" link

- **Pagination:**
  - "Load More" button
  - Or infinite scroll

### User Actions
- Filter by transaction type
- Select date range
- Click transaction to see details
- View on Solana Explorer
- Export to CSV

---

## 🔟 Analytics Dashboard

### Screen Description
Visual analytics showing savings progress over time.

### Visual Elements
- **Savings Growth Chart:**
  - Line chart with purple gradient fill
  - X-axis: Time
  - Y-axis: SOL balance
  - Hover to see exact values
  - Time range selector: [7D] [30D] [90D] [1Y] [ALL]

- **Statistics Cards:**
  - Total Deposited: 5.23 SOL
  - Total Withdrawn: 2.78 SOL
  - Net Savings: 2.45 SOL
  - Average Savings Rate: 52%
  - Days Active: 45

- **Savings vs Spending Pie Chart:**
  - Donut chart
  - Green: Savings (60%)
  - Blue: Spending (40%)
  - Center: Total balance

- **Insights:**
  - 🎯 "You're saving 10% more than average users!"
  - 📈 "Your savings grew 15% this month"
  - 💡 "Tip: Increase your rate to 60% to reach your goal faster"

### User Actions
- Change time range
- View detailed breakdowns
- Export analytics report

---

## 1️⃣1️⃣ Settings Page

### Screen Description
User preferences and account management.

### Visual Elements
- **Account Section:**
  - Wallet address (full)
  - "Copy Address" button
  - "View on Explorer" link
  - Vault creation date

- **Preferences:**
  - Default savings rate: [50%]
  - Currency display: [SOL] [USD]
  - Notifications: [On] [Off]
  - Theme: [Dark] [Light] (Dark only for now)

- **Advanced:**
  - Export transaction history
  - Close vault (requires 0 balance)
  - View smart contract

- **Support:**
  - Documentation link
  - Discord community
  - Report issue

### User Actions
- Update preferences
- Export data
- Get support

---

## 📱 Mobile Experience

### Screen Description
*See mockup: mobile_responsive_view.png*

Optimized mobile interface with bottom navigation.

### Visual Elements
- **Header:**
  - "Auto-Savings" title
  - Hamburger menu (☰)

- **Balance Cards (Stacked):**
  - Total Savings (full width)
  - Savings Balance (full width)
  - Spending Balance (full width)

- **Savings Rate Slider:**
  - Larger thumb for touch
  - Full width

- **Action Buttons (Row):**
  - [Deposit] [Withdraw] [Settings]
  - Full width, stacked on very small screens

- **Bottom Navigation:**
  - 🏠 Home
  - 📊 Transactions
  - 📈 Analytics
  - 👤 Profile

### Mobile-Specific Features
- Pull-to-refresh on dashboard
- Swipe gestures on transaction list
- Haptic feedback on interactions
- Full-screen modals
- Larger touch targets (min 44px)

---

## 🎉 Success States

### After Deposit
- ✅ Success toast: "Deposit successful! +1.00 SOL"
- 🎊 Confetti animation
- 📈 Balance cards animate to new values
- ➕ New transaction appears at top of list

### After Withdrawal
- ✅ Success toast: "Withdrawal successful! -0.50 SOL"
- 📉 Balance cards animate to new values
- ➕ New transaction appears at top of list

### After Rate Update
- ✅ Success toast: "Savings rate updated to 75%"
- 🎯 Slider moves to new position
- 📊 Preview bars update

---

## ❌ Error States

### Insufficient Funds
- ❌ Error toast: "Insufficient funds. You have 0.23 SOL available."
- 🔴 Input field shows red border
- 💡 Suggestion: "Try a smaller amount or deposit more SOL"

### Transaction Failed
- ❌ Error toast: "Transaction failed. Please try again."
- 🔄 "Retry" button appears
- 📋 "View Details" link to see error

### Network Issues
- ⚠️ Warning banner: "Connection lost. Reconnecting..."
- 🔄 Auto-retry with exponential backoff
- 📡 Manual "Reconnect" button

---

## 🔄 Loading States

### Initial Page Load
- Skeleton screens for balance cards
- Pulsing animation
- "Loading your vault..." text

### Transaction Processing
- Button shows spinner
- Text changes to "Processing..."
- Disable all inputs
- Show progress indicator

### Data Refresh
- Small spinner in header
- Subtle pulse on cards being updated
- No blocking overlay

---

## 🎯 Key User Journeys Summary

### Journey 1: First Deposit
```
Connect Wallet → Onboarding (set 50%) → Create Vault → 
Dashboard (empty) → Deposit Modal → Enter 1 SOL → 
Confirm → Success → Dashboard (updated)
```
**Time:** ~2 minutes  
**Transactions:** 2 (vault creation + deposit)  
**Cost:** ~0.006 SOL (rent + fees)

---

### Journey 2: Adjust & Deposit
```
Dashboard → Drag slider to 75% → Update Rate → Confirm → 
Deposit Modal → Enter 2 SOL → Confirm → Success
```
**Time:** ~1 minute  
**Transactions:** 2 (rate update + deposit)  
**Cost:** ~0.008 SOL (tx fees + platform fee)

---

### Journey 3: Withdraw Savings
```
Dashboard → Withdraw Button → Select Savings → 
Enter 0.5 SOL → Confirm → Success → Dashboard (updated)
```
**Time:** ~30 seconds  
**Transactions:** 1 (withdrawal)  
**Cost:** ~0.000005 SOL (tx fee only, no platform fee)

---

## 📊 User Flow Metrics

### Conversion Funnel
1. **Landing Page:** 100% (1000 visitors)
2. **Connect Wallet:** 60% (600 connected)
3. **Create Vault:** 80% (480 vaults created)
4. **First Deposit:** 70% (336 deposited)
5. **Second Deposit:** 40% (134 repeat users)

### Time to Value
- **Wallet to Vault:** 30 seconds
- **Vault to First Deposit:** 1 minute
- **Total Onboarding:** 2 minutes

### Engagement Metrics
- **Daily Active Users:** Track deposits/withdrawals
- **Average Savings Rate:** 52%
- **Average Balance:** 3.2 SOL
- **Retention (30-day):** 65%

---

**This complete user journey ensures a smooth, delightful experience from first visit to power user! 🚀**
