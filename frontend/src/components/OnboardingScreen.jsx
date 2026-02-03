import React, { useState } from 'react';

/**
 * OnboardingScreen Component
 * First-time user setup for savings rate
 * Matches the design from onboarding_setup_view.png
 */
export const OnboardingScreen = ({ onCreateVault, walletBalance = 0 }) => {
    const [savingsRate, setSavingsRate] = useState(50);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateVault = async () => {
        setIsCreating(true);
        setError(null);
        try {
            await onCreateVault(savingsRate);
            // Success - component will unmount as vault is created
        } catch (error) {
            console.error('Vault creation failed:', error);

            // Set user-friendly error message
            let errorMessage = 'Failed to create vault. Please try again.';
            if (error.message?.includes('User rejected')) {
                errorMessage = 'Transaction was rejected. Please approve the transaction to continue.';
            } else if (error.message?.includes('insufficient')) {
                errorMessage = 'Insufficient SOL balance. Please add funds to your wallet.';
            }

            setError(errorMessage);
            setIsCreating(false);
        }
    };

    // Calculate example split for 1 SOL
    const exampleDeposit = 1.0;
    const platformFee = exampleDeposit * 0.004;
    const remaining = exampleDeposit - platformFee;
    const savingsAmount = remaining * (savingsRate / 100);
    const spendingAmount = remaining - savingsAmount;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center animate-in">
                {/* Glowing Logo */}
                <div className="mb-8 relative">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple animate-pulse">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-2">
                    Welcome to Auto-Savings
                </h1>
                <p className="text-secondary mb-8">
                    Set your savings rate to get started
                </p>

                {/* Circular Percentage Selector */}
                <div className="mb-8">
                    <div className="relative w-48 h-48 mx-auto">
                        {/* Circular background */}
                        <div className="absolute inset-0 rounded-full border-8 border-tertiary"></div>

                        {/* Gradient ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeDasharray={`${savingsRate * 5.53} 553`}
                                strokeLinecap="round"
                                className="transition-all duration-300"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary-purple)" />
                                    <stop offset="100%" stopColor="var(--primary-blue)" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Percentage display */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl font-bold text-gradient">
                                {savingsRate}%
                            </div>
                        </div>
                    </div>

                    {/* Slider */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={savingsRate}
                        onChange={(e) => setSavingsRate(parseInt(e.target.value))}
                        className="slider-input w-full mt-8"
                        style={{
                            background: `linear-gradient(to right, 
                var(--primary-purple) 0%, 
                var(--primary-blue) ${savingsRate}%, 
                var(--bg-tertiary) ${savingsRate}%, 
                var(--bg-tertiary) 100%)`
                        }}
                    />
                </div>

                {/* Visual Preview */}
                <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-3">
                        {/* Savings bar */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-500">💰</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-secondary">Savings</span>
                                    <span className="text-sm font-semibold">{savingsRate}%</span>
                                </div>
                                <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                                        style={{ width: `${savingsRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Spending bar */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-500">💳</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-secondary">Spending</span>
                                    <span className="text-sm font-semibold">{100 - savingsRate}%</span>
                                </div>
                                <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                                        style={{ width: `${100 - savingsRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Example Calculation */}
                <div className="mb-8 text-sm">
                    <div className="text-secondary mb-3">For every 1 SOL deposited:</div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-500">
                            <span className="font-bold">💰 {savingsAmount.toFixed(3)} SOL</span>
                            <span className="text-secondary">→ Savings</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-blue-500">
                            <span className="font-bold">💳 {spendingAmount.toFixed(3)} SOL</span>
                            <span className="text-secondary">→ Spending</span>
                        </div>
                        <div className="text-xs text-tertiary mt-2">
                            Platform fee: {platformFee.toFixed(4)} SOL (0.4%)
                        </div>
                    </div>
                </div>

                {/* Low Balance Warning */}
                {walletBalance < 0.003 && (
                    <div className="mb-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 animate-in text-left">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-500 text-xl">⚠️</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-orange-500">Low Balance</div>
                                <div className="text-sm text-orange-400">
                                    You need ~0.003 SOL to create a vault.
                                    Current balance: {walletBalance.toFixed(4)} SOL
                                </div>
                            </div>
                        </div>
                        <a
                            href="https://faucet.solana.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary w-full text-sm py-2 flex items-center justify-center gap-2"
                        >
                            <span>🚰</span>
                            Get Devnet SOL
                        </a>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-in">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-red-500 text-xl">⚠️</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-red-500">Error</div>
                                <div className="text-sm text-red-400">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Vault Button */}
                <button
                    className="btn-primary w-full text-lg py-4"
                    onClick={handleCreateVault}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <>
                            <div className="spinner"></div>
                            Creating Vault...
                        </>
                    ) : (
                        'Create Vault'
                    )}
                </button>

                <p className="text-sm text-tertiary mt-4">
                    You can change this anytime
                </p>
            </div>
        </div>
    );
};

export default OnboardingScreen;
