# 🎨 Frontend Guide - Solana Auto-Savings Protocol

**Last Updated:** February 4, 2026  
**Framework:** React 18 + Vite + TailwindCSS

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Components](#components)
6. [Hooks & SDK](#hooks--sdk)
7. [Styling](#styling)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The frontend is a modern React application that provides a user-friendly interface for the Solana Auto-Savings Protocol. It features:

- **Wallet Integration** - Phantom, Solflare, and other Solana wallets
- **Real-time Updates** - Live balance tracking and transaction monitoring
- **Responsive Design** - Mobile-first, works on all devices
- **Swap Interface** - Token swap UI (Phase 1)
- **Dashboard Analytics** - Savings visualization and statistics

### Tech Stack
- **React** 18.3.1 - UI framework
- **Vite** 5.4.0 - Build tool and dev server
- **Solana Wallet Adapter** - Wallet connection
- **Anchor Client** - Smart contract interaction
- **TailwindCSS** 3.4.1 - Styling
- **Recharts** 2.6.2 - Charts and analytics
- **Lucide React** - Icons

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Solana wallet browser extension (Phantom recommended)

### Installation Steps

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/           # React components
│   │   ├── AutoSwapConfig.jsx
│   │   ├── BalanceCard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DemoModeBanner.jsx
│   │   ├── DepositModal.jsx
│   │   ├── OnboardingScreen.jsx
│   │   ├── SavingsRateSlider.jsx
│   │   ├── SwapInterface.jsx
│   │   ├── TokenVaultDashboard.jsx
│   │   ├── TransactionList.jsx
│   │   ├── WithdrawModal.jsx
│   │   └── index.js
│   │
│   ├── sdk/                  # Solana integration
│   │   ├── client.jsx        # Anchor client wrapper
│   │   └── useAutoSavings.jsx # React hook for protocol
│   │
│   ├── idl/                  # Program IDL
│   │   └── auto_savings.json
│   │
│   ├── config/               # Configuration
│   │   └── solana.js         # Network & Program ID
│   │
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── postcss.config.js         # PostCSS configuration
```

---

## ⚙️ Configuration

### Environment Variables

**File:** `frontend/.env.local`

```env
# Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Program ID (update after deployment)
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE

# Optional: Custom RPC
# NEXT_PUBLIC_RPC_ENDPOINT=https://your-custom-rpc.com
```

### Solana Configuration

**File:** `frontend/src/config/solana.js`

```javascript
import { PublicKey, clusterApiUrl } from '@solana/web3.js';

// Network configuration
export const NETWORK = import.meta.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = import.meta.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(NETWORK);

// Program ID (update after deployment)
export const PROGRAM_ID = new PublicKey(
  import.meta.env.NEXT_PUBLIC_PROGRAM_ID || 'YOUR_PROGRAM_ID_HERE'
);

// Supported tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
  },
  // Add more tokens as needed
];
```

### Update IDL After Deployment

```bash
# Copy latest IDL from program
cp ../target/idl/auto_savings.json src/idl/

# Verify
cat src/idl/auto_savings.json | grep "version"
```

---

## 🧩 Components

### Core Components

#### `App.jsx`
Main application component that handles:
- Wallet connection state
- User initialization flow
- Routing between onboarding and dashboard
- Global state management

#### `Dashboard.jsx`
Main dashboard view showing:
- Balance cards (Total, Savings, Spending, Wallet)
- Action buttons (Deposit, Withdraw)
- Savings rate slider
- Recent transactions
- Modals for deposit/withdraw

#### `OnboardingScreen.jsx`
First-time user experience:
- Vault creation wizard
- Savings rate selection
- Educational content
- Wallet balance check

### Swap Components (Phase 1)

#### `SwapInterface.jsx`
Token swap interface featuring:
- Token selection dropdowns
- Amount input with validation
- Slippage settings
- Estimated output calculation
- Swap execution

**Usage:**
```jsx
import SwapInterface from './components/SwapInterface';

<SwapInterface 
  program={program}
  userConfig={userConfig}
/>
```

#### `TokenVaultDashboard.jsx`
Token vault management:
- Multi-token balance display
- Vault creation
- Withdrawal interface
- Portfolio value tracking

#### `AutoSwapConfig.jsx`
Auto-swap configuration:
- Enable/disable toggle
- Target token selection
- Minimum threshold setting
- Configuration save

### UI Components

#### `BalanceCard.jsx`
Reusable balance display card with variants:
- Primary (total savings)
- Savings (locked balance)
- Spending (available balance)
- Default (wallet balance)

#### `DepositModal.jsx`
Deposit interface modal:
- Amount input
- Balance validation
- Savings split preview
- Transaction confirmation

#### `WithdrawModal.jsx`
Withdrawal interface modal:
- Source selection (savings/spending)
- Amount input with max button
- Fee calculation
- Transaction execution

#### `SavingsRateSlider.jsx`
Interactive savings rate control:
- Visual slider (1-90%)
- Percentage display
- Real-time preview
- Update confirmation

---

## 🔌 Hooks & SDK

### `useAutoSavings` Hook

Main React hook for protocol interaction:

```javascript
import { useAutoSavings } from './sdk/useAutoSavings';

function MyComponent() {
  const {
    // State
    vault,
    userConfig,
    loading,
    isInitialized,
    
    // Actions
    initializeVault,
    deposit,
    withdraw,
    updateSavingsRate,
    refreshVault,
  } = useAutoSavings();
  
  // Use the hook data and functions
}
```

**Available Properties:**
- `vault` - User vault data (balances, rates)
- `userConfig` - On-chain user configuration
- `loading` - Loading state
- `initializing` - Initial data fetch state
- `isInitialized` - Whether user has a vault

**Available Methods:**
- `initializeVault(savingsRate)` - Create user vault
- `deposit(amount)` - Deposit SOL to vault
- `withdraw(amount, fromSavings)` - Withdraw from vault
- `updateSavingsRate(newRate)` - Update savings percentage
- `refreshVault()` - Reload vault data

### `AutoSavingsClient` Class

Low-level client for direct program interaction:

```javascript
import { AutoSavingsClient } from './sdk/client';

const client = new AutoSavingsClient(connection, wallet);

// Initialize user
await client.initializeUser(50); // 50% savings rate

// Deposit
await client.deposit(1000000000); // 1 SOL in lamports

// Withdraw
await client.withdraw(500000000); // 0.5 SOL

// Get user config
const config = await client.getUserConfig();
```

---

## 🎨 Styling

### TailwindCSS Configuration

**File:** `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        highlight: '#533483',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

### Global Styles

**File:** `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gradient-to-br from-primary via-secondary to-accent;
    @apply text-white min-h-screen;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-to-r from-purple-500 to-blue-500;
    @apply hover:from-purple-600 hover:to-blue-600;
    @apply text-white font-bold py-3 px-6 rounded-lg;
    @apply transition-all duration-300;
    @apply shadow-lg hover:shadow-xl;
  }
  
  .btn-secondary {
    @apply bg-white/10 hover:bg-white/20;
    @apply text-white font-bold py-3 px-6 rounded-lg;
    @apply transition-all duration-300;
    @apply border border-white/20;
  }
  
  .card {
    @apply bg-white/5 backdrop-blur-lg;
    @apply border border-white/10 rounded-2xl;
    @apply p-6 shadow-xl;
  }
}
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build the app
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

#### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option 2: GitHub Integration
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

---

## 🐛 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Wallet connection fails
```javascript
// Check wallet adapter configuration in main.jsx
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const wallets = [
  new PhantomWalletAdapter(),
  // Add other wallet adapters
];
```

#### "Program not found" error
- Verify `NEXT_PUBLIC_PROGRAM_ID` in `.env.local`
- Ensure program is deployed to the correct network
- Check IDL is up to date

#### Styles not loading
```bash
# Rebuild Tailwind
npm run build

# Or restart dev server
npm run dev
```

#### Transaction fails
- Check wallet has sufficient SOL
- Verify network configuration matches deployed program
- Check browser console for detailed errors

### Development Tips

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check for TypeScript errors (if using TS)
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📊 Performance Optimization

### Code Splitting
```javascript
// Lazy load components
import { lazy, Suspense } from 'react';

const SwapInterface = lazy(() => import('./components/SwapInterface'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SwapInterface />
    </Suspense>
  );
}
```

### Optimize Bundle Size
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react'],
        },
      },
    },
  },
};
```

---

## 🔗 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Anchor Client Guide](https://www.anchor-lang.com/docs/clients)

---

**Happy Building! 🎨**
