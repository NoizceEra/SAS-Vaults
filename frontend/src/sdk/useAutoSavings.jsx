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
    const [userConfig, setUserConfig] = useState(null);
    const [vaultBalance, setVaultBalance] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loading, setLoading] = useState(false);

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
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initialize user account
     */
    const initializeUser = async (savingsRate) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.initializeUser(savingsRate);
            console.log('User initialized:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error initializing user:', error);
            throw error;
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
    const withdraw = async (amount) => {
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
        userConfig,
        vaultBalance,
        walletBalance,
        isInitialized,
        loading,
        isConnected: wallet.connected,

        // Actions
        initializeUser,
        updateSavingsRate,
        deposit,
        withdraw,
        processTransfer,
        calculateSavings,
        refresh: loadUserData,
    };
}
