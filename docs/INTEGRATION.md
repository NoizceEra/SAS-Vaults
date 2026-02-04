# Solana Auto-Savings Protocol - Frontend Integration Guide

This guide shows you how to integrate the Auto-Savings Protocol into your React frontend.

## Installation

```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets
```

## Setup

### 1. Copy SDK Files

Copy the following files to your frontend project:
- `sdk/client.ts` - Main client SDK
- `sdk/useAutoSavings.tsx` - React hook
- `target/idl/auto_savings.json` - Program IDL
- `target/types/auto_savings.ts` - TypeScript types

### 2. Configure Wallet Adapter

```tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <YourApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### 3. Use the Hook

```tsx
import { useAutoSavings } from './sdk/useAutoSavings';

function SavingsComponent() {
  const {
    isInitialized,
    userConfig,
    vaultBalance,
    walletBalance,
    loading,
    initializeUser,
    deposit,
    withdraw,
    updateSavingsRate,
  } = useAutoSavings();

  if (!isInitialized) {
    return (
      <button onClick={() => initializeUser(10)} disabled={loading}>
        Initialize Auto-Savings (10% rate)
      </button>
    );
  }

  return (
    <div>
      <h2>Your Savings Vault</h2>
      <p>Savings Rate: {userConfig.savingsRate}%</p>
      <p>Vault Balance: {vaultBalance.toFixed(4)} SOL</p>
      <p>Wallet Balance: {walletBalance.toFixed(4)} SOL</p>
      
      <button onClick={() => deposit(1)} disabled={loading}>
        Deposit 1 SOL
      </button>
      
      <button onClick={() => withdraw(0.5)} disabled={loading}>
        Withdraw 0.5 SOL
      </button>
    </div>
  );
}
```

## API Reference

### useAutoSavings Hook

#### State

- `isInitialized: boolean` - Whether user account is initialized
- `userConfig: UserConfig | null` - User configuration data
- `vaultBalance: number` - Current vault balance in SOL
- `walletBalance: number` - Current wallet balance in SOL
- `loading: boolean` - Loading state for operations
- `isConnected: boolean` - Wallet connection status

#### Methods

##### `initializeUser(savingsRate: number): Promise<string>`
Initialize a new user account with a savings rate (1-90%).

```tsx
const signature = await initializeUser(10); // 10% savings rate
```

##### `updateSavingsRate(newRate: number): Promise<string>`
Update the user's savings rate.

```tsx
const signature = await updateSavingsRate(15); // Change to 15%
```

##### `deposit(amount: number): Promise<string>`
Manually deposit SOL to the vault.

```tsx
const signature = await deposit(1.5); // Deposit 1.5 SOL
```

##### `withdraw(amount: number): Promise<string>`
Withdraw SOL from the vault.

```tsx
const signature = await withdraw(0.5); // Withdraw 0.5 SOL
```

##### `processTransfer(transferAmount: number): Promise<string>`
Process a transfer with automatic savings.

```tsx
const signature = await processTransfer(10); // Transfer 10 SOL, auto-save based on rate
```

##### `calculateSavings(transferAmount: number): number`
Calculate how much will be saved for a given transfer.

```tsx
const savingsAmount = calculateSavings(10); // Calculate savings for 10 SOL transfer
```

##### `refresh(): Promise<void>`
Manually refresh user data.

```tsx
await refresh();
```

### AutoSavingsClient Class

For more control, use the client directly:

```tsx
import { AutoSavingsClient } from './sdk/client';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));
const client = new AutoSavingsClient(connection, wallet);

// Initialize user
await client.initializeUser(10);

// Get user config
const config = await client.getUserConfig();

// Get vault balance
const balance = await client.getVaultBalance();

// Deposit
await client.deposit(1.5);

// Withdraw
await client.withdraw(0.5);
```

## Integration with Existing Frontend

### Updating Your App.jsx

Replace the mock data in your existing `App.jsx` with real blockchain data:

```tsx
import { useAutoSavings } from './sdk/useAutoSavings';

const App = () => {
  const {
    isInitialized,
    userConfig,
    vaultBalance,
    walletBalance,
    loading,
    initializeUser,
    deposit,
    withdraw,
    updateSavingsRate,
  } = useAutoSavings();

  // Replace mock state with real data
  const [savingsRate, setSavingsRate] = useState(userConfig?.savingsRate || 10);

  // Handle rate change
  const handleApplyChanges = async () => {
    if (savingsRate !== userConfig?.savingsRate) {
      await updateSavingsRate(savingsRate);
    }
  };

  // Handle deposit
  const handleDeposit = async (amount) => {
    await deposit(amount);
  };

  // Handle withdraw
  const handleWithdraw = async (amount) => {
    await withdraw(amount);
  };

  // Replace mockStats with real data
  const stats = {
    userBalance: walletBalance,
    userSaved: vaultBalance,
    totalSaved: userConfig?.totalSaved || 0,
    totalWithdrawn: userConfig?.totalWithdrawn || 0,
    transactionCount: userConfig?.transactionCount || 0,
  };

  // Rest of your component...
};
```

## Example: Complete Integration

```tsx
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAutoSavings } from './sdk/useAutoSavings';

