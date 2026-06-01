import React, { useState, useEffect } from 'react';
import PriceTicker from './PriceTicker';

const PROGRAM_ID = 'GsH9GZHHiVpoTkCgcdjWsezUup8b3dC7YkPF2mbzAzsJ';
const PROGRAM_ID_SHORT = `${PROGRAM_ID.slice(0, 6)}...${PROGRAM_ID.slice(-6)}`;

const LandingPage = ({ onLaunchApp, onReadDocs }) => {
    const [demoAmount, setDemoAmount] = useState(10);
    const [demoRate, setDemoRate] = useState(10);
    const [copySuccess, setCopySuccess] = useState(false);
    const [navScrolled, setNavScrolled] = useState(false);

    const savingsPerTx = (demoAmount * demoRate) / 100;
    const projectedYearly = savingsPerTx * 52;

    useEffect(() => {
        const onScroll = () => setNavScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install -g @slice/cli');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#080B1A', fontFamily: "'Space Grotesk', sans-serif" }}>
            <PriceTicker />

            {/* === BACKGROUND ORBS === */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-pulse"
                    style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)', filter: 'blur(60px)', animationDuration: '6s' }} />
                <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-15 animate-pulse"
                    style={{ background: 'radial-gradient(circle, #14F195 0%, transparent 70%)', filter: 'blur(80px)', animationDuration: '8s', animationDelay: '2s' }} />
                <div className="absolute bottom-0 left-1/3 w-[500px] h-64 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(ellipse, #9945FF 0%, #14F195 50%, transparent 70%)', filter: 'blur(100px)' }} />
            </div>

            {/* === NAVIGATION === */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${navScrolled ? 'border-b' : ''}`}
                style={{
                    background: navScrolled ? 'rgba(8, 11, 26, 0.95)' : 'transparent',
                    backdropFilter: navScrolled ? 'blur(20px)' : 'none',
                    borderColor: 'rgba(153, 69, 255, 0.15)'
                }}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={onLaunchApp}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-lg transition-transform group-hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)', boxShadow: '0 0 20px rgba(153,69,255,0.4)' }}>
                            S
                        </div>
                        <span className="text-xl font-black tracking-tight" style={{
                            background: 'linear-gradient(90deg, #fff 0%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            SLICE
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ml-1"
                            style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)', color: '#14F195' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            MAINNET
                        </span>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'CLI', 'Security', 'Docs'].map((link) => (
                            <button key={link}
                                onClick={link === 'Docs' ? onReadDocs : undefined}
                                className="text-sm font-medium transition-colors duration-200"
                                style={{ color: '#94A3B8' }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                                {link}
                            </button>
                        ))}
                    </div>

                    {/* CTA */}
                    <button onClick={onLaunchApp}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #9945FF, #14F195)',
                            boxShadow: '0 0 24px rgba(153,69,255,0.35)',
                            color: '#000'
                        }}>
                        Launch App
                    </button>
                </div>
            </nav>

            {/* === HERO === */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Copy */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
                            style={{ background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.3)', color: '#c084fc' }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#14F195' }} />
                            Live on Solana Mainnet-Beta
                        </div>

                        {/* Headline */}
                        <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-6">
                            <span className="block text-white">SECURE.</span>
                            <span className="block" style={{
                                background: 'linear-gradient(90deg, #9945FF 0%, #14F195 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundSize: '200% 100%',
                                animation: 'gradient-shift 4s ease infinite'
                            }}>SAVE.</span>
                            <span className="block text-white">SOLANA.</span>
                        </h1>

                        <p className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: '#94A3B8' }}>
                            The non-custodial protocol that automatically vaults a portion of every SOL transaction.
                            Set your rate. Let the chain handle the rest. Even your AI agents can use it.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 mb-12">
                            <button onClick={onLaunchApp}
                                className="px-8 py-4 rounded-2xl font-black text-base transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #9945FF, #14F195)',
                                    boxShadow: '0 0 32px rgba(153,69,255,0.4)',
                                    color: '#000'
                                }}>
                                Start Saving →
                            </button>
                            <button onClick={onReadDocs}
                                className="px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: '#fff'
                                }}>
                                Read Docs
                            </button>
                        </div>

                        {/* Terminal CLI Card */}
                        <div id="cli" className="rounded-2xl overflow-hidden max-w-md"
                            style={{ background: '#0D1117', border: '1px solid rgba(153,69,255,0.25)', boxShadow: '0 0 32px rgba(153,69,255,0.1)' }}>
                            <div className="flex items-center justify-between px-4 py-3"
                                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                                    <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                                    <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                                </div>
                                <span className="text-xs font-mono font-bold" style={{ color: '#4B5563' }}>AGENTIC CLI</span>
                                <div className="w-12" />
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between">
                                <code className="text-sm font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#14F195' }}>$</span>
                                    <span style={{ color: '#9CA3AF' }}> npm install -g </span>
                                    <span style={{ color: '#9945FF' }}>@slice/cli</span>
                                </code>
                                <button onClick={handleCopy}
                                    className="ml-4 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                    style={{ background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.3)' }}>
                                    {copySuccess ? (
                                        <svg className="w-4 h-4" fill="none" stroke="#14F195" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="#9945FF" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Simulator */}
                    <div className="relative">
                        <div className="absolute -inset-px rounded-3xl opacity-60" style={{
                            background: 'linear-gradient(135deg, #9945FF, #14F195)',
                            filter: 'blur(1px)',
                            animation: 'glow-pulse 3s ease-in-out infinite'
                        }} />
                        <div className="relative rounded-3xl p-8" style={{
                            background: 'rgba(13, 18, 37, 0.9)',
                            border: '1px solid rgba(153,69,255,0.3)',
                            backdropFilter: 'blur(24px)'
                        }}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white">Savings Simulator</h3>
                                    <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Visualize your vault growth</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-full text-xs font-bold"
                                    style={{ background: 'rgba(20,241,149,0.1)', color: '#14F195', border: '1px solid rgba(20,241,149,0.3)' }}>
                                    Non-Custodial
                                </div>
                            </div>

                            {/* Slider: Deposit Amount */}
                            <div className="mb-8">
                                <div className="flex justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Transaction Size</span>
                                    <span className="text-lg font-black text-white font-mono">{demoAmount} SOL</span>
                                </div>
                                <input type="range" min="1" max="100" value={demoAmount}
                                    onChange={e => setDemoAmount(+e.target.value)}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, #9945FF ${demoAmount}%, rgba(255,255,255,0.1) ${demoAmount}%)`, accentColor: '#9945FF' }} />
                            </div>

                            {/* Slider: Savings Rate */}
                            <div className="mb-10">
                                <div className="flex justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Savings Rate</span>
                                    <span className="text-lg font-black font-mono" style={{ color: '#9945FF' }}>{demoRate}%</span>
                                </div>
                                <input type="range" min="1" max="50" value={demoRate}
                                    onChange={e => setDemoRate(+e.target.value)}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, #14F195 ${demoRate * 2}%, rgba(255,255,255,0.1) ${demoRate * 2}%)`, accentColor: '#14F195' }} />
                            </div>

                            {/* Results */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl" style={{ background: 'rgba(153,69,255,0.08)', border: '1px solid rgba(153,69,255,0.2)' }}>
                                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9945FF' }}>Per Transaction</p>
                                    <p className="text-3xl font-black text-white">{savingsPerTx.toFixed(2)}</p>
                                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>SOL Vaulted</p>
                                </div>
                                <div className="p-5 rounded-2xl" style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.2)' }}>
                                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#14F195' }}>Yearly Projection</p>
                                    <p className="text-3xl font-black" style={{ color: '#14F195' }}>{projectedYearly.toFixed(1)}</p>
                                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>SOL / Year</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === STATS BAR === */}
            <div className="relative z-10 py-5" style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x" style={{ '--tw-divide-opacity': 1 }}>
                        {[
                            { label: 'Program ID', value: PROGRAM_ID_SHORT, mono: true, href: `https://explorer.solana.com/address/${PROGRAM_ID}` },
                            { label: 'Network', value: 'Mainnet-Beta', color: '#14F195' },
                            { label: 'Security', value: 'Non-Custodial', color: '#9945FF' },
                            { label: 'TVL Cap', value: '100 SOL', color: '#fff' },
                        ].map((s, i) => (
                            <div key={i} className="text-center lg:px-8">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4B5563' }}>{s.label}</p>
                                {s.href ? (
                                    <a href={s.href} target="_blank" rel="noopener noreferrer"
                                        className="text-sm font-bold hover:underline transition-colors"
                                        style={{ color: '#9945FF', fontFamily: s.mono ? "'JetBrains Mono', monospace" : 'inherit' }}>
                                        {s.value}
                                    </a>
                                ) : (
                                    <p className="text-sm font-black" style={{ color: s.color || '#fff' }}>{s.value}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === FEATURES === */}
            <section id="features" className="relative z-10 py-28 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9945FF' }}>Protocol Design</p>
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Built different.</h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748B' }}>
                        Every design decision was made with one goal: secure, automated savings that you and your AI agents can trust.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: '🔐',
                            title: 'Non-Custodial Vaults',
                            desc: 'Your funds live in a Program Derived Address controlled exclusively by your keypair. The protocol has zero ability to touch your SOL.',
                            accent: '#9945FF'
                        },
                        {
                            icon: '⚡',
                            title: 'Instant Settlement',
                            desc: 'Built on Solana. Every save and withdrawal settles in under 400ms with transaction fees under $0.001.',
                            accent: '#14F195'
                        },
                        {
                            icon: '🤖',
                            title: 'Agent-Native',
                            desc: 'The @slice/cli gives any AI agent the ability to activate, save, and manage vaults without ever touching a browser.',
                            accent: '#9945FF'
                        },
                        {
                            icon: '🛡️',
                            title: 'Immutable Fee Rate',
                            desc: '0.4% fee is hard-coded at compile time. No governance, no rug. Fees go to the treasury vault — no admin key controls them.',
                            accent: '#14F195'
                        },
                        {
                            icon: '📊',
                            title: 'TVL Cap Protected',
                            desc: 'A 100 SOL TVL cap limits blast radius during launch. Adjustable by the protocol authority as security confidence grows.',
                            accent: '#9945FF'
                        },
                        {
                            icon: '🔓',
                            title: 'Always Withdrawable',
                            desc: 'Even if the protocol is paused, withdrawals remain open. You can never be locked out of your own funds.',
                            accent: '#14F195'
                        },
                    ].map((f, i) => (
                        <div key={i} className="group p-6 rounded-2xl transition-all duration-300 cursor-default"
                            style={{
                                background: 'rgba(13, 18, 37, 0.6)',
                                border: `1px solid rgba(255,255,255,0.06)`,
                                backdropFilter: 'blur(12px)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.border = `1px solid ${f.accent}40`;
                                e.currentTarget.style.boxShadow = `0 0 32px ${f.accent}18`;
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}>
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="text-base font-black text-white mb-2">{f.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* === HOW IT WORKS === */}
            <section className="relative z-10 py-24" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#14F195' }}>Flow</p>
                    <h2 className="text-4xl font-black text-white mb-14">Three steps to automated savings.</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Connect & Activate', desc: 'Connect your Solana wallet and sign a single transaction to create your personal vault PDA on-chain.' },
                            { step: '02', title: 'Set Your Rate', desc: 'Choose what percentage of each deposit goes into your vault. 5%, 10%, 20% — your call.' },
                            { step: '03', title: 'Save Automatically', desc: 'Every time you call saveSol, the protocol auto-routes your slice to the vault. No maintenance required.' },
                        ].map((s, i) => (
                            <div key={i} className="text-left">
                                <div className="text-5xl font-black mb-4" style={{
                                    background: 'linear-gradient(135deg, #9945FF, #14F195)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>
                                    {s.step}
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === SECURITY === */}
            <section id="security" className="relative z-10 py-28 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#14F195' }}>Security</p>
                    <h2 className="text-4xl lg:text-5xl font-black text-white">Trust the math, not the team.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'PDA-Based Custody', icon: '🔏', desc: 'Vault accounts are Program Derived Addresses. The math of Solana cryptography guarantees only you can sign for your vault.' },
                        { title: 'Open Source', icon: '📖', desc: 'Every line of the smart contract is public on GitHub. Read the code, verify the logic, trust what you can verify.' },
                        { title: 'Minimalist Core', icon: '⚙️', desc: '326 lines. Four instructions. No bloat, no attack surface. The smaller the code, the smaller the risk.' },
                    ].map((s, i) => (
                        <div key={i} className="p-8 rounded-2xl text-center"
                            style={{ background: 'rgba(20,241,149,0.04)', border: '1px solid rgba(20,241,149,0.15)' }}>
                            <div className="text-4xl mb-4">{s.icon}</div>
                            <h3 className="text-lg font-black text-white mb-3">{s.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* === FINAL CTA === */}
            <section className="relative z-10 py-24 text-center">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-5xl font-black text-white mb-6">Ready to start slicing?</h2>
                    <p className="text-lg mb-10" style={{ color: '#64748B' }}>
                        Connect your wallet and activate your vault in under 60 seconds.
                    </p>
                    <button onClick={onLaunchApp}
                        className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #9945FF, #14F195)',
                            boxShadow: '0 0 48px rgba(153,69,255,0.4)',
                            color: '#000'
                        }}>
                        Open App →
                    </button>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="relative z-10 py-12" style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                                style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)', color: '#000' }}>
                                S
                            </div>
                            <span className="font-black text-white">SLICE Protocol</span>
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-8">
                            <button onClick={onReadDocs} className="text-sm transition-colors hover:text-white" style={{ color: '#64748B' }}>
                                Docs
                            </button>
                            <a href="https://github.com/NoizceEra/SAS-Vaults" target="_blank" rel="noopener noreferrer"
                                className="text-sm transition-colors hover:text-white" style={{ color: '#64748B' }}>
                                GitHub
                            </a>
                            <a href={`https://explorer.solana.com/address/${PROGRAM_ID}`} target="_blank" rel="noopener noreferrer"
                                className="text-sm transition-colors hover:text-white" style={{ color: '#64748B' }}>
                                Explorer
                            </a>
                        </div>

                        {/* Program ID */}
                        <div className="text-xs font-mono" style={{ color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
                            {PROGRAM_ID_SHORT}
                        </div>
                    </div>
                    <div className="mt-8 text-center text-xs" style={{ color: '#374151' }}>
                        © 2026 SLICE Protocol. Non-custodial. Open source. Built on Solana.
                    </div>
                </div>
            </footer>

            {/* Gradient shift keyframe */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
