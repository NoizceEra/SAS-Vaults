import {
    Connection,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import idl from '../idl/auto_savings.json';

// Program ID - read from Vite env `VITE_PROGRAM_ID` with fallback to deployed ID
const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID || '8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR');

export class AutoSavingsClient {
    constructor(connection, wallet) {
        this.provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
        this.program = new Program(idl, PROGRAM_ID, this.provider);
    }

    /**
     * Derive the user's config PDA
     */
    getUserConfigPDA(userPublicKey) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('config'), userPublicKey.toBuffer()],
            this.program.programId
        );
    }

    /**
     * Derive the user's vault PDA
     */
    getVaultPDA(userPublicKey) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), userPublicKey.toBuffer()],
            this.program.programId
        );
    }

    /**
     * Initialize a new user account
     */
    async initializeUser(savingsRate) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);

        const tx = await this.program.methods
            .initializeUser(savingsRate)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                user: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    /**
     * Update the user's savings rate
     */
    async updateSavingsRate(newRate) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);

        const tx = await this.program.methods
            .updateSavingsRate(newRate)
            .accounts({
                userConfig: userConfigPDA,
                user: userPublicKey,
                owner: userPublicKey,
            })
            .rpc();

        return tx;
    }

    /**
     * Deposit SOL to the savings vault
     */
    async deposit(amountSOL) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);

        const amountLamports = new BN(amountSOL * LAMPORTS_PER_SOL);

        const tx = await this.program.methods
            .deposit(amountLamports)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                user: userPublicKey,
                owner: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    /**
     * Withdraw SOL from the savings vault
     */
    async withdraw(amountSOL) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);

        const amountLamports = new BN(amountSOL * LAMPORTS_PER_SOL);

        const tx = await this.program.methods
            .withdraw(amountLamports)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                user: userPublicKey,
                owner: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    /**
     * Process a transfer with auto-save
     */
    async processTransfer(transferAmountSOL) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);

        const transferAmountLamports = new BN(transferAmountSOL * LAMPORTS_PER_SOL);

        const tx = await this.program.methods
            .processTransfer(transferAmountLamports)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                user: userPublicKey,
                owner: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    /**
     * Deactivate the user's account
     */
    async deactivate() {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);

        const tx = await this.program.methods
            .deactivate()
            .accounts({
                userConfig: userConfigPDA,
                user: userPublicKey,
                owner: userPublicKey,
            })
            .rpc();

        return tx;
    }

    /**
     * Reactivate the user's account
     */
    async reactivate() {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);

        const tx = await this.program.methods
            .reactivate()
            .accounts({
                userConfig: userConfigPDA,
                user: userPublicKey,
                owner: userPublicKey,
            })
            .rpc();

        return tx;
    }

    /**
     * Get user configuration
     */
    async getUserConfig(userPublicKey) {
        const pubkey = userPublicKey || this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(pubkey);

        try {
            const config = await this.program.account.userConfig.fetch(userConfigPDA);
            return {
                owner: config.owner,
                savingsRate: config.savingsRate,
                totalSaved: config.totalSaved.toNumber() / LAMPORTS_PER_SOL,
                totalWithdrawn: config.totalWithdrawn.toNumber() / LAMPORTS_PER_SOL,
                transactionCount: config.transactionCount.toNumber(),
                isActive: config.isActive,
                bump: config.bump,
            };
        } catch (error) {
            return null; // User not initialized
        }
    }

    /**
     * Get vault balance
     */
    async getVaultBalance(userPublicKey) {
        const pubkey = userPublicKey || this.provider.wallet.publicKey;
        const [vaultPDA] = this.getVaultPDA(pubkey);

        const balance = await this.provider.connection.getBalance(vaultPDA);
        return balance / LAMPORTS_PER_SOL;
    }

    /**
     * Get user's main wallet balance
     */
    async getWalletBalance(userPublicKey) {
        const pubkey = userPublicKey || this.provider.wallet.publicKey;
        const balance = await this.provider.connection.getBalance(pubkey);
        return balance / LAMPORTS_PER_SOL;
    }

    /**
     * Check if user is initialized
     */
    async isUserInitialized(userPublicKey) {
        const config = await this.getUserConfig(userPublicKey);
        return config !== null;
    }

    /**
     * Calculate savings amount for a given transfer
     */
    calculateSavingsAmount(transferAmount, savingsRate) {
        return (transferAmount * savingsRate) / 100;
    }
}

// Helper function to create client instance
export function createAutoSavingsClient(connection, wallet) {
    return new AutoSavingsClient(connection, wallet);
}
