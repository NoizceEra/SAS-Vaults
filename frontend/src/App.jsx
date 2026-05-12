import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAutoSavings } from './sdk/useAutoSavings';
import { Dashboard, LandingPage, DocsPage } from './components';
import './index.css';

function App() {
  const wallet = useWallet();
  const {
    vault,
    loading,
    initializing,
    activateUser,
    deposit,
    withdraw,
    refreshVault
  } = useAutoSavings();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showLanding, setShowLanding] = useState(!wallet.connected);
  const [showDocs, setShowDocs] = useState(false);

  // Auto-hide landing if already connected on load
  useEffect(() => {
    if (wallet.connected) {
      setShowLanding(false);
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
    const interval = setInterval(fetchBalance, 10000); 
    return () => clearInterval(interval);
  }, [wallet.publicKey, wallet.connection]);

  // Handle vault activation
  const handleActivate = async () => {
    try {
      await activateUser();
      await refreshVault();
    } catch (error) {
      console.error('Activation failed:', error);
    }
  };

  // Handle deposit
  const handleDeposit = async (amount) => {
    try {
      await deposit(amount);
      await refreshVault();

      setTransactions(prev => [{
        type: 'deposit',
        amount,
        timestamp: Date.now(),
        signature: null 
      }, ...prev]);
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
  };

  // Handle withdrawal
  const handleWithdraw = async (amount) => {
    try {
      await withdraw(amount);
      await refreshVault();

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

  if (showDocs) {
    return <DocsPage onBack={() => setShowDocs(false)} />;
  }

  if (showLanding) {
    return <LandingPage onLaunchApp={() => setShowLanding(false)} onReadDocs={() => setShowDocs(true)} />;
  }

  // Loading state
  if (initializing && wallet.connected) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-purple-500">SLICE</span>
          </div>
        </div>
      </div>
    );
  }

  // Wallet Connection Prompt (if they exited landing but didn't connect)
  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#141B3D] border border-white/10 rounded-[3rem] p-12 text-center shadow-3xl shadow-purple-500/10 animate-in">
           <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mx-auto mb-8">
              <span className="text-4xl font-black">S</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4 text-white">Connect Wallet</h1>
          <p className="text-slate-400 mb-10 font-medium leading-relaxed">
            Please connect your Solana wallet to access your secure savings vaults.
          </p>
          <div className="flex justify-center scale-110">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      vault={vault}
      isInitialized={!!vault}
      onCreateVault={handleActivate}
      walletBalance={walletBalance}
      onDeposit={handleDeposit}
      onWithdraw={handleWithdraw}
      transactions={transactions}
    />
  );
}

export default App;
