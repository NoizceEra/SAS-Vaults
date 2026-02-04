/**
 * Setup Treasury Authority
 * 
 * This script converts your private key to the proper Solana keypair format
 * and saves it securely for use with the treasury management script.
 */

const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const bs58 = require('bs58');

// Your treasury authority private key (base58 format)
const PRIVATE_KEY_BASE58 = '3jUny9fMscvnp5ZsFca2wJHU7JR8dthYSSP8dPD95rjZPbGmCoRxuzkYmiFZcmcpxYVJsoKTKNwGCve5Xaj77HaU';

// Expected public key
const EXPECTED_PUBKEY = 'GQxe3ynFdVNCEi2yf3LedFnBk3y6C5ep6sXiTei6aF2U';

console.log('🔑 Setting up Treasury Authority Keypair...\n');

try {
    // Decode the base58 private key
    const privateKeyBytes = bs58.decode(PRIVATE_KEY_BASE58);

    // Create keypair from the private key
    const keypair = Keypair.fromSecretKey(privateKeyBytes);

    // Verify the public key matches
    const publicKey = keypair.publicKey.toString();

    if (publicKey !== EXPECTED_PUBKEY) {
        throw new Error(`Public key mismatch!\nExpected: ${EXPECTED_PUBKEY}\nGot: ${publicKey}`);
    }

    console.log('✅ Public Key Verified:', publicKey);

    // Save to keypair file
    const keypairPath = path.join(
        process.env.USERPROFILE || process.env.HOME,
        '.config',
        'solana',
        'treasury-authority.json'
    );

    // Ensure directory exists
    const dir = path.dirname(keypairPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Write keypair to file
    fs.writeFileSync(
        keypairPath,
        JSON.stringify(Array.from(keypair.secretKey))
    );

    console.log('✅ Keypair saved to:', keypairPath);
    console.log('\n📋 Usage:');
    console.log('  node scripts/manage-treasury.js check');
    console.log('  node scripts/manage-treasury.js withdraw 0.01');
    console.log('  node scripts/manage-treasury.js stats');
    console.log('\n🔐 Security:');
    console.log('  - Keypair is stored locally on your machine');
    console.log('  - Only you have access to this file');
    console.log('  - Never share the contents of this file');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
