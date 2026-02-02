# 🎨 Frontend Components - Solana Auto-Savings Protocol

## 📋 Overview

This directory contains all the React components for the Solana Auto-Savings Protocol frontend, designed to match the premium UI/UX mockups in `marketing_assets/ui_mockups/`.

## 🏗️ Component Architecture

```
src/
├── components/
│   ├── BalanceCard.jsx          # Balance display cards
│   ├── SavingsRateSlider.jsx    # Interactive savings rate control
│   ├── DepositModal.jsx         # Deposit interface with split preview
│   ├── WithdrawModal.jsx        # Withdrawal interface
│   ├── TransactionList.jsx      # Transaction history display
│   ├── OnboardingScreen.jsx     # First-time user setup
│   ├── Dashboard.jsx            # Main dashboard container
│   └── index.js                 # Component exports
├── App.jsx                      # Main application component
├── index.css                    # Design system & global styles
└── main.jsx                     # Application entry point
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-purple: #8B5CF6
--primary-blue: #3B82F6

/* Backgrounds */
--bg-primary: #0A0E27      /* Deep navy */
--bg-secondary: #141B3D    /* Card backgrounds */
--bg-tertiary: #1E2749     /* Elevated elements */

/* Semantic Colors */
--success-green: #10B981   /* Savings, positive */
--info-blue: #3B82F6       /* Spending, neutral */
--error-red: #EF4444       /* Errors, withdrawals */
```

### Typography

- **Font Family:** Inter (Google Fonts)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 📦 Component Reference

### 1. **BalanceCard**

Displays SOL balances with glassmorphism effect.

**Props:**
```typescript
{
  label: string;          // Card title (e.g., "Total Savings")
  value: string | number; // Balance amount
  change?: number;        // Optional change indicator
  variant?: 'primary' | 'savings' | 'spending' | 'default';
  icon?: string;          // Optional emoji/icon
}
```

**Usage:**
```jsx
<BalanceCard
  label="Total Savings"
  value="2.45"
  variant="primary"
/>
```

**Variants:**
- `primary` - Large card with purple gradient glow
- `savings` - Green left border and green glow on hover
- `spending` - Blue left border and blue glow on hover
- `default` - Standard glassmorphism card

---

### 2. **SavingsRateSlider**

Interactive slider for adjusting savings rate (0-100%).

**Props:**
```typescript
{
  value: number;                    // Current savings rate (0-100)
  onChange?: (value: number) => void;  // Callback on slider change
  onUpdate?: (value: number) => void;  // Callback on update button click
}
```

**Usage:**
```jsx
<SavingsRateSlider
  value={50}
  onUpdate={(newRate) => updateSavingsRate(newRate)}
/>
```

**Features:**
- Gradient-filled slider track
- Visual split preview (savings vs spending bars)
- "Update to X%" button appears when value changes
- Smooth animations

---

### 3. **DepositModal**

Modal for depositing SOL with automatic split preview.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
  savingsRate: number;     // Current savings rate (0-100)
  maxBalance: number;      // Wallet balance for MAX button
}
```

**Usage:**
```jsx
<DepositModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onDeposit={handleDeposit}
  savingsRate={50}
  maxBalance={5.23}
/>
```

**Features:**
- Real-time fee calculation (0.4%)
- Automatic split preview (savings/spending)
- MAX button for full balance
- Input validation
- Loading state during processing

---

### 4. **WithdrawModal**

Modal for withdrawing SOL from savings or spending.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, fromSavings: boolean) => Promise<void>;
  savingsBalance: number;
  spendingBalance: number;
}
```

**Usage:**
```jsx
<WithdrawModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onWithdraw={handleWithdraw}
  savingsBalance={1.47}
  spendingBalance={0.98}
/>
```

**Features:**
- Tab selector for savings/spending
- ALL button for full withdrawal
- Real-time balance calculations
- Insufficient funds validation
- No withdrawal fees message

---

### 5. **TransactionList**

Displays recent transactions with icons and amounts.

**Props:**
```typescript
{
  transactions: Array<{
    type: 'deposit' | 'withdrawal' | 'auto-save';
    amount: number;
    timestamp: number;
    signature?: string;
  }>;
}
```

**Usage:**
```jsx
<TransactionList
  transactions={[
    {
      type: 'deposit',
      amount: 0.5,
      timestamp: Date.now(),
      signature: 'abc123...'
    }
  ]}
/>
```

**Features:**
- Colored icons for transaction types
- Formatted dates
- Links to Solana Explorer
- Empty state with helpful message
- Hover effects

---

### 6. **OnboardingScreen**

First-time user setup for savings rate.

**Props:**
```typescript
{
  onCreateVault: (savingsRate: number) => Promise<void>;
}
```

**Usage:**
```jsx
<OnboardingScreen
  onCreateVault={handleCreateVault}
/>
```

**Features:**
- Circular percentage selector with gradient ring
- Interactive slider (0-100%)
- Visual split preview bars
- Example calculation for 1 SOL
- Platform fee disclosure
- Animated entrance

---

### 7. **Dashboard**

Main dashboard container integrating all components.

