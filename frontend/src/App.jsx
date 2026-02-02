import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAutoSavings } from './sdk/useAutoSavings';
import { OnboardingScreen, Dashboard, DemoModeBanner } from './components';
import './index.css';

/**
 * Main App Component
 * Implements the complete UI/UX flow from the mockups
 */
function App() {
  const wallet = useWallet();
  const {
    vault,
    loading,
    initializeVault,
    deposit,
    withdraw,
    updateSavingsRate,
    refreshVault
  } = useAutoSavings();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.publicKey && wallet.connection) {
        try {
          const balance = await wallet.connection.getBalance(wallet.publicKey);
          setWalletBalance(balance / 1e9);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [wallet.publicKey, wallet.connection]);

  // Handle vault creation
  const handleCreateVault = async (savingsRate) => {
    try {
      await initializeVault(savingsRate);
      await refreshVault();
    } catch (error) {
      console.error('Vault creation failed:', error);
      throw error;
    }
  };

  // Handle deposit
  const handleDeposit = async (amount) => {
    try {
      await deposit(amount);
      await refreshVault();

      // Add transaction to local state
      setTransactions(prev => [{
        type: 'deposit',
        amount,
        timestamp: Date.now(),
        signature: null // Will be populated by actual transaction
      }, ...prev]);
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
  };

  // Handle withdrawal
  const handleWithdraw = async (amount, fromSavings) => {
    try {
      await withdraw(amount, fromSavings);
      await refreshVault();

      // Add transaction to local state
      setTransactions(prev => [{
        type: 'withdrawal',
        amount,
        timestamp: Date.now(),
        signature: null
      }, ...prev]);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    }
  };

  // Handle savings rate update
  const handleUpdateSavingsRate = async (newRate) => {
    try {
      await updateSavingsRate(newRate);
      await refreshVault();
    } catch (error) {
      console.error('Rate update failed:', error);
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show wallet connection prompt
  if (!wallet.connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-in">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Solana Auto-Savings
          </h1>
          <p className="text-secondary mb-8 text-lg">
            Save automatically with every transaction
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <div>
                <div className="font-semibold">Automatic Savings</div>
                <div className="text-sm text-tertiary">Set it and forget it</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-xl">🔒</span>
              </div>
              <div>
                <div className="font-semibold">Non-Custodial</div>
                <div className="text-sm text-tertiary">You always control your funds</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-500 text-xl">⚡</span>
              </div>
              <div>
                <div className="font-semibold">Low Fees</div>
                <div className="text-sm text-tertiary">Only 0.4% platform fee</div>
              </div>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex justify-center">
            <WalletMultiButton className="btn-primary" />
          </div>

          <p className="text-xs text-tertiary mt-4">
            Powered by Solana
          </p>
        </div>
      </div>
    );
  }

  // Show onboarding if no vault exists
  if (!vault) {
    return <OnboardingScreen onCreateVault={handleCreateVault} />;
  }

  // Show main dashboard
  return (
    <>
      {/* Header */}
      <header className="border-b border-white/10 bg-primary/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Auto-Savings</h1>
              <p className="text-xs text-tertiary">Solana Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm">
              <span className="text-secondary">Wallet: </span>
              <span className="font-mono font-semibold">
                {wallet.publicKey?.toString().slice(0, 4)}...
                {wallet.publicKey?.toString().slice(-4)}
              </span>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <DemoModeBanner />

      {/* Main Dashboard */}
      <Dashboard
        vault={vault}
        walletBalance={walletBalance}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onUpdateSavingsRate={handleUpdateSavingsRate}
        transactions={transactions}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-tertiary">
          <p>Solana Auto-Savings Protocol v1.0.0</p>
          <p className="mt-2">
            <a href="#" className="hover:text-purple-500 transition-colors">Documentation</a>
            {' • '}
            <a href="#" className="hover:text-purple-500 transition-colors">GitHub</a>
            {' • '}
            <a href="#" className="hover:text-purple-500 transition-colors">Discord</a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
