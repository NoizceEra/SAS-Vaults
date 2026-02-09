const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

const privateKeyBase58 = '65vpNgiMKa5chXu9z7d3uHW8dU1M7UUdvPRAo9wtna9XQYBzYDb2BCT6Z3tnpKPZnSLmtFFFjAtQwpaWVQfjPrqB';

try {
    const decoded = bs58.decode(privateKeyBase58);
    const keyArray = Array.from(decoded);

    const outputPath = path.join(process.env.USERPROFILE, '.config', 'solana', 'deployer.json');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(keyArray));
    console.log('✅ Deployer key saved to:', outputPath);
    console.log('Key length:', keyArray.length, 'bytes');
} catch (error) {
    console.error('❌ Error converting key:', error.message);
    process.exit(1);
}
