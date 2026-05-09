import React, { useState } from 'react';

export const WithdrawModal = ({
    isOpen,
    onClose,
    onWithdraw,
    vaultBalance = 0
}) => {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const withdrawAmount = parseFloat(amount) || 0;
    const remainingBalance = vaultBalance - withdrawAmount;

    const handleWithdrawAll = () => {
        setAmount(vaultBalance.toFixed(4));
    };

    const handleWithdraw = async () => {
        if (withdrawAmount <= 0 || withdrawAmount > vaultBalance) return;

        setIsProcessing(true);
        try {
            await onWithdraw(withdrawAmount);
            setAmount('');
            onClose();
        } catch (error) {
            console.error('Withdrawal failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in" onClick={onClose}>
            <div className="bg-[#141B3D] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-3xl shadow-purple-500/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Withdraw SOL</h2>
                    <button className="text-slate-400 hover:text-white transition-colors" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount to Withdraw</label>
                            <span className="text-xs text-slate-400">Vault: {vaultBalance.toFixed(4)} SOL</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur group-focus-within:opacity-100 opacity-0 transition-opacity" />
                            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                <span className="text-xl font-bold text-slate-500">◎</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-transparent border-none outline-none flex-1 text-xl font-bold placeholder:text-slate-600"
                                />
                                <button 
                                    onClick={handleWithdrawAll}
                                    className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[10px] font-black text-blue-400 hover:bg-blue-500/30 transition-all"
                                >
                                    ALL
                                </button>
                            </div>
                        </div>
                    </div>

                    {withdrawAmount > 0 && withdrawAmount <= vaultBalance && (
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Remaining in Vault</span>
                                <span className="font-mono text-slate-300">{remainingBalance.toFixed(4)} SOL</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between">
                                <span className="text-sm font-bold">Total to Wallet</span>
                                <span className="text-lg font-black text-blue-400">{withdrawAmount.toFixed(4)} SOL</span>
                            </div>
                        </div>
                    )}

                    {withdrawAmount > vaultBalance && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                            Insufficient funds in vault.
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            onClick={handleWithdraw}
                            disabled={isProcessing || withdrawAmount <= 0 || withdrawAmount > vaultBalance}
                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                        >
                            {isProcessing ? 'Processing Withdrawal...' : 'Confirm Withdrawal'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;
