import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Import the IDL
import { IDL } from './frontend/src/idl/idl.js';

// ✅ UPDATED: New deployment via Solana Playground
const PROGRAM_ID = new PublicKey('AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j');
const DEVNET_RPC = 'https://api.devnet.solana.com';

async function testVaultCreation() {
    console.log('🚀 Testing Vault Creation from CLI\n');

    try {
        // 1. Load the CLI wallet
        console.log('📂 Loading CLI wallet...');
        const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
        const keypairData = JSON.parse(readFileSync(keypairPath, 'utf-8'));
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        console.log(`✅ Wallet loaded: ${keypair.publicKey.toString()}\n`);

        // 2. Connect to Devnet
        console.log('🌐 Connecting to Devnet...');
        const connection = new Connection(DEVNET_RPC, 'confirmed');
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`✅ Connected! Balance: ${balance / 1e9} SOL\n`);

        if (balance < 3000000) { // 0.003 SOL
            console.log('❌ ERROR: Insufficient balance!');
            console.log(`   Need at least 0.003 SOL, you have ${balance / 1e9} SOL`);
            process.exit(1);
        }

        // 3. Setup Anchor Provider and Program
        console.log('⚙️  Setting up Anchor provider...');
        const wallet = new Wallet(keypair);
        const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
        const program = new Program(IDL, PROGRAM_ID, provider);
        console.log(`✅ Program loaded: ${program.programId.toString()}\n`);

        // 4. Derive PDAs
        console.log('🔑 Deriving PDAs...');
        const [userConfigPDA, userConfigBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('config'), keypair.publicKey.toBuffer()],
            program.programId
        );
        const [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), keypair.publicKey.toBuffer()],
            program.programId
        );
        console.log(`   UserConfig PDA: ${userConfigPDA.toString()}`);
        console.log(`   Vault PDA: ${vaultPDA.toString()}\n`);

        // 5. Check if user is already initialized
        console.log('🔍 Checking if vault already exists...');
        try {
            const userConfig = await program.account.userConfig.fetch(userConfigPDA);
            console.log('⚠️  Vault already exists!');
            console.log(`   Owner: ${userConfig.owner.toString()}`);
            console.log(`   Savings Rate: ${userConfig.savingsRate}%`);
            console.log(`   Total Saved: ${userConfig.totalSaved.toNumber() / 1e9} SOL`);
            console.log(`   Is Active: ${userConfig.isActive}`);
            console.log('\n✅ Test Complete - Vault already initialized!\n');
            return;
        } catch (error) {
            console.log('✅ No existing vault found - ready to create!\n');
        }

        // 6. Initialize the vault
        const savingsRate = 50; // 50%
        console.log(`📝 Creating vault with ${savingsRate}% savings rate...`);
        console.log('   This will cost ~0.0023 SOL for rent exemption\n');

        const tx = await program.methods
            .initializeUser(savingsRate)
            .accounts({
                userConfig: userConfigPDA,
                vault: vaultPDA,
                user: keypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log('✅ VAULT CREATED SUCCESSFULLY!\n');
        console.log(`   Transaction: ${tx}`);
        console.log(`   Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);

        // 7. Verify the creation
        console.log('🔍 Verifying vault creation...');
        const userConfig = await program.account.userConfig.fetch(userConfigPDA);
        console.log(`✅ Vault verified!`);
        console.log(`   Owner: ${userConfig.owner.toString()}`);
        console.log(`   Savings Rate: ${userConfig.savingsRate}%`);
        console.log(`   Total Saved: ${userConfig.totalSaved.toNumber() / 1e9} SOL`);
        console.log(`   Transaction Count: ${userConfig.transactionCount.toNumber()}`);
        console.log(`   Is Active: ${userConfig.isActive}`);

        // 8. Check final balance
        const finalBalance = await connection.getBalance(keypair.publicKey);
        const cost = (balance - finalBalance) / 1e9;
        console.log(`\n💰 Cost: ${cost.toFixed(6)} SOL`);
        console.log(`   Remaining Balance: ${finalBalance / 1e9} SOL\n`);

        console.log('🎉 Test Complete - Vault creation works perfectly!\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);

        // Check for specific error codes
        if (error.message && error.message.includes('0x65')) {
            console.error('\n⚠️  Error Code 0x65 (101): This typically means:');
            console.error('   - Account already initialized, OR');
            console.error('   - Invalid account discriminator');
            console.error('\n💡 Try checking if the vault already exists on Solana Explorer:');
            const [userConfigPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('config'), keypair.publicKey.toBuffer()],
                PROGRAM_ID
            );
            console.error(`   https://explorer.solana.com/address/${userConfigPDA.toString()}?cluster=devnet`);
        }

        if (error.logs) {
            console.error('\n📋 Program Logs:');
            error.logs.forEach(log => console.error(`   ${log}`));
        }

        console.error('\n🔍 Debugging Info:');
        console.error(`   Program ID: ${PROGRAM_ID.toString()}`);
        console.error(`   Network: Devnet`);
        console.error(`   RPC: ${DEVNET_RPC}`);

        process.exit(1);
    }
}

// Run the test
testVaultCreation();
