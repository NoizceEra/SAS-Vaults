const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { AnchorProvider, Program, web3 } = require('@coral-xyz/anchor');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const PROGRAM_ID = 'JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv';
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=f1268153-d201-46e0-a706-f0f1ae2334a9';
const DEPLOYER_KEY_PATH = 'C:\\Users\\vclin_jjufoql\\.config\\solana\\deployer.json';
const PROGRAM_SO_PATH = 'target/deploy/auto_savings.so';

async function deployToMainnet() {
    console.log('🚀 Starting mainnet deployment...\n');

    // Step 1: Load deployer keypair
    console.log('📝 Loading deployer keypair...');
    const deployerKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(DEPLOYER_KEY_PATH, 'utf-8')))
    );
    console.log(`✅ Deployer: ${deployerKeypair.publicKey.toBase58()}\n`);

    // Step 2: Check balance
    const connection = new Connection(RPC_URL, 'confirmed');
    const balance = await connection.getBalance(deployerKeypair.publicKey);
    const balanceSOL = balance / 1e9;
    console.log(`💰 Balance: ${balanceSOL.toFixed(4)} SOL`);

    if (balanceSOL < 0.5) {
        throw new Error(`Insufficient balance! Need at least 0.5 SOL, have ${balanceSOL.toFixed(4)} SOL`);
    }

    // Step 3: Build the program
    console.log('\n🔨 Building program...');
    try {
        const { stdout, stderr } = await execPromise('anchor build', { cwd: __dirname });
        console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        throw error;
    }

    // Step 4: Check if program binary exists
    if (!fs.existsSync(PROGRAM_SO_PATH)) {
        throw new Error(`Program binary not found at ${PROGRAM_SO_PATH}`);
    }

    const stats = fs.statSync(PROGRAM_SO_PATH);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ Program built successfully (${sizeKB} KB)\n`);

    // Step 5: Deploy to mainnet
    console.log('🚢 Deploying to mainnet...');
    console.log(`Program ID: ${PROGRAM_ID}`);
    console.log(`RPC: ${RPC_URL}\n`);

    try {
        const deployCmd = `solana program deploy ${PROGRAM_SO_PATH} --program-id ${PROGRAM_ID} --url ${RPC_URL} --keypair ${DEPLOYER_KEY_PATH}`;
        console.log(`Running: ${deployCmd}\n`);

        const { stdout, stderr } = await execPromise(deployCmd, {
            cwd: __dirname,
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });

        console.log(stdout);
        if (stderr) console.error(stderr);

        console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
        console.log(`\n🎉 Program deployed to mainnet!`);
        console.log(`Program ID: ${PROGRAM_ID}`);
        console.log(`\nNext steps:`);
        console.log(`1. Initialize treasury: node scripts/initialize-mainnet-treasury.js`);
        console.log(`2. Update frontend PROGRAM_ID in frontend/src/config/solana.js`);
        console.log(`3. Deploy frontend to Netlify`);

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

// Run deployment
deployToMainnet()
    .then(() => {
        console.log('\n✅ All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    });
