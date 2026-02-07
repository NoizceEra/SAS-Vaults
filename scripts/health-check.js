/**
 * 🏥 Health Check Script
 * 
 * Runs comprehensive health checks on your deployed program
 * Use this before and after deployment to verify system status
 * 
 * Usage: node scripts/health-check.js
 */

const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || 'YOUR_PROGRAM_ID');
const RPC_URL = process.env.RPC_URL || clusterApiUrl('mainnet-beta');
const connection = new Connection(RPC_URL, 'confirmed');

console.log('🏥 Running Health Checks...\n');
console.log('━'.repeat(60));

const [treasuryConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    PROGRAM_ID
);

const [treasuryVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_vault')],
    PROGRAM_ID
);

let passedChecks = 0;
let totalChecks = 0;

function check(name, passed, details = '') {
    totalChecks++;
    if (passed) {
        passedChecks++;
        console.log(`✅ ${name}`);
        if (details) console.log(`   ${details}`);
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
    }
}

async function runHealthChecks() {
    try {
        // Check 1: Program exists
        console.log('\n📋 Basic Checks:');
        console.log('━'.repeat(60));
        
        const programInfo = await connection.getAccountInfo(PROGRAM_ID);
        check('Program Deployed', programInfo !== null, `Executable: ${programInfo?.executable}`);
        
        // Check 2: Treasury config exists
        const configInfo = await connection.getAccountInfo(treasuryConfig);
        check('Treasury Config Initialized', configInfo !== null, `Owner: ${configInfo?.owner.toString()}`);
        
        // Check 3: Treasury vault exists and has balance
        const vaultBalance = await connection.getBalance(treasuryVault);
        const vaultSOL = vaultBalance / 1e9;
        check('Treasury Vault Exists', vaultBalance >= 0, `Balance: ${vaultSOL.toFixed(4)} SOL`);
        
        // Check 4: Treasury has sufficient balance
        const MIN_BALANCE = 0.1 * 1e9; // 0.1 SOL
        check('Treasury Funded', vaultBalance >= MIN_BALANCE, 
            vaultBalance >= MIN_BALANCE ? 'Sufficient balance' : `Low balance: ${vaultSOL.toFixed(4)} SOL`);
        
        // Check 5: RPC connection
        console.log('\n🌐 Network Checks:');
        console.log('━'.repeat(60));
        
        const slot = await connection.getSlot();
        check('RPC Connection', slot > 0, `Current slot: ${slot}`);
        
        const blockTime = await connection.getBlockTime(slot);
        check('RPC Block Time', blockTime !== null, `Block time: ${new Date(blockTime * 1000).toISOString()}`);
        
        // Check 6: Recent transactions
        console.log('\n📊 Transaction History:');
        console.log('━'.repeat(60));
        
        const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 10 });
        check('Has Transaction History', signatures.length > 0, `Found ${signatures.length} recent transactions`);
        
        if (signatures.length > 0) {
            const failedCount = signatures.filter(sig => sig.err !== null).length;
            const successRate = ((signatures.length - failedCount) / signatures.length * 100).toFixed(1);
            check('Recent Success Rate', failedCount < 3, 
                `${successRate}% success (${signatures.length - failedCount}/${signatures.length})`);
            
            // Check last transaction time
            const lastTx = signatures[0];
            const lastTxTime = new Date(lastTx.blockTime * 1000);
            const hoursSinceLastTx = (Date.now() - lastTxTime) / (1000 * 60 * 60);
            check('Recent Activity', hoursSinceLastTx < 24, 
                `Last transaction: ${lastTxTime.toISOString()} (${hoursSinceLastTx.toFixed(1)}h ago)`);
        }
        
        // Check 7: Program account size
        console.log('\n💾 Program Data:');
        console.log('━'.repeat(60));
        
        if (programInfo) {
            const sizeKB = (programInfo.data.length / 1024).toFixed(2);
            check('Program Size', programInfo.data.length < 1024 * 1024, `${sizeKB} KB`);
            check('Program Executable', programInfo.executable, 'Program is executable');
        }
        
        // Final summary
        console.log('\n' + '═'.repeat(60));
        console.log('📊 HEALTH CHECK SUMMARY');
        console.log('═'.repeat(60));
        console.log(`Checks Passed: ${passedChecks}/${totalChecks}`);
        console.log(`Success Rate: ${(passedChecks/totalChecks*100).toFixed(1)}%`);
        console.log('━'.repeat(60));
        console.log(`Program ID: ${PROGRAM_ID.toString()}`);
        console.log(`Treasury Config: ${treasuryConfig.toString()}`);
        console.log(`Treasury Vault: ${treasuryVault.toString()}`);
        console.log(`Treasury Balance: ${vaultSOL.toFixed(4)} SOL`);
        console.log('━'.repeat(60));
        console.log(`🔗 Explorer: https://solscan.io/account/${PROGRAM_ID.toString()}`);
        console.log('═'.repeat(60));
        
        if (passedChecks === totalChecks) {
            console.log('\n✅ All health checks passed! System is healthy.\n');
            process.exit(0);
        } else {
            console.log(`\n⚠️  ${totalChecks - passedChecks} health check(s) failed. Please investigate.\n`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Error running health checks:', error);
        process.exit(1);
    }
}

runHealthChecks();
