/**
 * Test Deployment Script
 * Verifies that the swap feature is deployed and working correctly
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = 'devnet';
const RPC_URL = 'https://api.devnet.solana.com';

// Token mints (Devnet)
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');

async function main() {
    console.log('\n🧪 Testing Swap Feature Deployment\n');
    console.log('='.repeat(60));

    // Load IDL
    const idlPath = path.join(__dirname, '../target/idl/auto_savings.json');
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    const programId = new PublicKey(idl.metadata.address);
    console.log(`\n📋 Program ID: ${programId.toString()}`);

    // Connect to Devnet
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log(`🌐 Connected to: ${NETWORK}`);

    // Load wallet
    const keypairPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.config',
        'solana',
        'id.json'
    );

    let wallet;
    try {
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
        console.log(`👛 Wallet: ${wallet.publicKey.toString()}`);
    } catch (error) {
        console.error('❌ Failed to load wallet:', error.message);
        process.exit(1);
    }

    // Create provider
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(wallet),
        { commitment: 'confirmed' }
    );
    anchor.setProvider(provider);

    // Load program
    const program = new anchor.Program(idl, programId, provider);
    console.log('✅ Program loaded');

    // Test 1: Check program exists
    console.log('\n📦 Test 1: Checking program exists...');
    try {
        const programInfo = await connection.getAccountInfo(programId);
        if (programInfo) {
            console.log('✅ Program account found');
            console.log(`   Executable: ${programInfo.executable}`);
            console.log(`   Owner: ${programInfo.owner.toString()}`);
        } else {
            console.log('❌ Program account not found');
            return;
        }
    } catch (error) {
        console.log('❌ Error checking program:', error.message);
        return;
    }

    // Test 2: Check IDL has new instructions
    console.log('\n📄 Test 2: Checking IDL for new instructions...');
    const requiredInstructions = [
        'initializeTokenVault',
        'setAutoSwap',
        'swapToToken',
        'withdrawToken'
    ];

    const foundInstructions = idl.instructions.map(i => i.name);
    let allFound = true;

    requiredInstructions.forEach(name => {
        if (foundInstructions.includes(name)) {
            console.log(`✅ ${name} found`);
        } else {
            console.log(`❌ ${name} NOT found`);
            allFound = false;
        }
    });

    if (!allFound) {
        console.log('\n⚠️  Some instructions missing. Did you deploy the latest build?');
    }

    // Test 3: Derive PDAs
    console.log('\n🔑 Test 3: Deriving PDAs...');

    try {
        // User config PDA
        const [userConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('config'), wallet.publicKey.toBuffer()],
            programId
        );
        console.log(`✅ User Config PDA: ${userConfig.toString()}`);

        // Vault PDA
        const [vault] = PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), wallet.publicKey.toBuffer()],
            programId
        );
        console.log(`✅ Vault PDA: ${vault.toString()}`);

        // Token Vault PDA (USDC)
        const [tokenVault] = PublicKey.findProgramAddressSync(
            [Buffer.from('token_vault'), wallet.publicKey.toBuffer(), USDC_MINT.toBuffer()],
            programId
        );
        console.log(`✅ Token Vault PDA (USDC): ${tokenVault.toString()}`);

        // Swap Config PDA
        const [swapConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('swap_config'), wallet.publicKey.toBuffer()],
            programId
        );
        console.log(`✅ Swap Config PDA: ${swapConfig.toString()}`);

        // Treasury PDAs
        const [treasuryConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury')],
            programId
        );
        console.log(`✅ Treasury Config PDA: ${treasuryConfig.toString()}`);

        const [treasury] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury_vault')],
            programId
        );
        console.log(`✅ Treasury Vault PDA: ${treasury.toString()}`);

    } catch (error) {
        console.log('❌ Error deriving PDAs:', error.message);
    }

    // Test 4: Check treasury status
    console.log('\n🏦 Test 4: Checking treasury status...');
    try {
        const [treasuryConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury')],
            programId
        );

        const treasuryAccount = await connection.getAccountInfo(treasuryConfig);
        if (treasuryAccount) {
            console.log('✅ Treasury initialized');

            const [treasury] = PublicKey.findProgramAddressSync(
                [Buffer.from('treasury_vault')],
                programId
            );
            const balance = await connection.getBalance(treasury);
            console.log(`   Treasury balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
        } else {
            console.log('⚠️  Treasury not initialized yet');
            console.log('   Run: node scripts/initialize-treasury.js');
        }
    } catch (error) {
        console.log('❌ Error checking treasury:', error.message);
    }

    // Test 5: Check user account
    console.log('\n👤 Test 5: Checking user account...');
    try {
        const [userConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('config'), wallet.publicKey.toBuffer()],
            programId
        );

        const userAccount = await connection.getAccountInfo(userConfig);
        if (userAccount) {
            console.log('✅ User account exists');

            // Try to fetch account data
            try {
                const userData = await program.account.userConfig.fetch(userConfig);
                console.log(`   Savings rate: ${userData.savingsRate}%`);
                console.log(`   Total saved: ${(userData.totalSaved / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
                console.log(`   Active: ${userData.isActive}`);
            } catch (e) {
                console.log('   (Could not parse account data)');
            }
        } else {
            console.log('⚠️  User account not initialized');
            console.log('   Initialize via frontend or CLI');
        }
    } catch (error) {
        console.log('❌ Error checking user account:', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEPLOYMENT TEST COMPLETE\n');

    console.log('📋 Summary:');
    console.log(`   Program ID: ${programId.toString()}`);
    console.log(`   Network: ${NETWORK}`);
    console.log(`   Wallet: ${wallet.publicKey.toString()}`);

    console.log('\n🔗 Useful Links:');
    console.log(`   Program: https://explorer.solana.com/address/${programId}?cluster=devnet`);
    console.log(`   Wallet: https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`);

    console.log('\n📚 Next Steps:');
    console.log('   1. Initialize treasury (if not done)');
    console.log('   2. Create user account via frontend');
    console.log('   3. Test swap interface');
    console.log('   4. Configure auto-swap');
    console.log('   5. Monitor transactions');

    console.log('');
}

main().catch(console.error);
