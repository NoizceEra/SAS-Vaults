import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export default function TokenVaultDashboard({ program, connection }) {
    const { publicKey } = useWallet();
    const [vaults, setVaults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        if (publicKey && program) {
            loadVaults();
        }
    }, [publicKey, program]);

    const loadVaults = async () => {
        setLoading(true);
        try {
            // TODO: Fetch actual vault data from blockchain
            // For now, using mock data
            const mockVaults = [
                {
                    symbol: 'USDC',
                    name: 'USD Coin',
                    icon: '$',
                    color: '#2775CA',
                    balance: 0,
                    value: 0,
                    change24h: 0,
                },
                {
                    symbol: 'USDT',
                    name: 'Tether USD',
                    icon: '₮',
                    color: '#26A17B',
                    balance: 0,
                    value: 0,
                    change24h: 0,
                },
                {
                    symbol: 'BONK',
                    name: 'Bonk',
                    icon: '🐕',
                    color: '#FF6B35',
                    balance: 0,
                    value: 0,
                    change24h: 0,
                },
            ];

            setVaults(mockVaults);
            setTotalValue(mockVaults.reduce((sum, v) => sum + v.value, 0));
        } catch (error) {
            console.error('Error loading vaults:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vault-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h2 className="dashboard-title">
                        <span className="icon">🏦</span>
                        Token Vaults
                    </h2>
                    <button className="refresh-btn" onClick={loadVaults} disabled={loading}>
                        <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
                    </button>
                </div>

                <div className="total-value-card">
                    <span className="total-label">Total Portfolio Value</span>
                    <span className="total-amount">${totalValue.toFixed(2)}</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading your vaults...</p>
                </div>
            ) : vaults.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📦</span>
                    <h3>No Token Vaults Yet</h3>
                    <p>Start by swapping SOL to create your first token vault</p>
                </div>
            ) : (
                <div className="vaults-grid">
                    {vaults.map(vault => (
                        <VaultCard key={vault.symbol} vault={vault} />
                    ))}
                </div>
            )}

            <style jsx>{`
        .vault-dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }

        .refresh-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.2);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 1.25rem;
          display: inline-block;
        }

        .refresh-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .total-value-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
        }

        .total-label {
          color: rgba(255,255,255,0.9);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .total-amount {
          color: #fff;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: rgba(255,255,255,0.7);
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .empty-state {
          background: rgba(255,255,255,0.05);
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          color: rgba(255,255,255,0.7);
        }

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .vaults-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .vault-dashboard {
            padding: 1rem;
          }

          .dashboard-title {
            font-size: 1.5rem;
          }

          .total-amount {
            font-size: 2rem;
          }

          .vaults-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

function VaultCard({ vault }) {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="vault-card">
            <div className="vault-header">
                <div className="token-info">
                    <span className="token-icon" style={{ color: vault.color }}>
                        {vault.icon}
                    </span>
                    <div className="token-details">
                        <span className="token-symbol">{vault.symbol}</span>
                        <span className="token-name">{vault.name}</span>
                    </div>
                </div>
                <button
                    className="actions-btn"
                    onClick={() => setShowActions(!showActions)}
                >
                    ⋮
                </button>
            </div>

            <div className="vault-balance">
                <span className="balance-label">Balance</span>
                <span className="balance-amount">
                    {vault.balance.toLocaleString()} {vault.symbol}
                </span>
                <span className="balance-value">${vault.value.toFixed(2)}</span>
            </div>

            <div className="vault-stats">
                <div className="stat">
                    <span className="stat-label">24h Change</span>
                    <span className={`stat-value ${vault.change24h >= 0 ? 'positive' : 'negative'}`}>
                        {vault.change24h >= 0 ? '+' : ''}{vault.change24h.toFixed(2)}%
                    </span>
                </div>
            </div>

            {showActions && (
                <div className="actions-menu">
                    <button className="action-btn">
                        <span className="action-icon">💸</span>
                        Withdraw
                    </button>
                    <button className="action-btn">
                        <span className="action-icon">🔄</span>
                        Swap
                    </button>
                    <button className="action-btn">
                        <span className="action-icon">📊</span>
                        View History
                    </button>
                </div>
            )}

            <style jsx>{`
        .vault-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .vault-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .vault-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .token-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .token-icon {
          font-size: 2rem;
        }

        .token-details {
          display: flex;
          flex-direction: column;
        }

        .token-symbol {
          font-weight: 700;
          font-size: 1.125rem;
          color: #fff;
        }

        .token-name {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
        }

        .actions-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 8px;
          padding: 0.5rem;
          color: #fff;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .actions-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .vault-balance {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .balance-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
        }

        .balance-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .balance-value {
          font-size: 1rem;
          color: rgba(255,255,255,0.7);
        }

        .vault-stats {
          display: grid;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
        }

        .stat-value {
          font-weight: 600;
        }

        .stat-value.positive {
          color: #10b981;
        }

        .stat-value.negative {
          color: #ef4444;
        }

        .actions-menu {
          position: absolute;
          top: 100%;
          right: 1.5rem;
          margin-top: 0.5rem;
          background: rgba(26, 26, 46, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.5rem;
          min-width: 160px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
          z-index: 10;
        }

        .action-btn {
          width: 100%;
          background: transparent;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .action-icon {
          font-size: 1.125rem;
        }
      `}</style>
        </div>
    );
}
