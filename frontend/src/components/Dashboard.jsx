import React, { useState } from 'react';
import BalanceCard from './BalanceCard';
import SavingsRateSlider from './SavingsRateSlider';
import TransactionList from './TransactionList';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

/**
 * Dashboard Component
 * Main dashboard interface matching dashboard_main_view.png
 */
export const Dashboard = ({
    vault,
    walletBalance = 0,
    onDeposit,
    onWithdraw,
    onUpdateSavingsRate,
    transactions = [],
    isInitialized = true,
    onCreateVault
}) => {
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [initRate, setInitRate] = useState(10); // Local state for uninitialized slider

    // Removed blocking loading state to allow "View Mode"

    // Use local state if not initialized
    const currentRate = isInitialized ? vault.savingsRate : initRate;

    const totalSavings = (vault.savingsBalance + vault.spendingBalance) / 1e9;
    const savingsBalance = vault.savingsBalance / 1e9;
    const spendingBalance = vault.spendingBalance / 1e9;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Activation Banner */}
                {!isInitialized && (
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-in">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Preview Mode</h2>
                            <p className="text-purple-200">Initialize your savings vault to start saving.</p>
                        </div>
                        <button
                            onClick={() => onCreateVault(currentRate)}
                            className="px-6 py-3 bg-white text-purple-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-900/20"
                        >
                            Activate Account
                        </button>
                    </div>
                )}
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">Auto-Savings</h1>
                    </div>
                </div>

                {/* Balance Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Total Savings - Large Card */}
                    <div className="md:col-span-3">
                        <BalanceCard
                            label="Total Savings"
                            value={totalSavings.toFixed(4)}
                            variant="primary"
                        />
                    </div>

                    {/* Savings Balance */}
                    <div className="md:col-span-1">
                        <BalanceCard
                            label="Savings Balance"
                            value={savingsBalance.toFixed(4)}
                            variant="savings"
                            icon="↗"
                        />
                    </div>

                    {/* Spending Balance */}
                    <div className="md:col-span-1">
                        <BalanceCard
                            label="Spending Balance"
                            value={spendingBalance.toFixed(4)}
                            variant="spending"
                            icon="↘"
                        />
                    </div>

                    {/* Wallet Balance */}
                    <div className="md:col-span-1">
                        <BalanceCard
                            label="Wallet Balance"
                            value={walletBalance.toFixed(4)}
                            variant="default"
                            icon="💰"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    <button
                        className={`btn-primary flex-1 ${!isInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => isInitialized && setShowDepositModal(true)}
                        disabled={!isInitialized}
                    >
                        Deposit
                    </button>
                    <button
                        className={`btn-secondary flex-1 ${!isInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => isInitialized && setShowWithdrawModal(true)}
                        disabled={!isInitialized}
                    >
                        Withdraw
                    </button>
                </div>

                {/* Savings Rate Slider */}
                <div className="mb-8">
                    <SavingsRateSlider
                        value={currentRate}
                        onUpdate={isInitialized ? onUpdateSavingsRate : setInitRate}
                    />
                </div>

                {/* Recent Transactions */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                    <TransactionList transactions={transactions} />
                </div>
            </div>

            {/* Modals */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                onDeposit={onDeposit}
                savingsRate={vault.savingsRate}
                maxBalance={walletBalance}
            />

            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onWithdraw={onWithdraw}
                savingsBalance={savingsBalance}
                spendingBalance={spendingBalance}
            />
        </div>
    );
};

export default Dashboard;
