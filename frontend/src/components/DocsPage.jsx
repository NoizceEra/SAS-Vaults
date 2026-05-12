import React, { useState } from 'react';

const DocsPage = ({ onBack }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(label);
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const CopyButton = ({ text, label }) => (
        <button
            onClick={() => handleCopy(text, label)}
            className="ml-2 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
            {copySuccess === label ? '✓ Copied' : 'Copy'}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#0A0E27] text-white font-sans overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <nav className="relative z-50 max-w-4xl mx-auto px-6 h-24 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-xl font-bold">S</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Slice Docs
                    </span>
                </div>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-full font-bold text-sm hover:bg-white/10 transition-all"
                >
                    ← Back to App
                </button>
            </nav>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
                {/* Title */}
                <div className="mb-16">
                    <h1 className="text-5xl font-black tracking-tight mb-4">Documentation</h1>
                    <p className="text-xl text-slate-400 font-medium">Everything you need to know about saving on Solana with Slice.</p>
                </div>

                {/* What is Slice */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 text-sm">01</span>
                        What is Slice?
                    </h2>
                    <div className="bg-[#141B3D]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Slice is a <strong className="text-white">non-custodial auto-savings protocol</strong> built on Solana. It gives you a secure, on-chain vault where you can store SOL separately from your main wallet — like a savings account, but fully decentralized.
                        </p>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Your funds are held in a <strong className="text-white">Program Derived Address (PDA)</strong> — a special Solana account that only you can withdraw from. No one else, not even us, can touch your savings.
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                            Slice is designed for both humans and AI agents. You can use the web dashboard or the CLI to manage your vault.
                        </p>
                    </div>
                </section>

                {/* How It Works */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm">02</span>
                        How It Works
                    </h2>
                    <div className="space-y-4">
                        {[
                            { step: '1', title: 'Connect Your Wallet', desc: 'Use Phantom, Solflare, or any Solana wallet to connect.' },
                            { step: '2', title: 'Activate Your Vault', desc: 'A one-time transaction creates your secure PDA vault on-chain. Costs ~0.002 SOL in rent.' },
                            { step: '3', title: 'Deposit SOL', desc: 'Move SOL from your wallet into your vault. Your savings are now secured on-chain.' },
                            { step: '4', title: 'Withdraw Anytime', desc: 'Pull your savings back to your main wallet instantly. No lockups, no delays.' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-6 p-6 bg-[#141B3D]/30 border border-white/5 rounded-2xl group hover:border-purple-500/20 transition-all">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                    <p className="text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* For Developers & AI Agents */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-sm">03</span>
                        For Developers & AI Agents
                    </h2>
                    <div className="bg-[#141B3D]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <p className="text-slate-300 leading-relaxed mb-6">
                            Slice ships with a CLI designed for headless, automated use. Your AI agent can manage savings without a browser.
                        </p>

                        <h3 className="font-bold mb-3 text-white">Install</h3>
                        <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm mb-6 flex items-center justify-between">
                            <code className="text-purple-400"><span className="text-slate-500">$</span> npm install -g @slice/cli</code>
                            <CopyButton text="npm install -g @slice/cli" label="install" />
                        </div>

                        <h3 className="font-bold mb-3 text-white">Commands</h3>
                        <div className="space-y-3">
                            <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm flex items-center justify-between">
                                <div>
                                    <code className="text-emerald-400">slice status</code>
                                    <span className="text-slate-500 ml-4"># Check wallet and vault balances</span>
                                </div>
                                <CopyButton text="slice status" label="status" />
                            </div>
                            <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm flex items-center justify-between">
                                <div>
                                    <code className="text-emerald-400">slice activate</code>
                                    <span className="text-slate-500 ml-4"># Initialize your vault (one-time)</span>
                                </div>
                                <CopyButton text="slice activate" label="activate" />
                            </div>
                            <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm flex items-center justify-between">
                                <div>
                                    <code className="text-emerald-400">{'slice save <amount>'}</code>
                                    <span className="text-slate-500 ml-4"># Save SOL to your vault</span>
                                </div>
                                <CopyButton text="slice save 1.0" label="save" />
                            </div>
                        </div>

                        <h3 className="font-bold mt-6 mb-3 text-white">Authentication</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The CLI reads your keypair from <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">./keypair.json</code> by default, or you can set the <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">SLICE_PRIVATE_KEY</code> environment variable with your base58-encoded private key.
                        </p>
                    </div>
                </section>

                {/* Security */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400 text-sm">04</span>
                        Security
                    </h2>
                    <div className="bg-[#141B3D]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h3 className="font-bold mb-2 text-emerald-400">Non-Custodial</h3>
                                <p className="text-slate-400 text-sm">Your vault is a PDA derived from your wallet. Only your private key can authorize withdrawals.</p>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h3 className="font-bold mb-2 text-blue-400">On-Chain Logic</h3>
                                <p className="text-slate-400 text-sm">All savings and withdrawal logic runs entirely on Solana. No off-chain servers involved.</p>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h3 className="font-bold mb-2 text-purple-400">Open Source</h3>
                                <p className="text-slate-400 text-sm">The full smart contract code is available on GitHub for anyone to audit and verify.</p>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h3 className="font-bold mb-2 text-white">TVL Cap</h3>
                                <p className="text-slate-400 text-sm">The protocol enforces a 100 SOL TVL cap during beta to limit risk exposure.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contract Info */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-500/20 rounded-lg flex items-center justify-center text-slate-400 text-sm">05</span>
                        Contract Details
                    </h2>
                    <div className="bg-[#141B3D]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-0">Program ID</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-slate-300 break-all">FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn</code>
                                <CopyButton text="FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn" label="program" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-0">Network</span>
                            <span className="text-sm font-bold text-emerald-400">Solana Mainnet-Beta</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-0">Framework</span>
                            <span className="text-sm font-bold text-slate-300">Anchor 0.29.0</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-0">Source Code</span>
                            <a href="https://github.com/NoizceEra/SAS-Vaults" target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors">
                                github.com/NoizceEra/SAS-Vaults ↗
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DocsPage;
