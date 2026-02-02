import React from 'react';

/**
 * TransactionList Component
 * Displays recent transactions with icons and amounts
 * Matches the design from dashboard_main_view.png
 */
export const TransactionList = ({ transactions = [] }) => {
    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit':
                return { icon: '↓', className: 'tx-icon-deposit' };
            case 'withdrawal':
                return { icon: '↑', className: 'tx-icon-withdrawal' };
            case 'auto-save':
                return { icon: '↑', className: 'tx-icon-auto-save' };
            default:
                return { icon: '•', className: 'tx-icon-auto-save' };
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatType = (type) => {
        return type.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('-');
    };

    if (transactions.length === 0) {
        return (
            <div className="transaction-list">
                <div className="p-8 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <div className="text-secondary">No transactions yet</div>
                    <div className="text-sm text-tertiary mt-1">
                        Make your first deposit to start saving!
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="transaction-list">
            {transactions.map((tx, index) => {
                const { icon, className } = getTransactionIcon(tx.type);
                const isPositive = tx.type === 'deposit' || tx.type === 'auto-save';

                return (
                    <div key={tx.signature || index} className="transaction-item">
                        <div className={`tx-icon ${className}`}>
                            {icon}
                        </div>

                        <div className="tx-details">
                            <div className="tx-type">{formatType(tx.type)}</div>
                            <div className="tx-date">{formatDate(tx.timestamp)}</div>
                        </div>

                        <div className={`tx-amount ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} SOL
                        </div>

                        {tx.signature && (
                            <button
                                className="tx-view"
                                onClick={() => window.open(
                                    `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`,
                                    '_blank'
                                )}
                            >
                                View
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
