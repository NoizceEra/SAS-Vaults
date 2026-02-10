/**
 * Simple Treasury Initialization Script
 * Initializes the treasury on mainnet without requiring IDL
 */

const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const borsh = require('borsh');

// Configuration
const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e';

// Load authority keypair
function loadAuthority() {
    const keypairPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'deployer.json');

    if (!fs.existsSync(keypairPath)) {
        throw new Error(`Keypair not found at ${keypairPath}`);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

// Get treasury PDAs
function getTreasuryPDAs(programId) {
    const [treasuryConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_config')],
        programId
    );

    const [treasuryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        programId
    );

    return { treasuryConfig, treasuryVault };
}

// Create initialize instruction data
// For Anchor programs, instruction discriminator is first 8 bytes of sha256("global:initialize_treasury")
function createInitializeInstructionData() {
    // Anchor discriminator for initialize_treasury
    // This is sha256("global:initialize_treasury").slice(0, 8)
    const discriminator = Buffer.from([0xaf, 0xaf, 0x6d, 0x1f, 0x0d, 0x98, 0x9b, 0xed]);
    return discriminator;
}

async function initializeTreasury() {
    console.log('\n🏦 Initializing Treasury on Mainnet\n');
    console.log('━'.repeat(60));

    const connection = new Connection(RPC_URL, 'confirmed');
    const authority = loadAuthority();

    console.log(`Authority:        ${authority.publicKey.toString()}`);
    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);

    // Check balance
    const balance = await connection.getBalance(authority.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`Authority Balance: ${balanceSOL.toFixed(4)} SOL`);

    if (balanceSOL < 0.01) {
        throw new Error('Insufficient balance. Need at least 0.01 SOL');
    }

    const { treasuryConfig, treasuryVault } = getTreasuryPDAs(PROGRAM_ID);

    console.log(`\nTreasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log('━'.repeat(60));

    // Check if already initialized
    try {
        const configAccount = await connection.getAccountInfo(treasuryConfig);
        if (configAccount) {
            console.log('\n✅ Treasury already initialized!');
            console.log(`\nTreasury Config:  ${treasuryConfig.toString()}`);
            console.log(`Treasury Vault:   ${treasuryVault.toString()}`);

            const vaultBalance = await connection.getBalance(treasuryVault);
            console.log(`\nVault Balance:    ${(vaultBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
            return;
        }
    } catch (error) {
        // Not initialized, continue
    }

    console.log('\n🚀 Initializing treasury...');

    // Create instruction
    const instructionData = createInitializeInstructionData();

    const keys = [
        { pubkey: treasuryConfig, isSigner: false, isWritable: true },
        { pubkey: treasuryVault, isSigner: false, isWritable: false },
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const instruction = {
        keys,
        programId: PROGRAM_ID,
        data: instructionData,
    };

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

        console.log('\n🎉 Treasury is ready!');
        console.log('\nNext steps:');
        console.log('  1. Users can now initialize their accounts');
        console.log('  2. Users can make deposits and withdrawals');
        console.log('  3. Platform fees will be collected in the treasury vault');

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

// Main
async function main() {
    try {
        await initializeTreasury();
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
