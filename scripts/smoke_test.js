const anchor = require('../node_modules/@coral-xyz/anchor');
const { PublicKey, SystemProgram } = require('../node_modules/@solana/web3.js');
const fs = require('fs');

(async () => {
  const idlPath = require('path').join(process.cwd(), 'target', 'idl', 'auto_savings.json');
  const idl = JSON.parse(fs.readFileSync(idlPath));
  const programId = new PublicKey('8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR');
  // Ensure the IDL's declared address matches the deployed program ID to avoid
  // DeclaredProgramIdMismatch errors when creating the Anchor Program instance.
  if (!idl.metadata) idl.metadata = {};
  idl.metadata.address = programId.toString();

  // Load wallet from default keypair
  const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR || `${process.env.HOME || process.env.USERPROFILE}\\.config\\solana\\id.json`;
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH))));

  const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

  // Confirm IDL metadata and program id being used
  console.log('Using programId:', programId.toString());
  console.log('IDL metadata address:', idl.metadata && idl.metadata.address);

  // Pass programId as a string to avoid downstream PublicKey translation issues
  const program = new anchor.Program(idl, programId, provider);

  const userPubkey = wallet.publicKey;
  const [userConfigPDA, userConfigBump] = await PublicKey.findProgramAddress([
    Buffer.from('config'),
    userPubkey.toBuffer(),
  ], programId);
  const [vaultPDA, vaultBump] = await PublicKey.findProgramAddress([
    Buffer.from('vault'),
    userPubkey.toBuffer(),
  ], programId);

  console.log('Wallet:', userPubkey.toBase58());
  console.log('UserConfig PDA:', userConfigPDA.toBase58());
  console.log('Vault PDA:', vaultPDA.toBase58());

  try {
    console.log('Calling initializeUser(5)...');
    const tx = await program.methods.initializeUser(5).accounts({
      userConfig: userConfigPDA,
      vault: vaultPDA,
      user: userPubkey,
      systemProgram: SystemProgram.programId,
    }).rpc();
    console.log('initializeUser tx:', tx);
  } catch (err) {
    console.error('initializeUser error (may already be init):', err);
    if (err.logs) console.error('logs:', err.logs);
  }

  // Deposit a small amount: 0.01 SOL -> 10_000_000 lamports
  const depositAmount = 10_000_000;
  try {
    console.log('Calling deposit(', depositAmount, ')');
    const tx = await program.methods.deposit(new anchor.BN(depositAmount)).accounts({
      userConfig: userConfigPDA,
      vault: vaultPDA,
      user: userPubkey,
      owner: userPubkey,
      systemProgram: SystemProgram.programId,
    }).rpc();
    console.log('deposit tx:', tx);
  } catch (err) {
    console.log('deposit error:', err.toString());
  }
  // Fetch vault balance after deposit
  let vaultBalance = await connection.getBalance(vaultPDA, 'confirmed');
  console.log('Vault balance (lamports) after deposit:', vaultBalance);
  console.log('Vault balance (SOL) after deposit:', vaultBalance / anchor.web3.LAMPORTS_PER_SOL);

  // Withdraw a small amount: withdrawAmount lamports
  const withdrawAmount = 5_000_000; // 0.005 SOL
  try {
    console.log('Calling withdraw(', withdrawAmount, ')');
    const txw = await program.methods.withdraw(new anchor.BN(withdrawAmount)).accounts({
      userConfig: userConfigPDA,
      vault: vaultPDA,
      user: userPubkey,
      owner: userPubkey,
      systemProgram: SystemProgram.programId,
    }).rpc();
    console.log('withdraw tx:', txw);
  } catch (err) {
    console.log('withdraw error:', err.toString());
  }

  // Fetch vault balance after withdraw
  vaultBalance = await connection.getBalance(vaultPDA, 'confirmed');
  console.log('Vault balance (lamports) after withdraw:', vaultBalance);
  console.log('Vault balance (SOL) after withdraw:', vaultBalance / anchor.web3.LAMPORTS_PER_SOL);
})();
