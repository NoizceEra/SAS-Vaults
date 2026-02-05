import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAutoSavings } from './sdk/useAutoSavings';
import { OnboardingScreen, Dashboard, DemoModeBanner, SwapInterface, TokenVaultDashboard, LandingPage } from './components';
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
    initializing,
    initializeVault,
    deposit,
    withdraw,
    updateSavingsRate,
    refreshVault
  } = useAutoSavings();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('vaults'); // 'vaults' or 'swap'
  const [showLanding, setShowLanding] = useState(!wallet.connected); // Show landing if not connected

  // Handle wallet connection changes
  useEffect(() => {
    if (wallet.connected) {
      // Optional: Auto-redirect if connected? 
      // For now, let's keep the user in control or respect the initial state.
      // Actually, setting showLanding(false) here might be jarring if they just connected.
      // Let's rely on the "Launch App" button for explicit entry.
      // But if they are *already* connected on load, the initial state (!wallet.connected) handles it.
    }
  }, [wallet.connected]);

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

  // Show loading state only during initial data fetch
  if (showLanding) {
    return <LandingPage onLaunchApp={() => setShowLanding(false)} />;
  }

  if (initializing && wallet.connected) {
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
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <img src="/logo.png" alt="Slice Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Slice
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
    return <OnboardingScreen onCreateVault={handleCreateVault} walletBalance={walletBalance} />;
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

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('vaults')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'vaults'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              <span>Savings Vaults</span>
            </div>
            {activeTab === 'vaults' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'swap'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Token Swap</span>
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">New</span>
            </div>
            {activeTab === 'swap' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Conditional based on active tab */}
      {activeTab === 'vaults' ? (
        <Dashboard
          vault={vault}
          walletBalance={walletBalance}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onUpdateSavingsRate={handleUpdateSavingsRate}
          transactions={transactions}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Token Vaults Overview */}
          <div className="mb-8">
            <TokenVaultDashboard />
          </div>

          {/* Swap Interface */}
          <div className="mt-8">
            <SwapInterface />
          </div>
        </div>
      )}

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
