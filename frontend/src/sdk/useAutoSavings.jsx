import { useState, useEffect } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AutoSavingsClient } from './client';

/**
 * React Hook for Auto-Savings Protocol Integration
 * 
 * This hook provides all the functionality needed to integrate
 * the Auto-Savings Protocol into your React application.
 */
export function useAutoSavings() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [client, setClient] = useState(null);
    const [vault, setVault] = useState(null);
    const [userConfig, setUserConfig] = useState(null);
    const [vaultBalance, setVaultBalance] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Initialize client when wallet connects
    useEffect(() => {
        if (wallet.connected && wallet.publicKey && connection) {
            try {
                const newClient = new AutoSavingsClient(connection, wallet);
                setClient(newClient);
            } catch (error) {
                console.error('Error creating client:', error);
                setClient(null);
            }
        } else {
            setClient(null);
            setVault(null);
            setUserConfig(null);
            setIsInitialized(false);
        }
    }, [wallet.connected, wallet.publicKey, connection]);

    // Load user data when client is ready
    useEffect(() => {
        if (client && wallet.publicKey) {
            loadUserData();
        }
    }, [client, wallet.publicKey]);

    /**
     * Load all user data
     */
    const loadUserData = async () => {
        if (!client || !wallet.publicKey) return;

        try {
            setLoading(true);

            // Check if user is initialized
            const initialized = await client.isUserInitialized();
            setIsInitialized(initialized);

            if (initialized) {
                // Load user config
                const config = await client.getUserConfig();
                setUserConfig(config);

                // Create vault object for components
                setVault({
                    savingsBalance: config.savingsBalance || 0,
                    spendingBalance: config.spendingBalance || 0,
                    savingsRate: config.savingsRate || 50,
                    totalDeposited: config.totalDeposited || 0,
                    totalWithdrawn: config.totalWithdrawn || 0,
                });

                // Load balances
                const vaultBal = await client.getVaultBalance();
                const walletBal = await client.getWalletBalance();
                setVaultBalance(vaultBal);
                setWalletBalance(walletBal);
            } else {
                // Just load wallet balance
                const walletBal = await client.getWalletBalance();
                setWalletBalance(walletBal);
                setVaultBalance(0);
                setVault(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
            setInitializing(false);
        }
    };

    /**
     * Initialize user account
     */
    const initializeUser = async (savingsRate) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);

            // Check wallet balance first
            const balance = await client.getWalletBalance();
            const MIN_BALANCE = 0.003; // Minimum SOL needed for vault creation

            // If on Devnet and balance is too low, try to airdrop
            if (balance < MIN_BALANCE) {
                try {
                    // Check if we're on devnet by looking at the RPC URL
                    const endpoint = connection.rpcEndpoint;
                    const isDevnet = endpoint.includes('devnet');

                    if (isDevnet) {
                        console.log('Low balance detected, requesting airdrop...');
                        const airdropSignature = await connection.requestAirdrop(
                            wallet.publicKey,
                            0.5 * 1e9 // 0.5 SOL
                        );

                        // Wait for airdrop confirmation
                        await connection.confirmTransaction(airdropSignature);
                        console.log('Airdrop successful!');

                        // Wait a bit for balance to update
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else {
                        throw new Error(
                            `Insufficient SOL balance. You need at least ${MIN_BALANCE} SOL to create a vault. Current balance: ${balance.toFixed(4)} SOL. Please add funds to your wallet.`
                        );
                    }
                } catch (airdropError) {
                    console.error('Airdrop failed:', airdropError);
                    // If airdrop fails, throw a helpful error
                    throw new Error(
                        `Insufficient SOL balance (${balance.toFixed(4)} SOL). You need at least ${MIN_BALANCE} SOL. ` +
                        `Please get Devnet SOL from https://faucet.solana.com or switch to a wallet with funds.`
                    );
                }
            }

            // Attempt to initialize user
            const signature = await client.initializeUser(savingsRate);
            console.log('User initialized:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error initializing user:', error);

            // Provide user-friendly error messages
            let userMessage = error.message;

            if (error.message?.includes('User rejected')) {
                userMessage = 'Transaction was rejected. Please approve the transaction in your wallet to continue.';
            } else if (error.message?.includes('insufficient')) {
                userMessage = 'Insufficient SOL balance. Please add funds to your wallet and try again.';
            } else if (error.message?.includes('blockhash')) {
                userMessage = 'Network error: Transaction expired. Please try again.';
            } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
                userMessage = 'Network timeout. The Devnet RPC is slow. Please try again in a moment.';
            } else if (error.message?.includes('429')) {
                userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (!error.message?.includes('SOL')) {
                // Only override if it's not already a custom message
                userMessage = 'Failed to create vault. Please ensure you are connected to Devnet and try again.';
            }

            throw new Error(userMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update savings rate
     */
    const updateSavingsRate = async (newRate) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.updateSavingsRate(newRate);
            console.log('Savings rate updated:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error updating savings rate:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Deposit to vault
     */
    const deposit = async (amount) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.deposit(amount);
            console.log('Deposit successful:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error depositing:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Withdraw from vault
     */
    const withdraw = async (amount, fromSavings = true) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.withdraw(amount);
            console.log('Withdrawal successful:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error withdrawing:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Process transfer with auto-save
     */
    const processTransfer = async (transferAmount) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.processTransfer(transferAmount);
            console.log('Transfer processed:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error processing transfer:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Calculate how much will be saved for a given transfer
     */
    const calculateSavings = (transferAmount) => {
        if (!userConfig) return 0;
        return (transferAmount * userConfig.savingsRate) / 100;
    };

    return {
        // State
        client,
        vault,
        userConfig,
        vaultBalance,
        walletBalance,
        isInitialized,
        loading,
        initializing,
        isConnected: wallet.connected,

        // Actions
        initializeUser,
        initializeVault: initializeUser, // Alias for App.jsx
        updateSavingsRate,
        deposit,
        withdraw,
        processTransfer,
        calculateSavings,
        refresh: loadUserData,
        refreshVault: loadUserData, // Alias for App.jsx
    };
}
