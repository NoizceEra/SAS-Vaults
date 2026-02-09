const fs = require('fs');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { BpfLoader, BPF_LOADER_PROGRAM_ID } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');

async function deployProgram() {
    try {
        console.log('🚀 Starting Solana Program Deployment to Mainnet...\n');

        // Load deployer wallet
        const deployerKeyPath = 'C:\\Users\\vclin_jjufoql\\.config\\solana\\deployer.json';
        const deployerKey = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf-8'));
        const deployer = Keypair.fromSecretKey(new Uint8Array(deployerKey));

        console.log('📍 Deployer Address:', deployer.publicKey.toString());

        // Connect to mainnet
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

        // Check balance
        const balance = await connection.getBalance(deployer.publicKey);
        console.log('💰 Deployer Balance:', balance / 1e9, 'SOL');

        if (balance < 1e9) {
            throw new Error('Insufficient balance! Need at least 1 SOL for deployment.');
        }

        // Load program keypair
        const programKeyPath = 'target/deploy/auto_savings-mainnet-keypair.json';
        if (!fs.existsSync(programKeyPath)) {
            throw new Error(`Program keypair not found at: ${programKeyPath}`);
        }

        const programKey = JSON.parse(fs.readFileSync(programKeyPath, 'utf-8'));
        const programKeypair = Keypair.fromSecretKey(new Uint8Array(programKey));

        console.log('📦 Program ID:', programKeypair.publicKey.toString());

        // Check if program binary exists
        const programBinaryPath = 'target/deploy/auto_savings.so';
        if (!fs.existsSync(programBinaryPath)) {
            throw new Error(`Program binary not found at: ${programBinaryPath}\n\n` +
                `You need to build the program first. Since local builds are failing,\n` +
                `we need to get the .so file from Solana Playground or wait for CI to succeed.`);
        }

        const programData = fs.readFileSync(programBinaryPath);
        console.log('📊 Program Size:', programData.length, 'bytes');

        console.log('\n⏳ Deploying program to Solana Mainnet...');
        console.log('   This may take 1-2 minutes...\n');

        // Deploy using anchor
        const provider = new anchor.AnchorProvider(
            connection,
            new anchor.Wallet(deployer),
            { commitment: 'confirmed' }
        );

        // Use solana program deploy command via child_process
        const { execSync } = require('child_process');

        const deployCommand = `solana program deploy ${programBinaryPath} --program-id ${programKeyPath} --keypair ${deployerKeyPath} --url mainnet-beta`;

        console.log('🔧 Running:', deployCommand);
        const output = execSync(deployCommand, { encoding: 'utf-8' });

        console.log('\n✅ DEPLOYMENT SUCCESSFUL!\n');
        console.log(output);

        console.log('\n📋 Next Steps:');
        console.log('1. Initialize treasury: node scripts/initialize-mainnet-treasury.js');
        console.log('2. Update frontend with program ID:', programKeypair.publicKey.toString());
        console.log('3. Test with a small deposit');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

deployProgram();
