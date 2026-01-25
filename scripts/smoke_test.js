const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

(async () => {
  const idlPath = require('path').join(process.cwd(), 'target', 'idl', 'auto_savings.json');
  const idl = JSON.parse(fs.readFileSync(idlPath));
  const programId = new PublicKey('8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR');

  // Load wallet from default keypair
  const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR || `${process.env.HOME || process.env.USERPROFILE}\\.config\\solana\\id.json`;
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH))));

  const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

  // Pass programId as a string to avoid downstream PublicKey translation issues
  const program = new anchor.Program(idl, programId.toString(), provider);

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
    console.log('initializeUser error (may already be init):', err.toString());
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

  // Fetch vault balance
  const vaultBalance = await connection.getBalance(vaultPDA, 'confirmed');
  console.log('Vault balance (lamports):', vaultBalance);
  console.log('Vault balance (SOL):', vaultBalance / anchor.web3.LAMPORTS_PER_SOL);
})();
