import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Settings,
    TrendingUp,
    ShieldCheck,
    Zap,
    ArrowUpRight,
    Lock,
    Coins,
    BarChart3,
    RefreshCw,
    ChevronRight,
    PieChart,
    PlusCircle,
    X,
    CheckCircle2,
    ArrowDownCircle,
    ArrowUpCircle,
    ExternalLink
} from 'lucide-react';

// Demo mode - showing the UI without blockchain connection
// To connect to blockchain, you'll need to install wallet adapters

const App = () => {
    const [savingsRate, setSavingsRate] = useState(10);
    const [activeModal, setActiveModal] = useState(null);
    const [amountInput, setAmountInput] = useState("");
    const [solPrice, setSolPrice] = useState(null);
    const [priceLoading, setPriceLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Demo data
    const [demoData, setDemoData] = useState({
        walletBalance: 125.75,
        vaultBalance: 4.25,
        totalSaved: 15.50,
        totalWithdrawn: 11.25,
        transactionCount: 23
    });

    // Fetch SOL price
    const fetchSolPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
            const data = await response.json();
            setSolPrice({
                price: data.solana.usd,
                change24h: data.solana.usd_24h_change
            });
            setPriceLoading(false);
        } catch (error) {
            console.error('Price fetch error:', error);
            setPriceLoading(false);
        }
    };

    useEffect(() => {
        fetchSolPrice();
        const interval = setInterval(fetchSolPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = () => {
        setIsConnected(true);
    };

    const handleInitialize = () => {
        setIsInitialized(true);
        alert(`Account initialized with ${savingsRate}% savings rate!\n\n(Demo mode - In production, this would create your PDA vault on Solana)`);
    };

    const handleTransaction = () => {
        const amount = parseFloat(amountInput);
        if (isNaN(amount) || amount <= 0) return;

        if (activeModal === 'deposit') {
            setDemoData(prev => ({
                ...prev,
                walletBalance: prev.walletBalance - amount,
                vaultBalance: prev.vaultBalance + amount,
                totalSaved: prev.totalSaved + amount,
                transactionCount: prev.transactionCount + 1
            }));
            alert(`Deposited ${amount} SOL to vault!\n\n(Demo mode - In production, this would be a real blockchain transaction)`);
        } else if (activeModal === 'withdraw') {
            setDemoData(prev => ({
                ...prev,
                walletBalance: prev.walletBalance + amount,
                vaultBalance: prev.vaultBalance - amount,
                totalWithdrawn: prev.totalWithdrawn + amount,
                transactionCount: prev.transactionCount + 1
            }));
            alert(`Withdrew ${amount} SOL from vault!\n\n(Demo mode - In production, this would be a real blockchain transaction)`);
        }

        setActiveModal(null);
        setAmountInput("");
    };

    const StatCard = ({ title, value, icon: Icon, subtext }) => (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Icon className="text-purple-400 w-5 h-5" />
                </div>
            </div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            {subtext && <p className="text-slate-500 text-xs mt-2">{subtext}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-purple-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-900/20 blur-[120px] rounded-full" />
            </div>

            {/* Demo Banner */}
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-2 text-center relative z-50">
                <p className="text-yellow-400 text-sm font-medium">
                    🎨 <strong>DEMO MODE</strong> - UI Preview | Program ID: GzAdCQF3AiCKeduYgRtok77czGBKcAragigtmWurXHcc (Deployed on Devnet)
                </p>
            </div>

            {/* Transaction Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-200">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {activeModal === 'deposit' ? 'Deposit to Vault' : 'Withdraw from Vault'}
                        </h2>
                        <p className="text-slate-400 text-sm mb-8">
                            {activeModal === 'deposit'
                                ? 'Move SOL from your wallet to your secure savings PDA.'
                                : 'Return SOL from your savings vault to your main wallet.'}
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <span>Amount to {activeModal}</span>
                                    <span>
                                        Available: {activeModal === 'deposit' ? demoData.walletBalance.toFixed(4) : demoData.vaultBalance.toFixed(4)} SOL
                                    </span>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black/40 border border-slate-800 rounded-2xl py-5 px-6 text-2xl font-black text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-800"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <span className="text-slate-400 font-bold">SOL</span>
                                        <button
                                            onClick={() => setAmountInput(activeModal === 'deposit' ? demoData.walletBalance.toString() : demoData.vaultBalance.toString())}
                                            className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md hover:bg-purple-500/20 transition-colors uppercase font-bold"
                                        >
                                            Max
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleTransaction}
                                disabled={!amountInput || parseFloat(amountInput) <= 0}
                                className={`w-full py-5 rounded-2xl text-white font-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${activeModal === 'deposit'
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-purple-500/20 hover:from-purple-500 hover:to-blue-500'
                                        : 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/50'
                                    }`}
                            >
                                {activeModal === 'deposit' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                                Confirm {activeModal === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-800 bg-black/50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                AutoSave
                            </h1>
                            <p className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">Solana Protocol</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                {priceLoading ? "Fetching SOL..." : `SOL: $${solPrice?.price?.toFixed(2) || '---'}`}
                            </div>
                            <span className={`text-[10px] ${solPrice?.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {solPrice?.change24h ? `${solPrice.change24h > 0 ? '+' : ''}${solPrice.change24h.toFixed(2)}%` : '--'}
                            </span>
                        </div>
                        {!isConnected ? (
                            <button
                                onClick={handleConnect}
                                className="bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Connect Wallet (Demo)
                            </button>
                        ) : (
                            <div className="bg-slate-800 px-4 py-2 rounded-xl font-mono text-sm">
                                Demo...Wallet
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {!isConnected ? (
                <main className="max-w-7xl mx-auto px-4 py-20 text-center relative">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h2>
                        <p className="text-slate-400 mb-8">Connect your Solana wallet to start saving automatically</p>
                        <button
                            onClick={handleConnect}
                            className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all shadow-lg"
                        >
                            Connect Wallet (Demo Mode)
                        </button>
                        <p className="text-slate-500 text-sm mt-4">
                            This is a UI demo. To connect real wallets, install @solana/wallet-adapter packages.
                        </p>
                    </div>
                </main>
            ) : (
                <main className="max-w-7xl mx-auto px-4 py-8 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        {/* Main Controls Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Savings Engine</h2>
                                        <p className="text-slate-400 text-sm">
                                            {isInitialized ? 'Automate your wealth generation with every transfer.' : 'Initialize your account to start saving.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-6">
                                        <div className="bg-black/40 p-6 rounded-2xl border border-slate-800 shadow-inner">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">
                                                {isInitialized ? 'Current Savings Rate' : 'Set Initial Savings Rate'}
                                            </label>
                                            <div className="flex items-end gap-2">
                                                <span className="text-5xl font-black text-white">{savingsRate}%</span>
                                                <span className="text-slate-400 mb-2 font-medium">per transfer</span>
                                            </div>

                                            <div className="mt-6">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="90"
                                                    value={savingsRate}
                                                    onChange={(e) => setSavingsRate(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                                <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
                                                    <span>1% MIN</span>
                                                    <span>10% AVG</span>
                                                    <span>90% MAX</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {isInitialized && (
                                                <button
                                                    onClick={() => setActiveModal('deposit')}
                                                    className="flex-1 bg-white text-black py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    Deposit
                                                </button>
                                            )}
                                            <button
                                                onClick={handleInitialize}
                                                disabled={isInitialized}
                                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50"
                                            >
                                                {isInitialized ? (
                                                    <>
                                                        Initialized ✓
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Initialize Account
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Atomic Transfers</p>
                                                <p className="text-xs text-slate-400">Savings occur in the same transaction block.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Non-Custodial</p>
                                                <p className="text-xs text-slate-400">Funds reside in your personal PDA.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">On-Chain Verified</p>
                                                <p className="text-xs text-slate-400">Live on Solana devnet.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-64 h-64 text-purple-500/5 -mr-20 -mt-20">
                                <BarChart3 className="w-full h-full" />
                            </div>
                        </div>

                        {/* User Profile / Vault Card */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-mono">
                                        Demo...Wallet
                                    </p>
                                    <h4 className="text-white font-bold">My Savings Vault</h4>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="p-5 bg-black/40 rounded-2xl border border-slate-800/50 shadow-inner group transition-all hover:border-purple-500/30">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Vault Balance</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-white group-hover:text-purple-400 transition-colors">
                                            {demoData.vaultBalance.toFixed(4)} SOL
                                        </span>
                                    </div>
                                    <p className="text-emerald-400 text-[11px] mt-1 font-mono flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        ≈ ${(demoData.vaultBalance * (solPrice?.price || 150)).toFixed(2)} USD
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-black/30 rounded-2xl border border-slate-800/50">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Wallet</p>
                                        <span className="text-white font-black">{demoData.walletBalance.toFixed(2)} SOL</span>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-2xl border border-slate-800/50">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Status</p>
                                        <span className={`font-black ${isInitialized ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            {isInitialized ? 'Active' : 'Not Init'}
                                        </span>
                                    </div>
                                </div>

                                {isInitialized && (
                                    <div className="pt-4 border-t border-slate-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-500 font-medium">Total Saved</span>
                                            <span className="text-xs text-white font-bold">{demoData.totalSaved.toFixed(4)} SOL</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-medium">Transactions</span>
                                            <span className="text-xs text-white font-bold">{demoData.transactionCount}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isInitialized && (
                                <div className="grid grid-cols-1 gap-3 mt-6">
                                    <button
                                        onClick={() => setActiveModal('withdraw')}
                                        disabled={demoData.vaultBalance === 0}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                        Withdraw SOL
                                    </button>
                                    <a
                                        href={`https://explorer.solana.com/address/GzAdCQF3AiCKeduYgRtok77czGBKcAragigtmWurXHcc?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-slate-500 hover:text-white transition-colors text-[11px] flex items-center justify-center gap-1 py-1"
                                    >
                                        View Program On Solana Explorer <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Global Protocol Analytics */}
                    {isInitialized && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className="text-purple-500 w-6 h-6" />
                                <h2 className="text-xl font-bold text-white">Your Savings Stats</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Total Saved"
                                    value={`${demoData.totalSaved.toFixed(4)} SOL`}
                                    icon={Lock}
                                    subtext="Lifetime savings"
                                />
                                <StatCard
                                    title="Total Withdrawn"
                                    value={`${demoData.totalWithdrawn.toFixed(4)} SOL`}
                                    icon={ArrowUpCircle}
                                    subtext="Lifetime withdrawals"
                                />
                                <StatCard
                                    title="Savings Rate"
                                    value={`${savingsRate}%`}
                                    icon={PieChart}
                                    subtext="Current rate"
                                />
                                <StatCard
                                    title="Transactions"
                                    value={demoData.transactionCount}
                                    icon={Zap}
                                    subtext="Total operations"
                                />
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* Security Footer */}
            <footer className="max-w-7xl mx-auto px-4 py-10 border-t border-slate-900 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span>Solana Devnet Status: Normal</span>
                    <span className="text-slate-800">|</span>
                    <ShieldCheck className="w-4 h-4 text-purple-500/50" />
                    <span>Non-Custodial Protocol</span>
                </div>
                <div className="flex gap-8">
                    <a href="https://explorer.solana.com/address/GzAdCQF3AiCKeduYgRtok77czGBKcAragigtmWurXHcc?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Program</a>
                </div>
            </footer>
        </div>
    );
};

export default App;
