import React from 'react';

/**
 * BalanceCard Component
 * Displays SOL balance with glassmorphism effect
 * Matches the design from dashboard_main_view.png
 */
export const BalanceCard = ({
    label,
    value,
    change,
    variant = 'default',
    icon
}) => {
    const variantClasses = {
        primary: 'balance-card balance-card-primary',
        savings: 'balance-card balance-card-savings',
        spending: 'balance-card balance-card-spending',
        default: 'balance-card'
    };

    return (
        <div className={`${variantClasses[variant]} animate-slide-up`}>
            <div className="card-label">
                {icon && <span className="mr-2">{icon}</span>}
                {label}
            </div>
            <div className="card-value">
                {value} SOL
            </div>
            {change && (
                <div className="card-change">
                    {change > 0 ? '+' : ''}{change} SOL today
                </div>
            )}
        </div>
    );
};

export default BalanceCard;
