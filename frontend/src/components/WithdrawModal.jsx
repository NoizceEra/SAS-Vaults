import React, { useState } from 'react';

/**
 * WithdrawModal Component
 * Modal for withdrawing SOL from savings or spending
 * Includes tab selector for source account
 */
export const WithdrawModal = ({
    isOpen,
    onClose,
    onWithdraw,
    savingsBalance = 0,
    spendingBalance = 0
}) => {
    const [amount, setAmount] = useState('');
    const [fromSavings, setFromSavings] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const withdrawAmount = parseFloat(amount) || 0;
    const availableBalance = fromSavings ? savingsBalance : spendingBalance;
    const remainingBalance = availableBalance - withdrawAmount;

    const handleWithdrawAll = () => {
        setAmount(availableBalance.toFixed(4));
    };

    const handleWithdraw = async () => {
        if (withdrawAmount <= 0 || withdrawAmount > availableBalance) return;

        setIsProcessing(true);
        try {
            await onWithdraw(withdrawAmount, fromSavings);
            setAmount('');
            onClose();
        } catch (error) {
            console.error('Withdrawal failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Withdraw SOL</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Source Selector Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${fromSavings
                                    ? 'bg-green-500/20 border-2 border-green-500 text-green-500'
                                    : 'bg-white/5 border border-white/10 text-secondary hover:bg-white/10'
                                }`}
                            onClick={() => setFromSavings(true)}
                        >
                            Savings
                        </button>
                        <button
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${!fromSavings
                                    ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-500'
                                    : 'bg-white/5 border border-white/10 text-secondary hover:bg-white/10'
                                }`}
                            onClick={() => setFromSavings(false)}
                        >
                            Spending
                        </button>
                    </div>

                    <div className="text-sm text-secondary mb-4">
                        Available: <span className="font-bold text-white">{availableBalance.toFixed(4)} SOL</span>
                    </div>

                    {/* Amount Input */}
                    <div className="input-group">
                        <label>Amount</label>
                        <div className="input-wrapper">
                            <span className="text-2xl mr-2">◎</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                step="0.01"
                                min="0"
                                max={availableBalance}
                            />
                            <span className="input-suffix">SOL</span>
                            <button className="input-action" onClick={handleWithdrawAll}>
                                ALL
                            </button>
                        </div>
                        <div className="input-hint">No withdrawal fees</div>
                    </div>

                    {/* Summary */}
                    {withdrawAmount > 0 && withdrawAmount <= availableBalance && (
                        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary">You'll receive:</span>
                                <span className="font-bold text-lg">{withdrawAmount.toFixed(4)} SOL</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary">
                                    Remaining in {fromSavings ? 'savings' : 'spending'}:
                                </span>
                                <span className="font-semibold">{remainingBalance.toFixed(4)} SOL</span>
                            </div>
                        </div>
                    )}

                    {withdrawAmount > availableBalance && (
                        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            Insufficient funds. You have {availableBalance.toFixed(4)} SOL available.
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleWithdraw}
                        disabled={isProcessing || withdrawAmount <= 0 || withdrawAmount > availableBalance}
                    >
                        {isProcessing ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            'Confirm Withdrawal'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;
