import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';

const keypairData = JSON.parse(readFileSync('./target/deploy/auto_savings-keypair.json', 'utf-8'));
const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
console.log(keypair.publicKey.toString());
