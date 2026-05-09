import React, { useState } from 'react';
import BalanceCard from './BalanceCard';
import TransactionList from './TransactionList';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

export const Dashboard = ({
    vault,
    walletBalance = 0,
    onDeposit,
    onWithdraw,
    transactions = [],
    isInitialized = true,
    onCreateVault
}) => {
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Minimalist Core only uses totalSaved
    const vaultBalance = vault?.totalSaved || 0;

    return (
        <div className="min-h-screen bg-[#0A0E27] text-white p-6 md:p-12 overflow-x-hidden">
            {/* Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-2xl font-black">S</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Vault Dashboard</h1>
                            <p className="text-slate-400 text-sm font-medium">SLICE Protocol v2.0 • Mainnet</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pl-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Wallet</span>
                            <span className="text-sm font-mono text-slate-300">Mainnet-Beta</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Activation State */}
                {!isInitialized && (
                    <div className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 animate-in">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-2">Protocol Inactive</h2>
                            <p className="text-slate-300">You need to activate your secure PDA vault to begin saving automatically.</p>
                        </div>
                        <button
                            onClick={() => onCreateVault()}
                            className="w-full md:w-auto px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-white/10 active:scale-95"
                        >
                            Activate Now
                        </button>
                    </div>
                )}

                {/* Main Balances */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-[2.5rem] p-10 shadow-3xl shadow-purple-900/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-4">Total Vault Balance</p>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-6xl font-black tracking-tighter">{vaultBalance.toFixed(4)}</h2>
                            <span className="text-2xl font-bold text-white/50">SOL</span>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <span className="text-xs font-bold text-white/80">0.4% Fee Tier</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#141B3D]/50 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Available in Wallet</p>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-5xl font-black tracking-tighter text-slate-200">{walletBalance.toFixed(4)}</h2>
                                <span className="text-xl font-bold text-slate-500">SOL</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => isInitialized && setShowDepositModal(true)}
                                disabled={!isInitialized}
                                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-30"
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => isInitialized && setShowWithdrawModal(true)}
                                disabled={!isInitialized}
                                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-30"
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-[#141B3D]/30 border border-white/5 backdrop-blur-md rounded-[2rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">Recent Activity</h2>
                        <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest">View All</button>
                    </div>
                    <TransactionList transactions={transactions} />
                </div>
            </div>

            {/* Modals */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                onDeposit={onDeposit}
                maxBalance={walletBalance}
            />

            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onWithdraw={onWithdraw}
                vaultBalance={vaultBalance}
            />
        </div>
    );
};

export default Dashboard;
