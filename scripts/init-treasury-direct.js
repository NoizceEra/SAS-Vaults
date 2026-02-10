/**
 * Direct CLI Treasury Initialization
 * Uses Anchor CLI to initialize the treasury on mainnet
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Configuration
const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e';

// Load deployer keypair
const keypairPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'deployer.json');
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const authority = Keypair.fromSecretKey(new Uint8Array(keypairData));

// Derive treasury PDAs
const [treasuryConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_config')],
    PROGRAM_ID
);

const [treasuryVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_vault')],
    PROGRAM_ID
);

async function initializeTreasury() {
    console.log('\n🏦 Initializing Treasury via Direct Transaction\n');
    console.log('━'.repeat(60));
    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);
    console.log(`Authority:        ${authority.publicKey.toString()}`);
    console.log(`Treasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log('━'.repeat(60));

    const connection = new Connection(RPC_URL, 'confirmed');

    // Check if already initialized
    try {
        const configAccount = await connection.getAccountInfo(treasuryConfig);
        if (configAccount) {
            console.log('\n✅ Treasury already initialized!');
            console.log(`\nView on Explorer:`);
            console.log(`https://explorer.solana.com/address/${treasuryConfig.toString()}`);
            return;
        }
    } catch (error) {
        // Not initialized, continue
    }

    console.log('\n🚀 Creating initialization transaction...');

    // Create instruction discriminator for initialize_treasury
    // Anchor uses sha256("global:initialize_treasury").slice(0, 8)
    const crypto = require('crypto');
    const discriminator = crypto.createHash('sha256')
        .update('global:initialize_treasury')
        .digest()
        .slice(0, 8);

    console.log(`Discriminator: ${discriminator.toString('hex')}`);

    // Create instruction
    const { Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');

    const keys = [
        { pubkey: treasuryConfig, isSigner: false, isWritable: true },
        { pubkey: treasuryVault, isSigner: false, isWritable: true },
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const instruction = new TransactionInstruction({
        keys,
        programId: PROGRAM_ID,
        data: discriminator,
    });

    const transaction = new Transaction().add(instruction);

    try {
        const signature = await connection.sendTransaction(transaction, [authority], {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });

        console.log('\n⏳ Waiting for confirmation...');
        await connection.confirmTransaction(signature, 'confirmed');

        console.log('\n✅ Treasury Initialized Successfully!');
        console.log('━'.repeat(60));
        console.log(`Transaction:      ${signature}`);
        console.log(`Explorer:         https://explorer.solana.com/tx/${signature}`);
        console.log('━'.repeat(60));
        console.log('\n📋 Treasury Addresses:');
        console.log(`Config:           ${treasuryConfig.toString()}`);
        console.log(`Vault:            ${treasuryVault.toString()}`);
        console.log('\n🎉 Treasury is ready for deposits!');

    } catch (error) {
        console.error('\n❌ Initialization Failed:');
        console.error(error.message);
        if (error.logs) {
            console.error('\nProgram Logs:');
            error.logs.forEach(log => console.error(`  ${log}`));
        }
        throw error;
    }
}

initializeTreasury().catch(console.error);