**Props:**
```typescript
{
  vault: {
    savingsBalance: number;   // In lamports
    spendingBalance: number;  // In lamports
    savingsRate: number;      // 0-100
  };
  walletBalance: number;      // In SOL
  onDeposit: (amount: number) => Promise<void>;
  onWithdraw: (amount: number, fromSavings: boolean) => Promise<void>;
  onUpdateSavingsRate: (newRate: number) => Promise<void>;
  transactions: Transaction[];
}
```

**Usage:**
```jsx
<Dashboard
  vault={vault}
  walletBalance={5.23}
  onDeposit={handleDeposit}
  onWithdraw={handleWithdraw}
  onUpdateSavingsRate={handleUpdateRate}
  transactions={transactions}
/>
```

**Layout:**
- Balance cards grid (responsive)
- Action buttons (Deposit/Withdraw)
- Savings rate slider
- Recent transactions list
- Modal management

---

## 🎬 User Flow

### 1. **First Visit (No Wallet)**
```
Landing Page
  ↓
Connect Wallet Button
  ↓
Wallet Selection
```

### 2. **First Visit (Wallet Connected, No Vault)**
```
Onboarding Screen
  ↓
Set Savings Rate (default 50%)
  ↓
Create Vault Button
  ↓
Transaction Approval
  ↓
Dashboard (Empty State)
```

### 3. **Returning User**
```
Dashboard (Active State)
  ↓
View Balances
  ↓
Deposit / Withdraw / Adjust Rate
```

---

## 🎨 CSS Classes Reference

### Balance Cards
```css
.balance-card              /* Base glassmorphism card */
.balance-card-primary      /* Purple gradient variant */
.balance-card-savings      /* Green accent variant */
.balance-card-spending     /* Blue accent variant */
.card-label                /* Card title */
.card-value                /* Large balance number */
.card-change               /* Change indicator */
```

### Buttons
```css
.btn-primary               /* Gradient purple-blue button */
.btn-secondary             /* Outlined button */
.btn-icon                  /* Icon-only button */
```

### Modals
```css
.modal-backdrop            /* Dark overlay with blur */
.modal-card                /* Modal container */
.modal-header              /* Modal title area */
.modal-body                /* Modal content */
.modal-footer              /* Modal actions */
.close-btn                 /* X close button */
```

### Inputs
```css
.input-group               /* Input container */
.input-wrapper             /* Input with decorations */
.input-suffix              /* "SOL" suffix */
.input-action              /* MAX/ALL buttons */
.input-hint                /* Helper text */
```

### Transactions
```css
.transaction-list          /* List container */
.transaction-item          /* Individual transaction */
.tx-icon                   /* Circular icon */
.tx-icon-deposit           /* Green deposit icon */
.tx-icon-withdrawal        /* Red withdrawal icon */
.tx-icon-auto-save         /* Purple auto-save icon */
.tx-details                /* Transaction info */
.tx-amount                 /* Amount display */
.tx-view                   /* View button */
```

### Animations
```css
.animate-in                /* Scale in animation */
.animate-slide-up          /* Slide up animation */
.animate-pulse             /* Pulse animation */
.animate-shimmer           /* Shimmer effect */
.animate-balance-update    /* Balance change animation */
```

---

## 🚀 Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Stacked layout */
  /* Larger touch targets */
  /* Reduced padding */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 2-column grid */
}

/* Desktop */
@media (min-width: 1025px) {
  /* 3-column layout */
  /* Side navigation */
}
```

### Mobile Optimizations

- Touch targets: Minimum 44x44px
- Font sizes: Increased by 10%
- Modals: Full-screen on mobile
- Navigation: Bottom tab bar
- Inputs: Large, easy-to-tap

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast:** Minimum 4.5:1 ratio
- **Keyboard Navigation:** All actions accessible via keyboard
- **Screen Readers:** Semantic HTML and ARIA labels
- **Motion:** Respects `prefers-reduced-motion`
- **Focus States:** Visible purple glow ring

---

## 🎯 Best Practices

### Component Guidelines

1. **Keep components focused** - Single responsibility
2. **Use CSS classes** - Avoid inline styles
3. **Handle loading states** - Show spinners/skeletons
4. **Validate inputs** - Client-side validation
5. **Error handling** - User-friendly error messages
6. **Accessibility** - Keyboard navigation, ARIA labels

### Performance

1. **Lazy loading** - Load components on demand
2. **Memoization** - Cache expensive calculations
3. **Debouncing** - Limit slider update frequency
4. **Virtual scrolling** - For long transaction lists

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Styles not applying
- **Solution:** Ensure `index.css` is imported in `main.jsx`

**Issue:** Modals not closing
- **Solution:** Check `onClick` propagation with `stopPropagation()`

**Issue:** Slider not updating
- **Solution:** Verify `onChange` and `onUpdate` callbacks

**Issue:** Wallet not connecting
- **Solution:** Check wallet adapter configuration in `main.jsx`

---

## 📚 Additional Resources

- [UI/UX Documentation](../UI_UX_DOCUMENTATION.md)
- [Smart Contract Documentation](../SMART_CONTRACT_DOCUMENTATION.md)
- [User Journey](../USER_JOURNEY.md)
- [Deployment Checklist](../SOLANA_DEPLOYMENT_CHECKLIST.md)

---

## 🎉 Credits

Design inspired by modern fintech applications and Web3 aesthetics.

Built with:
- React 18
- Tailwind CSS
- Solana Web3.js
- Anchor Framework

---

**Last Updated:** 2026-02-01  
**Version:** 1.0.0
