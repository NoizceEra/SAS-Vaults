import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { AutoSavings } from './types/auto_savings';
import idl from './idl/auto_savings.json';

// Program ID - Deployed to Devnet
const PROGRAM_ID = new PublicKey('GzAdCQF3AiCKeduYgRtok77czGBKcAragigtmWurXHcc');

export class AutoSavingsClient {
    private program: Program<AutoSavings>;
    private provider: AnchorProvider;

    constructor(connection: Connection, wallet: any) {
        this.provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
        this.program = new Program(idl as AutoSavings, PROGRAM_ID, this.provider);
    }

    /**
     * Derive the user's config PDA
     */
    getUserConfigPDA(userPublicKey: PublicKey): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('config'), userPublicKey.toBuffer()],
            this.program.programId
        );
    }

    /**
     * Derive the user's vault PDA
     */
    getVaultPDA(userPublicKey: PublicKey): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), userPublicKey.toBuffer()],
            this.program.programId
        );
    }

    /**
     * Initialize a new user account
     */
    async initializeUser(savingsRate: number): Promise<string> {
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
    async updateSavingsRate(newRate: number): Promise<string> {
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
    async deposit(amountSOL: number): Promise<string> {
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
    async withdraw(amountSOL: number): Promise<string> {
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
    async processTransfer(transferAmountSOL: number): Promise<string> {
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
    async deactivate(): Promise<string> {
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
    async reactivate(): Promise<string> {
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
    async getUserConfig(userPublicKey?: PublicKey) {
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
    async getVaultBalance(userPublicKey?: PublicKey): Promise<number> {
        const pubkey = userPublicKey || this.provider.wallet.publicKey;
        const [vaultPDA] = this.getVaultPDA(pubkey);

        const balance = await this.provider.connection.getBalance(vaultPDA);
        return balance / LAMPORTS_PER_SOL;
    }

    /**
     * Get user's main wallet balance
     */
    async getWalletBalance(userPublicKey?: PublicKey): Promise<number> {
        const pubkey = userPublicKey || this.provider.wallet.publicKey;
        const balance = await this.provider.connection.getBalance(pubkey);
        return balance / LAMPORTS_PER_SOL;
    }

    /**
     * Check if user is initialized
     */
    async isUserInitialized(userPublicKey?: PublicKey): Promise<boolean> {
        const config = await this.getUserConfig(userPublicKey);
        return config !== null;
    }

    /**
     * Calculate savings amount for a given transfer
     */
    calculateSavingsAmount(transferAmount: number, savingsRate: number): number {
        return (transferAmount * savingsRate) / 100;
    }

    /**
     * Get program statistics (for dashboard)
     */
    async getProgramStats() {
        // This would require additional on-chain state tracking
        // For now, return placeholder data
        return {
            totalUsers: 0,
            totalValueLocked: 0,
            averageSavingsRate: 0,
        };
    }
}

// Export types
export interface UserConfig {
    owner: PublicKey;
    savingsRate: number;
    totalSaved: number;
    totalWithdrawn: number;
    transactionCount: number;
    isActive: boolean;
    bump: number;
}

// Helper function to create client instance
export function createAutoSavingsClient(
    connection: Connection,
    wallet: any
): AutoSavingsClient {
    return new AutoSavingsClient(connection, wallet);
}
