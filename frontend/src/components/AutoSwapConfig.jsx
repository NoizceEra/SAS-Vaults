import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

const SUPPORTED_TOKENS = [
    { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', icon: '$', color: '#2775CA' },
    { symbol: 'USDT', name: 'Tether USD', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', icon: '₮', color: '#26A17B' },
    { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', icon: '🐕', color: '#FF6B35' },
];

export default function AutoSwapConfig({ program, userConfig }) {
    const { publicKey } = useWallet();
    const [enabled, setEnabled] = useState(false);
    const [targetToken, setTargetToken] = useState(SUPPORTED_TOKENS[0]);
    const [minAmount, setMinAmount] = useState('1.0');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!publicKey || !program) return;

        setLoading(true);
        setSaved(false);

        try {
            const minAmountLamports = new BN(parseFloat(minAmount) * 1e9); // Convert SOL to lamports

            const tx = await program.methods
                .setAutoSwap(
                    enabled,
                    new PublicKey(targetToken.mint),
                    minAmountLamports
                )
                .accounts({
                    user: publicKey,
                })
                .rpc();

            console.log('Auto-swap config saved:', tx);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save configuration: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auto-swap-config">
            <div className="config-card">
                <div className="card-header">
                    <h3 className="card-title">
                        <span className="icon">🤖</span>
                        Auto-Swap Configuration
                    </h3>
                    <div className="status-badge">
                        {enabled ? (
                            <span className="badge active">Active</span>
                        ) : (
                            <span className="badge inactive">Inactive</span>
                        )}
                    </div>
                </div>

                <p className="card-description">
                    Automatically convert your SOL savings to stablecoins or other tokens when your balance reaches a threshold.
                </p>

                {/* Enable/Disable Toggle */}
                <div className="config-section">
                    <div className="toggle-container">
                        <label className="toggle-label">
                            <span className="toggle-text">Enable Auto-Swap</span>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => setEnabled(e.target.checked)}
                                />
                                <span className="slider"></span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Target Token Selection */}
                <div className="config-section">
                    <label className="section-label">Target Token</label>
                    <p className="section-description">Choose which token to swap your SOL into</p>
                    <div className="token-grid">
                        {SUPPORTED_TOKENS.map(token => (
                            <button
                                key={token.symbol}
                                className={`token-card ${targetToken.symbol === token.symbol ? 'selected' : ''}`}
                                onClick={() => setTargetToken(token)}
                                disabled={!enabled}
                            >
                                <span className="token-icon" style={{ color: token.color }}>
                                    {token.icon}
                                </span>
                                <div className="token-details">
                                    <span className="token-symbol">{token.symbol}</span>
                                    <span className="token-name">{token.name}</span>
                                </div>
                                {targetToken.symbol === token.symbol && (
                                    <span className="check-icon">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minimum Amount */}
                <div className="config-section">
                    <label className="section-label">Minimum Balance Threshold</label>
                    <p className="section-description">Auto-swap triggers when your SOL balance reaches this amount</p>
                    <div className="amount-input-container">
                        <input
                            type="number"
                            className="amount-input"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            disabled={!enabled}
                            step="0.1"
                            min="0.1"
                        />
                        <span className="amount-suffix">SOL</span>
                    </div>
                    <div className="amount-presets">
                        {['0.5', '1.0', '2.0', '5.0'].map(preset => (
                            <button
                                key={preset}
                                className={`preset-btn ${minAmount === preset ? 'active' : ''}`}
                                onClick={() => setMinAmount(preset)}
                                disabled={!enabled}
                            >
                                {preset} SOL
                            </button>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className="info-box">
                    <div className="info-header">
                        <span className="info-icon">💡</span>
                        <span className="info-title">How Auto-Swap Works</span>
                    </div>
                    <ul className="info-list">
                        <li>When your SOL vault balance reaches the threshold, auto-swap triggers</li>
                        <li>Your SOL is automatically swapped to your chosen token</li>
                        <li>Platform fee (0.4%) applies to each swap</li>
                        <li>You can disable auto-swap anytime</li>
                    </ul>
                </div>

                {/* Save Button */}
                <button
                    className={`save-btn ${loading ? 'loading' : ''} ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <span className="icon">✓</span>
                            Saved Successfully!
                        </>
                    ) : (
                        <>
                            <span className="icon">💾</span>
                            Save Configuration
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
        .auto-swap-config {
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .config-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .status-badge {
          display: flex;
        }

        .badge {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
        }

        .badge.inactive {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
        }

        .card-description {
          color: rgba(255,255,255,0.7);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .config-section {
          margin-bottom: 2rem;
        }

        .toggle-container {
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .toggle-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #fff;
        }

        .toggle-switch {
          position: relative;
          width: 60px;
          height: 32px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.2);
          border-radius: 32px;
          transition: 0.3s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 24px;
          width: 24px;
          left: 4px;
          bottom: 4px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        input:checked + .slider {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        input:checked + .slider:before {
          transform: translateX(28px);
        }

        .section-label {
          display: block;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .section-description {
          color: rgba(255,255,255,0.6);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .token-grid {
          display: grid;
          gap: 0.75rem;
        }

        .token-card {
          background: rgba(0,0,0,0.2);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #fff;
        }

        .token-card:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .token-card.selected {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .token-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .token-icon {
          font-size: 2rem;
        }

        .token-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .token-symbol {
          font-weight: 700;
          font-size: 1.125rem;
        }

        .token-name {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
        }

        .check-icon {
          color: #10b981;
          font-size: 1.5rem;
        }

        .amount-input-container {
          position: relative;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .amount-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 600;
          outline: none;
        }

        .amount-input:disabled {
          opacity: 0.5;
        }

        .amount-suffix {
          color: rgba(255,255,255,0.6);
          font-weight: 600;
        }

        .amount-presets {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .preset-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: #fff;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.15);
        }

        .preset-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }

        .preset-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .info-icon {
          font-size: 1.25rem;
        }

        .info-title {
          font-weight: 600;
          color: #60a5fa;
        }

        .info-list {
          margin: 0;
          padding-left: 1.5rem;
          color: rgba(255,255,255,0.8);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .info-list li {
          margin-bottom: 0.5rem;
        }

        .save-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 16px;
          padding: 1.25rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
        }

        .save-btn.saved {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .save-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .auto-swap-config {
            padding: 1rem;
          }

          .config-card {
            padding: 1.5rem;
          }

          .amount-presets {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </div>
    );
}
