import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AutoSavingsClient } from './client';

/**
 * React Hook for Auto-Savings Protocol Integration
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
                    totalSaved: config.totalSaved || 0,
                    isActive: true
                });

                // Load balances
                const vaultBal = await client.getVaultBalance();
                const walletBal = await client.getWalletBalance();
                setVaultBalance(vaultBal);
                setWalletBalance(walletBal);
            } else {
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
     * Activate user account
     */
    const activateUser = async () => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.activateUser();
            console.log('Protocol activated:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error activating protocol:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save SOL to vault
     */
    const saveSol = async (amount) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.saveSol(amount);
            console.log('Save successful:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error saving SOL:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Withdraw SOL from vault
     */
    const withdrawSol = async (amount) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            const signature = await client.withdrawSol(amount);
            console.log('Withdrawal successful:', signature);
            await loadUserData();
            return signature;
        } catch (error) {
            console.error('Error withdrawing SOL:', error);
            throw error;
        } finally {
            setLoading(false);
        }
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
        activateUser,
        initializeVault: activateUser, // Alias for compatibility
        saveSol,
        deposit: saveSol, // Alias for compatibility
        withdrawSol,
        withdraw: withdrawSol, // Alias for compatibility
        refresh: loadUserData,
        refreshVault: loadUserData, // Alias for compatibility
    };
}
