/**
 * Ultimate Treasury Initialization Script
 * Tries multiple RPCs and handles potential synchronization issues
 */

const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');
const RPCs = [
    'https://solana-mainnet.core.chainstack.com/bc71bed16350db49d622b7fa4d7c44d3',
    'https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e',
    'https://solana-mainnet.g.alchemy.com/v2/LskpwPKNYFiPPn4V1Vrgl'
];

async function tryInit(rpcUrl) {
    console.log(`\n🌐 Trying RPC: ${rpcUrl}`);
    const connection = new Connection(rpcUrl, 'confirmed');

    try {
        // Load deployer keypair
        const keypairPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'deployer.json');
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        const authority = Keypair.fromSecretKey(new Uint8Array(keypairData));

        const balance = await connection.getBalance(authority.publicKey);
        console.log(`   Wallet:    ${authority.publicKey.toString()}`);
        console.log(`   Balance:   ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        if (balance < 0.005 * LAMPORTS_PER_SOL) {
            console.log('   ❌ Insufficient balance for transaction.');
            return false;
        }

        // Derive PDAs
        const [treasuryConfig] = PublicKey.findProgramAddressSync([Buffer.from('treasury_config')], PROGRAM_ID);
        const [treasuryVault] = PublicKey.findProgramAddressSync([Buffer.from('treasury_vault')], PROGRAM_ID);

        // Check if exists
        const configAccount = await connection.getAccountInfo(treasuryConfig);
        if (configAccount) {
            console.log('   ✅ Treasury already initialized!');
            return true;
        }

        console.log('   🚀 Sending Initialization Transaction...');

        // Discriminator: sha256("global:initialize_treasury").slice(0, 8)
        const discriminator = crypto.createHash('sha256').update('global:initialize_treasury').digest().slice(0, 8);

        const keys = [
            { pubkey: treasuryConfig, isSigner: false, isWritable: true },
            { pubkey: treasuryVault, isSigner: false, isWritable: false },
            { pubkey: authority.publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ];

        const instruction = new TransactionInstruction({
            keys,
            programId: PROGRAM_ID,
            data: discriminator,
        });

        const transaction = new Transaction().add(instruction);
        const signature = await connection.sendTransaction(transaction, [authority]);

        console.log(`   ⏳ Transaction sent: ${signature}`);
        await connection.confirmTransaction(signature, 'confirmed');
        console.log('   🎉 SUCCESS! Treasury initialized.');
        return true;

    } catch (error) {
        if (error.message.includes('0x1004')) {
            console.log('   ⚠️  ConstraintSeeds error (0x1004). Trying alternative PDA seeds...');
            return await tryAltInit(connection, rpcUrl);
        }
        console.log(`   ❌ Failed: ${error.message}`);
        return false;
    }
}

async function tryAltInit(connection, rpcUrl) {
    // Some versions of the code might use different seeds
    const altSeeds = [Buffer.from('treasury')];
    const [altTreasury] = PublicKey.findProgramAddressSync(altSeeds, PROGRAM_ID);

    console.log(`   🛠️ Trying alt seed "treasury": ${altTreasury.toString()}`);
    // ... logic to try alt seeds if primary fails ...
    return false;
}

async function main() {
    for (const rpc of RPCs) {
        const success = await tryInit(rpc);
        if (success) break;
    }
}

main().catch(console.error);
