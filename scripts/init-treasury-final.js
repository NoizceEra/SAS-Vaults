/**
 * Correct Treasury Initialization
 * Properly derives PDAs and sends the correct instruction
 */

const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e';

async function main() {
    console.log('\n🏦 Treasury Initialization\n');
    console.log('━'.repeat(60));

    // Load deployer keypair
    const keypairPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'deployer.json');
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    const authority = Keypair.fromSecretKey(new Uint8Array(keypairData));

    const connection = new Connection(RPC_URL, 'confirmed');

    // Check balance
    const balance = await connection.getBalance(authority.publicKey);
    console.log(`Authority:        ${authority.publicKey.toString()}`);
    console.log(`Balance:          ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

    // Derive PDAs with correct seeds
    const [treasuryConfig, configBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_config')],
        PROGRAM_ID
    );

    const [treasuryVault, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        PROGRAM_ID
    );

    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);
    console.log(`Treasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log(`Config Bump:      ${configBump}`);
    console.log(`Vault Bump:       ${vaultBump}`);
    console.log('━'.repeat(60));

    // Check if already initialized
    try {
        const configInfo = await connection.getAccountInfo(treasuryConfig);
        if (configInfo) {
            console.log('\n✅ Treasury already initialized!');
            console.log(`\nView on Explorer:`);
            console.log(`https://explorer.solana.com/address/${treasuryConfig.toString()}`);
            return;
        }
    } catch (error) {
        // Not initialized
    }

    console.log('\n🚀 Creating initialization transaction...');

    // Create Anchor instruction discriminator
    // For initialize_treasury: sha256("global:initialize_treasury").slice(0, 8)
    const discriminator = crypto.createHash('sha256')
        .update('global:initialize_treasury')
        .digest()
        .slice(0, 8);

    console.log(`Discriminator:    ${discriminator.toString('hex')}`);

    // Build instruction with correct account order
    const keys = [
        { pubkey: treasuryConfig, isSigner: false, isWritable: true },      // treasury_config
        { pubkey: treasuryVault, isSigner: false, isWritable: false },      // treasury (vault PDA)
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },  // authority
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ];

    const instruction = new TransactionInstruction({
        keys,
        programId: PROGRAM_ID,
        data: discriminator,
    });

    const transaction = new Transaction().add(instruction);

    try {
        console.log('\n📤 Sending transaction...');

        const signature = await connection.sendTransaction(transaction, [authority], {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });

        console.log(`Signature:        ${signature}`);
        console.log('\n⏳ Waiting for confirmation...');

        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log('\n✅ TREASURY INITIALIZED SUCCESSFULLY!');
        console.log('━'.repeat(60));
        console.log(`Transaction:      ${signature}`);
        console.log(`Explorer:         https://explorer.solana.com/tx/${signature}`);
        console.log('━'.repeat(60));
        console.log('\n📋 Treasury Addresses:');
        console.log(`Config:           ${treasuryConfig.toString()}`);
        console.log(`Vault:            ${treasuryVault.toString()}`);
        console.log('\n🎉 Treasury is ready! Next steps:');
        console.log('  1. Users can initialize their accounts');
        console.log('  2. Users can make deposits');
        console.log('  3. Platform fees will be collected in the treasury vault');

    } catch (error) {
        console.error('\n❌ Transaction Failed:');
        console.error(error.message);

        if (error.logs) {
            console.error('\nProgram Logs:');
            error.logs.forEach(log => console.error(`  ${log}`));
        }

        throw error;
    }
}

main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
