import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { useState, useCallback } from 'react';

/**
 * Hook for Jupiter swap integration
 * Uses Jupiter V6 API for quotes and swap execution
 */
export function useJupiterSwap() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Get a quote from Jupiter
     * @param {string} inputMint - Input token mint address
     * @param {string} outputMint - Output token mint address  
     * @param {number} amount - Amount in smallest unit (lamports/token decimals)
     * @param {number} slippageBps - Slippage in basis points (50 = 0.5%)
     */
    const getQuote = useCallback(async (inputMint, outputMint, amount, slippageBps = 50) => {
        try {
            setError(null);

            const quoteResponse = await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
            );

            if (!quoteResponse.ok) {
                throw new Error('Failed to get quote from Jupiter');
            }

            const quote = await quoteResponse.json();
            return quote;
        } catch (err) {
            console.error('Jupiter quote error:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Execute a swap using Jupiter
     * @param {object} quote - Quote object from getQuote
     */
    const executeSwap = useCallback(async (quote) => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            throw new Error('Wallet not connected');
        }

        setLoading(true);
        setError(null);

        try {
            // Get swap transaction from Jupiter
            const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quoteResponse: quote,
                    userPublicKey: wallet.publicKey.toString(),
                    wrapAndUnwrapSol: true,
                    // Use direct routing for better prices
                    dynamicComputeUnitLimit: true,
                    prioritizationFeeLamports: 'auto'
                })
            });

            if (!swapResponse.ok) {
                throw new Error('Failed to get swap transaction');
            }

            const { swapTransaction } = await swapResponse.json();

            // Deserialize the transaction
            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

            // Sign and send transaction
            const signedTransaction = await wallet.signTransaction(transaction);
            const rawTransaction = signedTransaction.serialize();

            const txid = await connection.sendRawTransaction(rawTransaction, {
                skipPreflight: false,
                maxRetries: 2
            });

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction(txid, 'confirmed');

            if (confirmation.value.err) {
                throw new Error('Transaction failed');
            }

            return {
                signature: txid,
                inputAmount: quote.inAmount,
                outputAmount: quote.outAmount,
                inputMint: quote.inputMint,
                outputMint: quote.outputMint
            };
        } catch (err) {
            console.error('Jupiter swap error:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [wallet, connection]);

    /**
     * Get price for a token pair
     * @param {string} inputMint
     * @param {string} outputMint
     * @param {number} amount - Amount in smallest unit
     */
    const getPrice = useCallback(async (inputMint, outputMint, amount) => {
        try {
            const quote = await getQuote(inputMint, outputMint, amount);
            const price = quote.outAmount / quote.inAmount;
            return {
                price,
                priceImpact: quote.priceImpactPct,
                route: quote.routePlan
            };
        } catch (err) {
            console.error('Price fetch error:', err);
            return null;
        }
    }, [getQuote]);

    return {
        getQuote,
        executeSwap,
        getPrice,
        loading,
        error
    };
}
