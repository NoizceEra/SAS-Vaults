/**
 * Treasury Management Script
 * 
 * This script allows the treasury authority to:
 * 1. Check treasury balance
 * 2. Withdraw funds from treasury
 * 3. View treasury statistics
 * 
 * Usage:
 *   node scripts/manage-treasury.js check
 *   node scripts/manage-treasury.js withdraw <amount_in_sol>
 *   node scripts/manage-treasury.js stats
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Load IDL
const idlPath = path.join(__dirname, '../target/idl/auto_savings.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

// Configuration
const NETWORK = process.env.NETWORK || 'devnet';
const RPC_URL = NETWORK === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com';

const PROGRAM_ID = new PublicKey(
    NETWORK === 'mainnet-beta'
        ? 'YOUR_MAINNET_PROGRAM_ID' // Update after Mainnet deployment
        : 'AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j' // Current Devnet
);

async function loadAuthority() {
    // Load authority keypair from file
    // Default: ~/.config/solana/id.json
    const keypairPath = process.env.AUTHORITY_KEYPAIR ||
        path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');

    if (!fs.existsSync(keypairPath)) {
        throw new Error(`Authority keypair not found at ${keypairPath}`);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

async function getTreasuryPDAs(programId) {
    const [treasuryConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        programId
    );

    const [treasuryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        programId
    );

    return { treasuryConfig, treasuryVault };
}

async function checkTreasury() {
    console.log('🔍 Checking Treasury Status...\n');

    const connection = new Connection(RPC_URL, 'confirmed');
    const { treasuryConfig, treasuryVault } = await getTreasuryPDAs(PROGRAM_ID);

    // Get treasury vault balance
    const balance = await connection.getBalance(treasuryVault);
    const balanceSOL = balance / LAMPORTS_PER_SOL;

    console.log('📊 Treasury Information:');
    console.log('━'.repeat(50));
    console.log(`Network:          ${NETWORK}`);
    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);
    console.log(`Treasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log(`Balance:          ${balanceSOL.toFixed(9)} SOL`);
    console.log(`Balance (USD):    $${(balanceSOL * 100).toFixed(2)} (@ $100/SOL)`);
    console.log('━'.repeat(50));

    // Try to fetch treasury config account
    try {
        const provider = new anchor.AnchorProvider(
            connection,
            new anchor.Wallet(Keypair.generate()), // Dummy wallet for reading
            { commitment: 'confirmed' }
        );
        const program = new anchor.Program(idl, PROGRAM_ID, provider);

        const configData = await program.account.treasuryConfig.fetch(treasuryConfig);
        console.log('\n📋 Treasury Config:');
        console.log(`Authority:        ${configData.authority.toString()}`);
        console.log(`Total Fees:       ${(configData.totalFeesCollected / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
    } catch (error) {
        console.log('\n⚠️  Treasury not initialized yet');
    }
}

async function withdrawTreasury(amountSOL) {
    console.log(`💰 Withdrawing ${amountSOL} SOL from Treasury...\n`);

    const connection = new Connection(RPC_URL, 'confirmed');
    const authority = await loadAuthority();

    console.log(`Authority: ${authority.publicKey.toString()}`);

    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(authority),
        { commitment: 'confirmed' }
    );
    const program = new anchor.Program(idl, PROGRAM_ID, provider);

    const { treasuryConfig, treasuryVault } = await getTreasuryPDAs(PROGRAM_ID);

    // Check current balance
    const currentBalance = await connection.getBalance(treasuryVault);
    const currentBalanceSOL = currentBalance / LAMPORTS_PER_SOL;

    if (currentBalanceSOL < amountSOL) {
        throw new Error(
            `Insufficient treasury balance. ` +
            `Requested: ${amountSOL} SOL, Available: ${currentBalanceSOL.toFixed(9)} SOL`
        );
    }

    const amountLamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

    console.log('📤 Sending transaction...');

    try {
        const tx = await program.methods
            .withdrawTreasury(new anchor.BN(amountLamports))
            .accounts({
                treasuryConfig,
                treasury: treasuryVault,
                authority: authority.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        console.log('\n✅ Withdrawal Successful!');
        console.log('━'.repeat(50));
        console.log(`Transaction:      ${tx}`);
        console.log(`Amount:           ${amountSOL} SOL`);
        console.log(`Recipient:        ${authority.publicKey.toString()}`);
        console.log(`Explorer:         https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
        console.log('━'.repeat(50));

        // Show new balance
        const newBalance = await connection.getBalance(treasuryVault);
        const newBalanceSOL = newBalance / LAMPORTS_PER_SOL;
        console.log(`\nNew Treasury Balance: ${newBalanceSOL.toFixed(9)} SOL`);

    } catch (error) {
        console.error('\n❌ Withdrawal Failed:');
        console.error(error.message);

        if (error.message.includes('Unauthorized')) {
            console.error('\n⚠️  You are not the treasury authority!');
            console.error('Only the wallet that initialized the treasury can withdraw funds.');
        }

        throw error;
    }
}

async function showStats() {
    console.log('📊 Treasury Statistics\n');

    const connection = new Connection(RPC_URL, 'confirmed');
    const { treasuryConfig, treasuryVault } = await getTreasuryPDAs(PROGRAM_ID);

    try {
        const provider = new anchor.AnchorProvider(
            connection,
            new anchor.Wallet(Keypair.generate()),
            { commitment: 'confirmed' }
        );
        const program = new anchor.Program(idl, PROGRAM_ID, provider);

        const configData = await program.account.treasuryConfig.fetch(treasuryConfig);
        const balance = await connection.getBalance(treasuryVault);

        const totalFeesSOL = configData.totalFeesCollected / LAMPORTS_PER_SOL;
        const currentBalanceSOL = balance / LAMPORTS_PER_SOL;
        const withdrawnSOL = totalFeesSOL - currentBalanceSOL;

        console.log('━'.repeat(50));
        console.log('💰 Fee Collection Summary');
        console.log('━'.repeat(50));
        console.log(`Total Fees Collected:  ${totalFeesSOL.toFixed(9)} SOL`);
        console.log(`Current Balance:       ${currentBalanceSOL.toFixed(9)} SOL`);
        console.log(`Total Withdrawn:       ${withdrawnSOL.toFixed(9)} SOL`);
        console.log('━'.repeat(50));

        console.log('\n📈 Estimated Revenue (@ $100/SOL)');
        console.log('━'.repeat(50));
        console.log(`Total Revenue:         $${(totalFeesSOL * 100).toFixed(2)}`);
        console.log(`Available to Withdraw: $${(currentBalanceSOL * 100).toFixed(2)}`);
        console.log(`Already Withdrawn:     $${(withdrawnSOL * 100).toFixed(2)}`);
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('❌ Could not fetch treasury stats');
        console.error('Treasury may not be initialized yet');
    }
}

// Main CLI
async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];

    console.log('\n🏦 Auto-Savings Treasury Manager\n');

    try {
        switch (command) {
            case 'check':
                await checkTreasury();
                break;

            case 'withdraw':
                if (!arg) {
                    console.error('❌ Please specify amount in SOL');
                    console.error('Usage: node manage-treasury.js withdraw <amount>');
                    process.exit(1);
                }
                const amount = parseFloat(arg);
                if (isNaN(amount) || amount <= 0) {
                    console.error('❌ Invalid amount');
                    process.exit(1);
                }
                await withdrawTreasury(amount);
                break;

            case 'stats':
                await showStats();
                break;

            default:
                console.log('Usage:');
                console.log('  node manage-treasury.js check          - Check treasury balance');
                console.log('  node manage-treasury.js withdraw <SOL> - Withdraw from treasury');
                console.log('  node manage-treasury.js stats          - View statistics');
                console.log('\nEnvironment Variables:');
                console.log('  NETWORK=devnet|mainnet-beta           - Network to use (default: devnet)');
                console.log('  AUTHORITY_KEYPAIR=/path/to/key.json   - Authority keypair path');
                process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
