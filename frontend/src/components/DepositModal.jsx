import React, { useState } from 'react';

export const DepositModal = ({
    isOpen,
    onClose,
    onDeposit,
    maxBalance = 0
}) => {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const depositAmount = parseFloat(amount) || 0;
    const platformFee = depositAmount * 0.004; // 0.4%
    const totalToVault = depositAmount - platformFee;

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in" onClick={onClose}>
            <div className="bg-[#141B3D] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-3xl shadow-purple-500/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Deposit SOL</h2>
                    <button className="text-slate-400 hover:text-white transition-colors" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount to Save</label>
                            <span className="text-xs text-slate-400">Balance: {maxBalance.toFixed(4)} SOL</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur group-focus-within:opacity-100 opacity-0 transition-opacity" />
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
                                    onClick={handleMaxClick}
                                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[10px] font-black text-purple-400 hover:bg-purple-500/30 transition-all"
                                >
                                    MAX
                                </button>
                            </div>
                        </div>
                    </div>

                    {depositAmount > 0 && (
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Protocol Fee (0.4%)</span>
                                <span className="font-mono text-slate-300">-{platformFee.toFixed(6)} SOL</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between">
                                <span className="text-sm font-bold">Total Added to Vault</span>
                                <span className="text-lg font-black text-emerald-400">{totalToVault.toFixed(4)} SOL</span>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            onClick={handleDeposit}
                            disabled={isProcessing || depositAmount <= 0 || depositAmount > maxBalance}
                            className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                        >
                            {isProcessing ? 'Processing Transaction...' : 'Confirm Deposit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
