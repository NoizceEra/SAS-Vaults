import React, { useState } from 'react';

const LandingPage = ({ onLaunchApp }) => {
    const [demoAmount, setDemoAmount] = useState(10);
    const [demoRate, setDemoRate] = useState(10);

    // Calculate projected values
    const savingsAmount = (demoAmount * demoRate) / 100;
    const spendingAmount = demoAmount - savingsAmount;
    const projectedYearly = savingsAmount * 52; // Assuming 1 transaction a week

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-purple-500 selection:text-white">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/20 p-2">
                        <img src="/logo.png" alt="Slice Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Slice
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="#features" className="text-slate-400 hover:text-white transition-colors hidden sm:block">Features</a>
                    <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors hidden sm:block">How it Works</a>
                    <button
                        onClick={onLaunchApp}
                        className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen animate-blob" />
                    <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Hero Text */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-slate-300">Live on Devnet</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                            Automate your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                Future Wealth
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            The first non-custodial protocol that automatically saves and swaps a percentage of every SOL transaction you make.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onLaunchApp}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:scale-105 transition-all"
                            >
                                Start Saving Now
                            </button>
                            <a
                                href="https://explorer.solana.com/address/ALvwuWXCK48qFeTyHxkkSrufhAnP15bh4qkreZSwnhEi?cluster=devnet"
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto px-8 py-4 bg-slate-800 rounded-xl font-semibold text-lg text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                View Contract
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Interactive Hero Widget */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-20 transform rotate-2 scale-105" />
                        <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-semibold text-white">Savings Simulator</h3>
                                <span className="bg-slate-700 text-xs font-mono px-2 py-1 rounded text-slate-300">DEMO MODE</span>
                            </div>

                            {/* Slider Input */}
                            <div className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-slate-400">Transaction Amount</label>
                                    <span className="font-mono font-bold text-white">{demoAmount} SOL</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={demoAmount}
                                    onChange={(e) => setDemoAmount(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-slate-400">Savings Rate</label>
                                    <span className="font-mono font-bold text-purple-400">{demoRate}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={demoRate}
                                    onChange={(e) => setDemoRate(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Result Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-1">To Wallet</p>
                                    <p className="text-xl font-bold text-white">{(spendingAmount).toFixed(2)} SOL</p>
                                </div>
                                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-purple-300 mb-1">Auto-Saved</p>
                                    <p className="text-xl font-bold text-purple-400">{(savingsAmount).toFixed(2)} SOL</p>
                                </div>
                            </div>

                            {/* Projected Yield */}
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">Projected Savings (1 yr)</p>
                                    <p className="text-lg font-bold text-green-400">≈ {projectedYearly.toFixed(2)} SOL</p>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 text-right">
                                    *Based on 1 tx/week at current settings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-24 bg-slate-800/50 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why use Slice?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Built on Solana for speed and security. We've simplified the entire process of dollar-cost averaging into your savings.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-purple-500/30 transition-all group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Non-Custodial</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Your funds, your keys. Money is stored in a secure PDA (Program Derived Address) that only you can withdraw from.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-green-500/30 transition-all group">
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Auto-Scaling</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Set a percentage (1-90%) and forget it. Whether you transfer 1 SOL or 1000 SOL, your savings scale automatically.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500/30 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Auto-Swap</h3>
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 mb-2">NEW</span>
                            <p className="text-slate-400 leading-relaxed">
                                Automatically swap your SOL savings into stablecoins (USDC/USDT) or memes (BONK) to lock in value instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-1.5">
                            <img src="/logo.png" alt="Slice Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-slate-300">Slice</span>
                    </div>
                    <div className="flex gap-6 items-center">
                        <a href="https://x.com/SliceProtocol" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </a>
                        <div className="text-sm text-slate-500">
                            © 2026 Slice (Powered by SAS Protocol). All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
