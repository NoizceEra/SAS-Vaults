/**
 * Simple Treasury Initialization Script
 * Uses web3.js directly to avoid Anchor version issues
 */

const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const bs58 = require('bs58');

// Configuration
const PROGRAM_ID = new PublicKey('E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a');
const RPC_URL = 'https://api.devnet.solana.com';

async function main() {
    console.log('\n🏦 Initializing Treasury (Simple Method)\n');
    console.log('━'.repeat(60));

    // Load authority keypair
    const keypairPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'treasury-authority.json');
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    const authority = Keypair.fromSecretKey(new Uint8Array(keypairData));

    console.log(`Authority:        ${authority.publicKey.toString()}`);
    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);

    // Derive PDAs
    const [treasuryConfig, configBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        PROGRAM_ID
    );

    const [treasuryVault, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        PROGRAM_ID
    );

    console.log(`Treasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log('━'.repeat(60));

    // Connect
    const connection = new Connection(RPC_URL, 'confirmed');

    // Check if already initialized
    const configAccount = await connection.getAccountInfo(treasuryConfig);
    if (configAccount) {
        console.log('\n⚠️  Treasury already initialized!');
        const vaultBalance = await connection.getBalance(treasuryVault);
        console.log(`Treasury Vault Balance: ${(vaultBalance / 1e9).toFixed(9)} SOL`);
        return;
    }

    console.log('\n📝 Please initialize the treasury manually using Solana Playground:');
    console.log('\n1. Go to https://beta.solpg.io');
    console.log('2. Make sure your program is loaded (ID: E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a)');
    console.log('3. Switch to the treasury authority wallet');
    console.log('4. In the Test tab, select "initializeTreasury"');
    console.log('5. Click "Test" to execute');
    console.log('\nOr use this command in Playground terminal:');
    console.log('\nsolana program call E723pUhopYoiGxGY3TUJaKodXq5RSf1xt1WHnvYTdM4a initializeTreasury');
    console.log('\n━'.repeat(60));
}

main().catch(console.error);
