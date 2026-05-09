import {
    Connection,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { IDL } from '../idl/idl.js';

// Program ID - read from Vite env `VITE_PROGRAM_ID`, then IDL.metadata.address, then fallback
const programIdString = import.meta.env.VITE_PROGRAM_ID || IDL?.metadata?.address || 'FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn';
const PROGRAM_ID = new PublicKey(programIdString);

export class AutoSavingsClient {
    constructor(connection, wallet) {
        if (!connection) throw new Error('Connection is required');
        if (!wallet || !wallet.publicKey) throw new Error('Wallet not connected');
        if (!IDL) throw new Error('IDL not loaded');

        this.provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });

        this.program = new Program(IDL, PROGRAM_ID, this.provider);
    }

    /**
     * Derive the user's config PDA
     */
    getUserConfigPDA(userPublicKey) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('user_config'), userPublicKey.toBuffer()],
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
     * Derive the treasury config PDA
     */
    getTreasuryConfigPDA() {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('treasury_config')],
            this.program.programId
        );
    }

    /**
     * Derive the treasury vault PDA
     */
    getTreasuryVaultPDA() {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('treasury_vault')],
            this.program.programId
        );
    }

    /**
     * Activate a new user account
     */
    async activateUser() {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);

        return await this.program.methods
            .activateUser()
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                user: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    }

    /**
     * Save SOL to the savings vault
     */
    async saveSol(amountSOL) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);
        const [treasuryConfigPDA] = this.getTreasuryConfigPDA();
        const [treasuryVaultPDA] = this.getTreasuryVaultPDA();

        const amountLamports = new BN(amountSOL * LAMPORTS_PER_SOL);

        return await this.program.methods
            .saveSol(amountLamports)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                treasuryConfig: treasuryConfigPDA,
                treasury: treasuryVaultPDA,
                user: userPublicKey,
                owner: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    }

    /**
     * Withdraw SOL from the savings vault
     */
    async withdrawSol(amountSOL) {
        const userPublicKey = this.provider.wallet.publicKey;
        const [userConfigPDA] = this.getUserConfigPDA(userPublicKey);
        const [vaultPDA] = this.getVaultPDA(userPublicKey);
        const [treasuryConfigPDA] = this.getTreasuryConfigPDA();
        const [treasuryVaultPDA] = this.getTreasuryVaultPDA();

        const amountLamports = new BN(amountSOL * LAMPORTS_PER_SOL);

        return await this.program.methods
            .withdrawSol(amountLamports)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                treasuryConfig: treasuryConfigPDA,
                treasury: treasuryVaultPDA,
                user: userPublicKey,
                owner: userPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
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
                totalSaved: config.totalSaved.toNumber() / LAMPORTS_PER_SOL,
                bump: config.bump,
                vaultBump: config.vaultBump
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
}

// Helper function to create client instance
export function createAutoSavingsClient(connection, wallet) {
    return new AutoSavingsClient(connection, wallet);
}
