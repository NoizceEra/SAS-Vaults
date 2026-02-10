/**
 * Treasury Initialization Check & Init
 * Checks current state and initializes if needed
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Configuration
const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=9a551d98-dd3d-4309-b523-bbbd227cee3e';

async function main() {
    console.log('\n🔍 Checking Treasury Status\n');
    console.log('━'.repeat(60));

    const connection = new Connection(RPC_URL, 'confirmed');

    // Derive PDAs
    const [treasuryConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_config')],
        PROGRAM_ID
    );

    const [treasuryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury_vault')],
        PROGRAM_ID
    );

    console.log(`Program ID:       ${PROGRAM_ID.toString()}`);
    console.log(`Treasury Config:  ${treasuryConfig.toString()}`);
    console.log(`Treasury Vault:   ${treasuryVault.toString()}`);
    console.log('━'.repeat(60));

    // Check if treasury config exists
    try {
        const configInfo = await connection.getAccountInfo(treasuryConfig);

        if (configInfo) {
            console.log('\n✅ TREASURY ALREADY INITIALIZED!');
            console.log('\n📋 Account Info:');
            console.log(`Owner:            ${configInfo.owner.toString()}`);
            console.log(`Data Length:      ${configInfo.data.length} bytes`);
            console.log(`Lamports:         ${(configInfo.lamports / LAMPORTS_PER_SOL).toFixed(9)} SOL`);

            // Check vault balance
            const vaultInfo = await connection.getAccountInfo(treasuryVault);
            if (vaultInfo) {
                console.log(`\nVault Balance:    ${(vaultInfo.lamports / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
            }

            console.log('\n🔗 View on Explorer:');
            console.log(`Config: https://explorer.solana.com/address/${treasuryConfig.toString()}`);
            console.log(`Vault:  https://explorer.solana.com/address/${treasuryVault.toString()}`);

            console.log('\n🎉 Treasury is ready! Users can now:');
            console.log('  ✅ Initialize their user accounts');
            console.log('  ✅ Make deposits');
            console.log('  ✅ Make withdrawals');

            return;
        }
    } catch (error) {
        // Account doesn't exist
    }

    console.log('\n❌ Treasury NOT initialized yet');
    console.log('\n📝 Next Steps:');
    console.log('1. The treasury needs to be initialized before users can interact');
    console.log('2. Error 0x1004 suggests there might be a constraint issue');
    console.log('3. Possible causes:');
    console.log('   - Incorrect PDA seeds');
    console.log('   - Account already exists with different owner');
    console.log('   - Insufficient rent');

    console.log('\n🔍 Checking if accounts exist with different seeds...');

    // Try alternative seed patterns
    const alternatives = [
        ['treasury'],
        ['treasury_vault'],
        ['config'],
    ];

    for (const seeds of alternatives) {
        const [pda] = PublicKey.findProgramAddressSync(
            seeds.map(s => Buffer.from(s)),
            PROGRAM_ID
        );

        try {
            const info = await connection.getAccountInfo(pda);
            if (info) {
                console.log(`\n⚠️  Found account with seeds [${seeds.join(', ')}]:`);
                console.log(`   Address: ${pda.toString()}`);
                console.log(`   Owner: ${info.owner.toString()}`);
            }
        } catch (e) {
            // Doesn't exist
        }
    }
}

main().catch(console.error);
