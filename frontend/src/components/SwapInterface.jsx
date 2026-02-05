import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useJupiterSwap } from '../hooks/useJupiterSwap';

// Token list - will expand this in Phase 2
const SUPPORTED_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    icon: '◎',
    color: '#14F195'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    icon: '$',
    color: '#2775CA'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    icon: '₮',
    color: '#26A17B'
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    icon: '🐕',
    color: '#FF6B35'
  }
];

export default function SwapInterface({ program, userConfig }) {
  const { publicKey } = useWallet();
  const { getQuote, executeSwap, loading: jupiterLoading, error: jupiterError } = useJupiterSwap();

  const [fromToken, setFromToken] = useState(SUPPORTED_TOKENS[0]); // SOL
  const [toToken, setToToken] = useState(SUPPORTED_TOKENS[1]); // USDC
  const [amount, setAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [priceImpact, setPriceImpact] = useState(0);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // Swap tokens
  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
    setEstimatedOutput('0');
    setQuoteError(null);
  };

  // Fetch real quote from Jupiter when amount changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setEstimatedOutput('0');
        setCurrentQuote(null);
        setPriceImpact(0);
        return;
      }

      setFetchingQuote(true);
      setQuoteError(null);
      try {
        // Convert amount to smallest unit (lamports/token decimals)
        const amountInSmallestUnit = Math.floor(
          parseFloat(amount) * Math.pow(10, fromToken.decimals)
        );

        const quote = await getQuote(
          fromToken.mint,
          toToken.mint,
          amountInSmallestUnit,
          slippage * 100 // Convert to basis points
        );

        if (quote) {
          setCurrentQuote(quote);
          // Convert output amount back to human-readable
          const outputAmount = quote.outAmount / Math.pow(10, toToken.decimals);
          setEstimatedOutput(outputAmount.toFixed(toToken.decimals));
          setPriceImpact(quote.priceImpactPct || 0);
          setQuoteError(null);
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        setEstimatedOutput('0');
        setCurrentQuote(null);
        setQuoteError('Failed to fetch price. Liquidity may be low on Devnet.');
      } finally {
        setFetchingQuote(false);
      }
    };

    // Debounce quote fetching
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, fromToken, toToken, slippage, getQuote]);

  const handleSwap = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!currentQuote) {
      alert('No quote available. Please enter an amount.');
      return;
    }

    setLoading(true);
    try {
      // Execute swap using Jupiter
      const result = await executeSwap(currentQuote);

      console.log('Swap successful!', result);
      alert(`Swap successful! Transaction: ${result.signature}`);

      // Reset form
      setAmount('');
      setEstimatedOutput('0');
      setCurrentQuote(null);
    } catch (error) {
      console.error('Swap error:', error);
      alert(`Swap failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="swap-container">
      <div className="swap-card">
        {/* Header */}
        <div className="swap-header">
          <h2 className="swap-title">
            <span className="icon">🔄</span>
            Swap Tokens
          </h2>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-panel">
            <div className="setting-item">
              <label>Slippage Tolerance</label>
              <div className="slippage-options">
                {[0.1, 0.5, 1.0].map(value => (
                  <button
                    key={value}
                    className={`slippage-btn ${slippage === value ? 'active' : ''}`}
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  className="slippage-input"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="token-input-container">
          <div className="token-input-header">
            <span className="label">From</span>
            <span className="balance">Balance: 0.00</span>
          </div>
          <div className="token-input">
            <input
              type="number"
              className="amount-input"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TokenSelector
              selected={fromToken}
              tokens={SUPPORTED_TOKENS}
              onChange={setFromToken}
              exclude={toToken}
            />
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="swap-direction">
          <button className="swap-direction-btn" onClick={handleSwapDirection}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 14L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div className="token-input-container">
          <div className="token-input-header">
            <span className="label">To (estimated)</span>
            <span className="balance">Balance: 0.00</span>
          </div>
          <div className="token-input">
            <input
              type="text"
              className="amount-input"
              placeholder="0.0"
              value={estimatedOutput}
              readOnly
            />
            <TokenSelector
              selected={toToken}
              tokens={SUPPORTED_TOKENS}
              onChange={setToToken}
              exclude={fromToken}
            />
          </div>
        </div>

        {/* Swap Details */}
        {amount && parseFloat(amount) > 0 && (
          <div className="swap-details">
            {fetchingQuote ? (
              <div className="detail-row">
                <span>Fetching best price...</span>
                <span className="spinner-small"></span>
              </div>
            ) : quoteError ? (
              <div className="detail-row error-message">
                <span style={{ color: '#ff6b6b' }}>{quoteError}</span>
              </div>
            ) : (
              <>
                <div className="detail-row">
                  <span>Rate</span>
                  <span>1 {fromToken.symbol} ≈ {(parseFloat(estimatedOutput) / parseFloat(amount)).toFixed(4)} {toToken.symbol}</span>
                </div>
                {priceImpact > 0 && (
                  <div className="detail-row">
                    <span>Price Impact</span>
                    <span className={priceImpact > 1 ? 'text-warning' : ''}>{priceImpact.toFixed(2)}%</span>
                  </div>
                )}
                <div className="detail-row">
                  <span>Minimum Received</span>
                  <span>{(parseFloat(estimatedOutput) * (1 - slippage / 100)).toFixed(toToken.decimals)} {toToken.symbol}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Swap Button */}
        <button
          className={`swap-btn ${loading ? 'loading' : ''} ${!amount || parseFloat(amount) <= 0 ? 'disabled' : ''}`}
          onClick={handleSwap}
          disabled={!amount || parseFloat(amount) <= 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Swapping...
            </>
          ) : (
            <>
              <span className="icon">⚡</span>
              Swap Tokens
            </>
          )}
        </button>

        {/* Jupiter Powered Badge */}
        <div className="jupiter-badge">
          <span className="badge-icon">⚡</span>
          <span className="badge-text">
            Powered by Jupiter Aggregator
          </span>
        </div>
      </div>

      <style jsx>{`
        .swap-container {
          display: flex;
          justify-content: center;
          padding: 1rem;
          min-height: 500px;
        }

        .swap-card {
          background: linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(30, 30, 45, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 1.5rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .swap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .swap-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .settings-btn {
          background: transparent;
          border: none;
          padding: 0.5rem;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s;
        }
        .settings-btn:hover { color: #fff; transform: rotate(45deg); }

        .settings-panel {
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .setting-item label {
          display: block;
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .slippage-options {
          display: flex;
          gap: 0.5rem;
        }

        .slippage-btn {
          flex: 1;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slippage-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }

        .slippage-input {
          flex: 1;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: #fff;
          text-align: center;
        }

        .token-input-container {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 0.25rem;
          transition: border-color 0.2s;
        }
        .token-input-container:hover {
          border-color: rgba(255,255,255,0.1);
        }

        .token-input-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
        }

        .token-input {
          display: flex;
          justify-content: space-between; /* Input left, Selector right */
          align-items: center;
        }

        .amount-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.75rem;
          font-weight: 600;
          outline: none;
          width: 100%;
          min-width: 0; /* Prevent overflow */
        }

        .amount-input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .swap-direction {
          display: flex;
          justify-content: center;
          margin: -12px 0;
          position: relative;
          z-index: 10;
          height: 24px;
        }

        .swap-direction-btn {
          background: #1a1b23;
          border: 4px solid #0f0f15;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #667eea;
        }
        .swap-direction-btn:hover {
           background: #2a2b36;
        }

        .swap-details {
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
        }

        .detail-row:not(:last-child) {
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .swap-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 16px;
          padding: 1rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .swap-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
        }

        .swap-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .swap-btn.loading {
          opacity: 0.8;
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

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        .text-warning {
          color: #ffc107;
        }

        .jupiter-badge {
          background: linear-gradient(135deg, rgba(199, 242, 132, 0.1) 0%, rgba(0, 184, 169, 0.1) 100%);
          border: 1px solid rgba(199, 242, 132, 0.3);
          border-radius: 12px;
          padding: 0.75rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #c7f284;
        }

        .badge-icon {
          font-size: 1.2rem;
        }

        .phase-notice {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 12px;
          padding: 0.75rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #ffc107;
        }

        @media (max-width: 640px) {
          .swap-card {
            padding: 1.5rem;
          }

          .amount-input {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

// Token Selector Component
function TokenSelector({ selected, tokens, onChange, exclude }) {
  const [isOpen, setIsOpen] = useState(false);

  const availableTokens = tokens.filter(t => t.symbol !== exclude?.symbol);

  return (
    <div className="token-selector">
      <button
        className="token-select-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="token-icon" style={{ color: selected.color }}>
          {selected.icon}
        </span>
        <span className="token-symbol">{selected.symbol}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="token-dropdown">
          {availableTokens.map(token => (
            <button
              key={token.symbol}
              className="token-option"
              onClick={() => {
                onChange(token);
                setIsOpen(false);
              }}
            >
              <span className="token-icon" style={{ color: token.color }}>
                {token.icon}
              </span>
              <div className="token-info">
                <span className="token-symbol">{token.symbol}</span>
                <span className="token-name">{token.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .token-selector {
          position: relative;
        }

        .token-select-btn {
          background: rgba(255,255,255,0.1);
          border-radius: 99px;
          padding: 0.4rem 0.8rem 0.4rem 0.6rem; 
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
          color: #fff;
          font-weight: 600;
          flex-shrink: 0;
        }
        .token-select-btn:hover { background: rgba(255,255,255,0.2); }

        .token-icon {
          font-size: 1.25rem;
        }

        .token-symbol { font-size: 1.1rem; }
        .dropdown-arrow { font-size: 0.6rem; opacity: 0.5; }

        .token-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: #1c1c2a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.5rem;
          width: 240px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          z-index: 100;
          margin-top: 0.5rem;
        }

        .token-option {
          width: 100%;
          background: transparent;
          border: none;
          border-radius: 12px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #fff;
        }

        .token-option:hover {
          background: rgba(255,255,255,0.1);
        }

        .token-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .token-symbol {
          font-weight: 600;
        }

        .token-name {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
        }
      `}</style>
    </div>
  );
}
