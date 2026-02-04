/**
 * Verify Treasury Authority Setup
 * 
 * Simple script to verify your treasury authority keypair is set up correctly
 */

const { Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Treasury Authority Setup...\n');

try {
    // Load the keypair
    const keypairPath = path.join(
        process.env.USERPROFILE || process.env.HOME,
        '.config',
        'solana',
        'treasury-authority.json'
    );

    if (!fs.existsSync(keypairPath)) {
        throw new Error(`Keypair file not found at: ${keypairPath}`);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

    console.log('✅ Treasury Authority Keypair Loaded Successfully!');
    console.log('━'.repeat(60));
    console.log('📍 Keypair Location:', keypairPath);
    console.log('🔑 Public Key:', keypair.publicKey.toString());
    console.log('━'.repeat(60));

    // Derive treasury PDAs
    const PROGRAM_ID = new PublicKey('AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j');

    const [treasuryConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        PROGRAM_ID
    );

    const [treasuryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        PROGRAM_ID
    );

    console.log('\n📊 Treasury PDAs (Devnet):');
    console.log('━'.repeat(60));
    console.log('Treasury Config:', treasuryConfig.toString());
    console.log('Treasury Vault:', treasuryVault.toString());
    console.log('━'.repeat(60));

    console.log('\n✅ Setup Complete!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Deploy updated program to Devnet (with withdraw_treasury)');
    console.log('  2. Initialize treasury with this wallet as authority');
    console.log('  3. Use treasury management script:');
    console.log('     node scripts/manage-treasury.js check');
    console.log('     node scripts/manage-treasury.js withdraw <amount>');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
