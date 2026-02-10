/**
 * Initialize Treasury Script
 * 
 * This script initializes the treasury on Devnet using the treasury authority wallet.
 * This only needs to be run ONCE per program deployment.
 * 
 * Usage:
 *   node scripts/initialize-treasury.js
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Load IDL
const idlPath = path.join(__dirname, '../idl/auto_savings.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

// Configuration
const NETWORK = process.env.NETWORK || 'mainnet-beta';
const RPC_URL = NETWORK === 'mainnet-beta'
    ? process.env.RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e'
    : 'https://api.devnet.solana.com';

const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');

async function loadAuthority() {
    // Load treasury authority keypair (using deployer wallet)
    const keypairPath = process.env.AUTHORITY_KEYPAIR ||
        path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'deployer.json');

    if (!fs.existsSync(keypairPath)) {
        throw new Error(`Treasury authority keypair not found at ${keypairPath}`);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

async function getTreasuryPDAs(programId) {
    const [treasuryConfig, configBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_config')],
        programId
    );

    const [treasuryVault, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        programId
    );

    return { treasuryConfig, treasuryVault, configBump, vaultBump };
}

async function initializeTreasury() {
    console.log('\n🏦 Initializing Treasury on Mainnet\n');
    console.log('━'.repeat(60));

    const connection = new Connection(RPC_URL, 'confirmed');
    const authority = await loadAuthority();

    console.log(`Authority:        ${authority.publicKey.toString()}`);
    console.log(`Network:          ${NETWORK}`);
    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);

    // Check authority balance
    const balance = await connection.getBalance(authority.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`Authority Balance: ${balanceSOL.toFixed(4)} SOL`);

    if (balanceSOL < 0.01) {
        console.log('\n⚠️  Low balance! You need at least 0.01 SOL to initialize.');
        throw new Error('Insufficient balance');
    }

    const { treasuryConfig, treasuryVault } = await getTreasuryPDAs(PROGRAM_ID);

    console.log(`\nTreasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log('━'.repeat(60));

    // Check if already initialized
    try {
        const configAccount = await connection.getAccountInfo(treasuryConfig);
        if (configAccount) {
            console.log('\n⚠️  Treasury already initialized!');
            console.log('Fetching current configuration...\n');

            const provider = new anchor.AnchorProvider(
                connection,
                new anchor.Wallet(authority),
                { commitment: 'confirmed' }
            );
            const program = new anchor.Program(idl, PROGRAM_ID, provider);

            const configData = await program.account.treasuryConfig.fetch(treasuryConfig);
            console.log('📋 Current Treasury Config:');
            console.log('━'.repeat(60));
            console.log(`Authority:        ${configData.authority.toString()}`);
            console.log(`Is Paused:        ${configData.isPaused}`);
            console.log(`Total TVL:        ${(configData.totalTvl / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
            console.log(`TVL Cap:          ${(configData.tvlCap / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
            console.log(`Bump:             ${configData.bump}`);
            console.log('━'.repeat(60));

            const vaultBalance = await connection.getBalance(treasuryVault);
            console.log(`\nVault Balance:    ${(vaultBalance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);

            return;
        }
    } catch (error) {
        // Not initialized yet, continue
    }

    console.log('\n🚀 Initializing treasury...');

    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(authority),
        { commitment: 'confirmed' }
    );
    const program = new anchor.Program(idl, PROGRAM_ID, provider);

    try {
        const tx = await program.methods
            .initializeTreasury()
            .accounts({
                treasuryConfig,
                treasury: treasuryVault,
                authority: authority.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        console.log('\n✅ Treasury Initialized Successfully!');
        console.log('━'.repeat(60));
        console.log(`Transaction:      ${tx}`);
        console.log(`Explorer:         https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
        console.log('━'.repeat(60));

        // Fetch and display the created config
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confirmation

        const configData = await program.account.treasuryConfig.fetch(treasuryConfig);
        console.log('\n📋 Treasury Configuration:');
        console.log('━'.repeat(60));
        console.log(`Authority:        ${configData.authority.toString()}`);
        console.log(`Is Paused:        ${configData.isPaused}`);
        console.log(`Total TVL:        ${(configData.totalTvl / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
        console.log(`TVL Cap:          ${(configData.tvlCap / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
        console.log(`Bump:             ${configData.bump}`);
        console.log('━'.repeat(60));

        console.log('\n🎉 Treasury is ready to collect fees!');
        console.log('\nNext steps:');
        console.log('  1. Create a user account and make deposits');
        console.log('  2. Check treasury balance: node scripts/manage-treasury.js check');
        console.log('  3. Withdraw fees: node scripts/manage-treasury.js withdraw <amount>');

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
