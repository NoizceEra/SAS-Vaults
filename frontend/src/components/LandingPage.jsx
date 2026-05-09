import React, { useState } from 'react';
import PriceTicker from './PriceTicker';

const LandingPage = ({ onLaunchApp }) => {
    const [demoAmount, setDemoAmount] = useState(10);
    const [demoRate, setDemoRate] = useState(10);

    const savingsAmount = (demoAmount * demoRate) / 100;
    const projectedYearly = savingsAmount * 52; 

    return (
        <div className="min-h-screen bg-[#0A0E27] text-white font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
            <PriceTicker />
            
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[150px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                        <span className="text-2xl font-bold">S</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Slice
                    </span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#security" className="hover:text-white transition-colors">Security</a>
                    </div>
                    <button
                        onClick={onLaunchApp}
                        className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                    >
                        Enter App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live on Solana Mainnet</span>
                        </div>
                        
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                            SAVE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
                                AUTOMATICALLY
                            </span>
                        </h1>
                        
                        <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            The non-custodial protocol that secures a percentage of your SOL every time you move it. No more manual transfers. No more forgetting to save.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onLaunchApp}
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/20 hover:scale-105 transition-all"
                            >
                                Start Saving Now
                            </button>
                            <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md">
                                Read Docs
                            </button>
                        </div>
                    </div>

                    {/* Interactive Simulator Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative bg-[#141B3D]/80 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-10 shadow-3xl">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold">Simulator</h3>
                                    <p className="text-sm text-slate-400">See your future growth</p>
                                </div>
                                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                                    <span className="text-xs font-bold text-purple-400">0.4% Fee</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initial Deposit</label>
                                        <span className="text-xl font-mono font-bold">{demoAmount} SOL</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={demoAmount}
                                        onChange={(e) => setDemoAmount(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Savings Rate</label>
                                        <span className="text-xl font-mono font-bold text-purple-400">{demoRate}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={demoRate}
                                        onChange={(e) => setDemoRate(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-12">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Vaulted</p>
                                    <p className="text-3xl font-black">{savingsAmount.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400 mt-1">SOL Saved</p>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20">
                                    <p className="text-xs font-bold text-purple-400 uppercase mb-2">Yearly Goal</p>
                                    <p className="text-3xl font-black text-green-400">{projectedYearly.toFixed(1)}</p>
                                    <p className="text-xs text-slate-400 mt-1">SOL/Year</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Protocol Metrics */}
            <section className="relative z-10 py-20 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: 'Network', value: 'Mainnet-Beta', color: 'text-white' },
                            { label: 'Protocol Fee', value: '0.4%', color: 'text-purple-400' },
                            { label: 'Total Saved', value: '14,200+', color: 'text-white' },
                            { label: 'Security', value: 'Non-Custodial', color: 'text-emerald-400' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                                <p className={`text-2xl lg:text-3xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
