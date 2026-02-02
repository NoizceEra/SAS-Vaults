import React, { useState } from 'react';

/**
 * DepositModal Component
 * Modal for depositing SOL with automatic split preview
 * Matches the design from deposit_modal_view.png
 */
export const DepositModal = ({
    isOpen,
    onClose,
    onDeposit,
    savingsRate = 50,
    maxBalance = 0
}) => {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    // Calculate fee and split
    const depositAmount = parseFloat(amount) || 0;
    const platformFee = depositAmount * 0.004; // 0.4%
    const remaining = depositAmount - platformFee;
    const savingsAmount = remaining * (savingsRate / 100);
    const spendingAmount = remaining - savingsAmount;
    const totalReceived = remaining;

    const handleMaxClick = () => {
        setAmount(maxBalance.toFixed(4));
    };

    const handleDeposit = async () => {
        if (depositAmount <= 0 || depositAmount > maxBalance) return;

        setIsProcessing(true);
        try {
            await onDeposit(depositAmount);
            setAmount('');
            onClose();
        } catch (error) {
            console.error('Deposit failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Deposit SOL</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
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
                                max={maxBalance}
                            />
                            <span className="input-suffix">SOL</span>
                            <button className="input-action" onClick={handleMaxClick}>
                                MAX
                            </button>
                        </div>
                        <div className="input-hint">Available: {maxBalance.toFixed(4)} SOL</div>
                    </div>

                    {/* Fee & Split Breakdown */}
                    {depositAmount > 0 && (
                        <div className="space-y-3 mt-6">
                            <div className="text-sm text-tertiary text-center">
                                After 0.4% fee ({platformFee.toFixed(4)} SOL)
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-500">→</span>
                                        <span className="text-sm">Savings ({savingsRate}%):</span>
                                    </div>
                                    <span className="font-bold text-green-500">
                                        {savingsAmount.toFixed(4)} SOL
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-500">→</span>
                                        <span className="text-sm">Spending ({100 - savingsRate}%):</span>
                                    </div>
                                    <span className="font-bold text-blue-500">
                                        {spendingAmount.toFixed(4)} SOL
                                    </span>
                                </div>
                            </div>

                            <div className="text-center pt-3 border-t border-white/10">
                                <span className="text-sm text-secondary">You'll receive: </span>
                                <span className="font-bold text-lg">{totalReceived.toFixed(4)} SOL</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleDeposit}
                        disabled={isProcessing || depositAmount <= 0 || depositAmount > maxBalance}
                    >
                        {isProcessing ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            'Confirm Deposit'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
