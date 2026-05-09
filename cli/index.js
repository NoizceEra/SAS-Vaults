#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const { Program, AnchorProvider, Wallet } = anchor;
const bs58 = require('bs58');
const fs = require('fs');

const programId = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');

// Minimal IDL for the Core Protocol
const idl = {
    "version": "2.0.0",
    "name": "auto_savings",
    "instructions": [
        { "name": "initializeTreasury", "accounts": [ { "name": "authority", "isMut": true, "isSigner": true }, { "name": "treasuryConfig", "isMut": true, "isSigner": false }, { "name": "treasuryVault", "isMut": true, "isSigner": false }, { "name": "systemProgram", "isMut": false, "isSigner": false } ], "args": [] },
        { "name": "activateUser", "accounts": [ { "name": "user", "isMut": true, "isSigner": true }, { "name": "userConfig", "isMut": true, "isSigner": false }, { "name": "vault", "isMut": true, "isSigner": false }, { "name": "systemProgram", "isMut": false, "isSigner": false } ], "args": [] },
        { "name": "saveSol", "accounts": [ { "name": "user", "isMut": true, "isSigner": true }, { "name": "userConfig", "isMut": true, "isSigner": false }, { "name": "vault", "isMut": true, "isSigner": false }, { "name": "treasuryConfig", "isMut": false, "isSigner": false }, { "name": "treasuryVault", "isMut": true, "isSigner": false }, { "name": "systemProgram", "isMut": false, "isSigner": false } ], "args": [ { "name": "amount", "type": "u64" } ] },
        { "name": "withdrawSol", "accounts": [ { "name": "user", "isMut": true, "isSigner": true }, { "name": "userConfig", "isMut": true, "isSigner": false }, { "name": "vault", "isMut": true, "isSigner": false }, { "name": "treasuryConfig", "isMut": false, "isSigner": false }, { "name": "treasuryVault", "isMut": true, "isSigner": false }, { "name": "systemProgram", "isMut": false, "isSigner": false } ], "args": [ { "name": "amount", "type": "u64" } ] }
    ]
};

const program = new Command();

program
  .name('slice')
  .description('SLICE Protocol CLI - Automate your savings on Solana')
  .version('1.0.0');

const getProvider = (rpcUrl, keypairPath) => {
    const connection = new Connection(rpcUrl || clusterApiUrl('mainnet-beta'), 'confirmed');
    let secretKey;
    
    if (process.env.SLICE_PRIVATE_KEY) {
        secretKey = bs58.decode(process.env.SLICE_PRIVATE_KEY);
    } else {
        const keyData = JSON.parse(fs.readFileSync(keypairPath || './keypair.json', 'utf-8'));
        secretKey = Uint8Array.from(keyData);
    }
    
    const keypair = Keypair.fromSecretKey(secretKey);
    const wallet = new Wallet(keypair);
    return new AnchorProvider(connection, wallet, { preflightCommitment: 'confirmed' });
};

program.command('status')
  .description('Check vault status and balances')
  .option('-k, --keypair <path>', 'Path to keypair file', './keypair.json')
  .option('-r, --rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    try {
        const provider = getProvider(options.rpc, options.keypair);
        const anchorProgram = new Program(idl, programId, provider);
        
        const [userConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from("user-config"), provider.wallet.publicKey.toBuffer()],
            programId
        );
        
        const [vault] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
            programId
        );

        console.log(chalk.bold.purple('\n🍰 SLICE Protocol Status'));
        console.log(chalk.slate('---------------------------'));
        
        const walletBalance = await provider.connection.getBalance(provider.wallet.publicKey);
        console.log(`Wallet: ${chalk.cyan((walletBalance / 1e9).toFixed(4))} SOL`);
        
        try {
            const config = await anchorProgram.account.userConfig.fetch(userConfig);
            console.log(`Vault:  ${chalk.green((config.totalSaved.toNumber() / 1e9).toFixed(4))} SOL`);
            console.log(`Status: ${chalk.emerald('Active')}`);
        } catch (e) {
            console.log(`Vault:  ${chalk.yellow('Not Initialized')}`);
            console.log(`Action: Run 'slice activate' to start.`);
        }
        console.log('');
    } catch (err) {
        console.error(chalk.red('Error:'), err.message);
    }
  });

program.command('activate')
  .description('Initialize your secure savings vault')
  .option('-k, --keypair <path>', 'Path to keypair file', './keypair.json')
  .action(async (options) => {
    try {
        const provider = getProvider(null, options.keypair);
        const anchorProgram = new Program(idl, programId, provider);
        
        console.log(chalk.blue('Activating SLICE Vault...'));
        
        const [userConfig] = PublicKey.findProgramAddressSync(
            [Buffer.from("user-config"), provider.wallet.publicKey.toBuffer()],
            programId
        );
        
        const [vault] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
            programId
        );

        const tx = await anchorProgram.methods.activateUser()
            .accounts({
                user: provider.wallet.publicKey,
                userConfig,
                vault,
                systemProgram: PublicKey.default,
            })
            .rpc();

        console.log(chalk.green('✔ Success! Vault activated.'));
        console.log('TX:', tx);
    } catch (err) {
        console.error(chalk.red('Failed:'), err.message);
    }
  });

program.command('save')
  .description('Manually save SOL to your vault')
  .argument('<amount>', 'Amount in SOL')
  .option('-k, --keypair <path>', 'Path to keypair file', './keypair.json')
  .action(async (amount, options) => {
    try {
        const provider = getProvider(null, options.keypair);
        const anchorProgram = new Program(idl, programId, provider);
        const lamports = Math.floor(parseFloat(amount) * 1e9);

        const [userConfig] = PublicKey.findProgramAddressSync([Buffer.from("user-config"), provider.wallet.publicKey.toBuffer()], programId);
        const [vault] = PublicKey.findProgramAddressSync([Buffer.from("vault"), provider.wallet.publicKey.toBuffer()], programId);
        const [treasuryConfig] = PublicKey.findProgramAddressSync([Buffer.from("treasury-config")], programId);
        const [treasuryVault] = PublicKey.findProgramAddressSync([Buffer.from("treasury-vault")], programId);

        console.log(chalk.purple(`Saving ${amount} SOL...`));
        const tx = await anchorProgram.methods.saveSol(new anchor.BN(lamports))
            .accounts({
                user: provider.wallet.publicKey,
                userConfig,
                vault,
                treasuryConfig,
                treasuryVault,
                systemProgram: PublicKey.default,
            })
            .rpc();

        console.log(chalk.green('✔ SOL Saved successfully!'));
        console.log('TX:', tx);
    } catch (err) {
        console.error(chalk.red('Failed:'), err.message);
    }
  });

program.parse();
