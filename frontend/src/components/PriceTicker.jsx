import React, { useState, useEffect } from 'react';

const PriceTicker = () => {
    const [prices, setPrices] = useState({
        solana: { usd: 0, usd_24h_change: 0 },
        bitcoin: { usd: 0, usd_24h_change: 0 },
        ethereum: { usd: 0, usd_24h_change: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
                const data = await response.json();
                setPrices(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch prices:', error);
                // Fallback / Simulated data if API fails (rate limits)
                setPrices({
                    solana: { usd: 145.20, usd_24h_change: 2.5 },
                    bitcoin: { usd: 95400.00, usd_24h_change: -1.2 },
                    ethereum: { usd: 2850.00, usd_24h_change: 0.8 }
                });
                setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (val) => val ? `$${val.toLocaleString()}` : '...';
    const formatChange = (val) => {
        if (!val) return null;
        const color = val >= 0 ? 'text-green-400' : 'text-red-400';
        const sign = val >= 0 ? '+' : '';
        return <span className={color}>{sign}{val.toFixed(2)}%</span>;
    };

    if (loading) return null;

    return (
        <div className="w-full bg-slate-900 border-b border-white/5 py-2 overflow-hidden">
            <div className="flex justify-center gap-8 text-xs font-mono text-slate-400 slider-animate">
                {/* Simple flex row for now, marquee animation css can be added later if needed */}
                <div className="flex gap-2">
                    <span className="font-bold text-white">SOL</span>
                    <span>{formatPrice(prices.solana.usd)}</span>
                    {formatChange(prices.solana.usd_24h_change)}
                </div>
                <div className="w-px h-4 bg-white/10 mx-2 hidden sm:block"></div>
                <div className="flex gap-2 hidden sm:flex">
                    <span className="font-bold text-white">BTC</span>
                    <span>{formatPrice(prices.bitcoin.usd)}</span>
                    {formatChange(prices.bitcoin.usd_24h_change)}
                </div>
                <div className="w-px h-4 bg-white/10 mx-2 hidden sm:block"></div>
                <div className="flex gap-2 hidden sm:flex">
                    <span className="font-bold text-white">ETH</span>
                    <span>{formatPrice(prices.ethereum.usd)}</span>
                    {formatChange(prices.ethereum.usd_24h_change)}
                </div>
            </div>
        </div>
    );
};

export default PriceTicker;
