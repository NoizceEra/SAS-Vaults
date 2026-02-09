/**
 * Initialize Mainnet Treasury with Safety Features
 * 
 * This initializes the treasury with:
 * - Emergency pause (initially disabled)
 * - TVL cap at 10 SOL
 * - TVL tracking at 0
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const PROGRAM_ID = new PublicKey('V1YHSMC6Utp5smG67DL1vvPstcsAik6YSCFSJkfN79q');
const RPC_URL = 'https://api.mainnet-beta.solana.com';

async function initializeMainnetTreasury() {
    console.log('🚀 Initializing Mainnet Treasury with Safety Features...\n');
    console.log('━'.repeat(70));
    
    try {
        // Connect to mainnet
        const connection = new Connection(RPC_URL, 'confirmed');
        
        // Load deployer wallet
        const walletPath = path.join(
            process.env.USERPROFILE || process.env.HOME,
            '.config',
            'solana',
            'id.json'
        );
        
        if (!fs.existsSync(walletPath)) {
            throw new Error(`Wallet not found at: ${walletPath}`);
        }
        
        const wallet = Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
        );
        
        console.log('📍 Deployer Wallet:', wallet.publicKey.toString());
        
        // Check balance
        const balance = await connection.getBalance(wallet.publicKey);
        console.log('💰 Balance:', (balance / 1e9).toFixed(4), 'SOL');
        
        if (balance < 0.1 * 1e9) {
            throw new Error('Insufficient balance. Need at least 0.1 SOL');
        }
        
        // Load program IDL
        const idlPath = path.join(__dirname, '..', 'target', 'idl', 'auto_savings.json');
        const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
        
        // Create provider and program
        const provider = new anchor.AnchorProvider(
            connection,
            new anchor.Wallet(wallet),
            { commitment: 'confirmed' }
        );
        
        const program = new anchor.Program(idl, PROGRAM_ID, provider);
        
        // Derive treasury PDAs
        const [treasuryConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury')],
            PROGRAM_ID
        );
        
        const [treasuryVault] = PublicKey.findProgramAddressSync(
            [Buffer.from('treasury_vault')],
            PROGRAM_ID
        );
        
        console.log('\n📊 Treasury Addresses:');
        console.log('━'.repeat(70));
        console.log('Treasury Config:', treasuryConfig.toString());
        console.log('Treasury Vault:', treasuryVault.toString());
        
        // Check if already initialized
        try {
            const config = await program.account.treasuryConfig.fetch(treasuryConfig);
            console.log('\n⚠️  Treasury already initialized!');
            console.log('Authority:', config.authority.toString());
            console.log('Is Paused:', config.isPaused);
            console.log('TVL Cap:', (config.tvlCap / 1e9).toFixed(2), 'SOL');
            console.log('Current TVL:', (config.totalTvl / 1e9).toFixed(2), 'SOL');
            console.log('Fees Collected:', (config.totalFeesCollected / 1e9).toFixed(4), 'SOL');
            console.log('\n✅ Treasury is ready to use!');
            return;
        } catch (e) {
            // Not initialized, continue
            console.log('\n🔧 Treasury not initialized. Initializing now...');
        }
        
        // Initialize treasury
        console.log('\n📝 Sending initialization transaction...');
        
        const tx = await program.methods
            .initializeTreasury()
            .accounts({
                treasuryConfig: treasuryConfig,
                treasuryVault: treasuryVault,
                authority: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        
        console.log('\n✅ TREASURY INITIALIZED!');
        console.log('━'.repeat(70));
        console.log('Transaction:', tx);
        console.log('Explorer:', `https://solscan.io/tx/${tx}`);
        
        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fetch and display config
        const config = await program.account.treasuryConfig.fetch(treasuryConfig);
        
        console.log('\n📊 Treasury Configuration:');
        console.log('━'.repeat(70));
        console.log('Authority:', config.authority.toString());
        console.log('Is Paused:', config.isPaused ? '❌ YES (Deposits disabled)' : '✅ NO (Active)');
        console.log('TVL Cap:', (config.tvlCap / 1e9).toFixed(2), 'SOL (~$' + (config.tvlCap / 1e9 * 100).toFixed(0) + ')');
        console.log('Current TVL:', (config.totalTvl / 1e9).toFixed(2), 'SOL');
        console.log('Fees Collected:', (config.totalFeesCollected / 1e9).toFixed(4), 'SOL');
        console.log('Bump:', config.bump);
        
        console.log('\n🎉 SUCCESS! Your protocol is now live on mainnet!');
        console.log('━'.repeat(70));
        
        console.log('\n⚠️  IMPORTANT SAFETY REMINDERS:');
        console.log('  • TVL capped at', (config.tvlCap / 1e9).toFixed(0), 'SOL');
        console.log('  • Swaps are DISABLED');
        console.log('  • Monitor transactions 24/7');
        console.log('  • Test with small amounts first');
        console.log('  • Emergency pause available if needed');
        
        console.log('\n🔗 Important Links:');
        console.log('  Program:', `https://solscan.io/account/${PROGRAM_ID}`);
        console.log('  Treasury Config:', `https://solscan.io/account/${treasuryConfig}`);
        console.log('  Treasury Vault:', `https://solscan.io/account/${treasuryVault}`);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run
initializeMainnetTreasury();
