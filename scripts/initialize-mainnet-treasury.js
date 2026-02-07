/**
 * 🏦 Treasury Initialization Script for Mainnet
 * 
 * This script initializes the treasury configuration for your deployed
 * Solana Auto-Savings Protocol on Mainnet.
 * 
 * ⚠️ CRITICAL: Run this ONCE after deploying the program to Mainnet
 * 
 * Usage:
 *   node scripts/initialize-mainnet-treasury.js
 */

const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { Program, AnchorProvider, web3, BN } = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

// Configuration
const PROGRAM_ID = new PublicKey('BWK8cgDEBjUk4h6Cn1PSSs673BTJbNNncAHrwF9m32NYA');
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const KEYPAIR_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');

console.log('🏦 Initializing Treasury for Mainnet Deployment');
console.log('═'.repeat(60));
console.log('Program ID:', PROGRAM_ID.toString());
console.log('RPC URL:', RPC_URL);
console.log('═'.repeat(60));

async function initializeTreasury() {
    try {
        // Load wallet
        console.log('\n📂 Loading wallet keypair...');
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
        const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
        console.log('✅ Wallet loaded:', wallet.publicKey.toString());

        // Setup connection and provider
        const connection = new Connection(RPC_URL, 'confirmed');
        const provider = new AnchorProvider(connection, {
            publicKey: wallet.publicKey,
            signTransaction: async (tx) => {
                tx.partialSign(wallet);
                return tx;
            },
            signAllTransactions: async (txs) => {
                txs.forEach(tx => tx.partialSign(wallet));
                return txs;
            }
        }, { commitment: 'confirmed' });

        // Check wallet balance
        const balance = await connection.getBalance(wallet.publicKey);
        console.log(`💰 Wallet Balance: ${(balance / 1e9).toFixed(4)} SOL`);

        if (balance < 0.1 * 1e9) {
            throw new Error('Insufficient balance! Need at least 0.1 SOL for initialization.');
        }

        // Derive treasury PDAs
        const [treasuryConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury')],
            PROGRAM_ID
        );

        const [treasuryVault] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury_vault')],
            PROGRAM_ID
        );

        console.log('\n🔑 Treasury PDAs:');
        console.log('  Config:', treasuryConfig.toString());
        console.log('  Vault:', treasuryVault.toString());

        // Load IDL
        console.log('\n📄 Loading program IDL...');
        const idlPath = path.join(__dirname, '..', 'target', 'idl', 'auto_savings.json');
        if (!fs.existsSync(idlPath)) {
            throw new Error(`IDL not found at ${idlPath}. Please build the program first.`);
        }
        const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));

        // Create program instance
        const program = new Program(idl, PROGRAM_ID, provider);

        // Check if treasury is already initialized
        console.log('\n🔍 Checking if treasury is already initialized...');
        try {
            const treasuryAccount = await connection.getAccountInfo(treasuryConfig);
            if (treasuryAccount) {
                console.log('⚠️  Treasury is already initialized!');
                console.log('   If you need to update the authority, use the update_treasury instruction instead.');
                return;
            }
        } catch (e) {
            // Treasury not initialized, continue
        }

        // Initialize treasury
        console.log('\n🚀 Initializing treasury...');
        console.log('   Authority:', wallet.publicKey.toString());

        const tx = await program.methods
            .initializeTreasury()
            .accounts({
                treasuryConfig: treasuryConfig,
                treasuryVault: treasuryVault,
                authority: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([wallet])
            .rpc();

        console.log('✅ Treasury initialized successfully!');
        console.log('   Transaction:', tx);
        console.log('   Explorer:', `https://solscan.io/tx/${tx}`);

        // Verify initialization
        console.log('\n🔍 Verifying treasury configuration...');
        const treasuryData = await program.account.treasuryConfig.fetch(treasuryConfig);
        console.log('   Authority:', treasuryData.authority.toString());
        console.log('   Total Fees Collected:', (treasuryData.totalFeesCollected.toNumber() / 1e9).toFixed(4), 'SOL');

        console.log('\n✅ Treasury initialization complete!');
        console.log('═'.repeat(60));
        console.log('🎉 Your Solana Auto-Savings Protocol is now live on Mainnet!');
        console.log('═'.repeat(60));

    } catch (error) {
        console.error('\n❌ Error initializing treasury:', error);
        if (error.logs) {
            console.error('\nProgram Logs:');
            error.logs.forEach(log => console.error('  ', log));
        }
        process.exit(1);
    }
}

// Run initialization
initializeTreasury();