function AutoSavingsApp() {
  const { connected } = useWallet();
  const {
    isInitialized,
    userConfig,
    vaultBalance,
    walletBalance,
    loading,
    initializeUser,
    deposit,
    withdraw,
    updateSavingsRate,
    calculateSavings,
  } = useAutoSavings();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newRate, setNewRate] = useState(10);

  if (!connected) {
    return (
      <div>
        <h1>Connect Your Wallet</h1>
        <WalletMultiButton />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div>
        <h1>Initialize Auto-Savings</h1>
        <input
          type="number"
          min="1"
          max="90"
          value={newRate}
          onChange={(e) => setNewRate(parseInt(e.target.value))}
        />
        <button onClick={() => initializeUser(newRate)} disabled={loading}>
          {loading ? 'Initializing...' : 'Initialize'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Auto-Savings Protocol</h1>
      
      <div>
        <h2>Your Stats</h2>
        <p>Savings Rate: {userConfig.savingsRate}%</p>
        <p>Vault Balance: {vaultBalance.toFixed(4)} SOL</p>
        <p>Wallet Balance: {walletBalance.toFixed(4)} SOL</p>
        <p>Total Saved: {userConfig.totalSaved.toFixed(4)} SOL</p>
        <p>Total Withdrawn: {userConfig.totalWithdrawn.toFixed(4)} SOL</p>
        <p>Transactions: {userConfig.transactionCount}</p>
      </div>

      <div>
        <h2>Update Savings Rate</h2>
        <input
          type="number"
          min="1"
          max="90"
          value={newRate}
          onChange={(e) => setNewRate(parseInt(e.target.value))}
        />
        <button onClick={() => updateSavingsRate(newRate)} disabled={loading}>
          Update Rate
        </button>
      </div>

      <div>
        <h2>Deposit</h2>
        <input
          type="number"
          step="0.01"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount in SOL"
        />
        <button
          onClick={() => deposit(parseFloat(depositAmount))}
          disabled={loading || !depositAmount}
        >
          Deposit
        </button>
      </div>

      <div>
        <h2>Withdraw</h2>
        <input
          type="number"
          step="0.01"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount in SOL"
        />
        <button
          onClick={() => withdraw(parseFloat(withdrawAmount))}
          disabled={loading || !withdrawAmount}
        >
          Withdraw
        </button>
      </div>

      <div>
        <h2>Savings Calculator</h2>
        <p>
          If you transfer 10 SOL, you'll save:{' '}
          {calculateSavings(10).toFixed(4)} SOL
        </p>
      </div>
    </div>
  );
}

export default AutoSavingsApp;
```

## Error Handling

```tsx
const handleDeposit = async (amount) => {
  try {
    const signature = await deposit(amount);
    console.log('Success!', signature);
    // Show success message to user
  } catch (error) {
    console.error('Deposit failed:', error);
    // Show error message to user
    if (error.message.includes('InsufficientFunds')) {
      alert('Insufficient funds in wallet');
    } else if (error.message.includes('InvalidAmount')) {
      alert('Invalid amount');
    } else {
      alert('Transaction failed. Please try again.');
    }
  }
};
```

## Transaction Confirmation

```tsx
import { useConnection } from '@solana/wallet-adapter-react';

const { connection } = useConnection();

const handleDepositWithConfirmation = async (amount) => {
  const signature = await deposit(amount);
  
  // Wait for confirmation
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  if (confirmation.value.err) {
    console.error('Transaction failed');
  } else {
    console.log('Transaction confirmed!');
  }
};
```

## Best Practices

1. **Always handle errors** - Blockchain transactions can fail
2. **Show loading states** - Transactions take time
3. **Confirm transactions** - Wait for blockchain confirmation
4. **Validate inputs** - Check amounts before sending
5. **Update UI after transactions** - Refresh balances
6. **Use the hook** - It handles most complexity for you
7. **Test on devnet first** - Never test with real money

## Troubleshooting

### "User not initialized" error
Call `initializeUser()` first.

### "Insufficient funds" error
User doesn't have enough SOL in their wallet.

### Transaction fails silently
Check the browser console for detailed error messages.

### Balances not updating
Call `refresh()` to manually update data.

## Next Steps

1. Integrate wallet adapter
2. Replace mock data with real blockchain data
3. Add error handling and loading states
4. Test on devnet thoroughly
5. Add transaction history tracking
6. Implement notifications for successful transactions
