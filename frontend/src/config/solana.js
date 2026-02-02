import { PublicKey } from '@solana/web3.js';

/**
 * Solana Auto-Savings Protocol Configuration
 * 
 * Update PROGRAM_ID after deploying the smart contract
 */

// PLACEHOLDER - Update this after smart contract deployment
// This is a valid Solana address format but not yet deployed
export const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Network Configuration
export const NETWORK = 'devnet'; // 'devnet' | 'mainnet-beta'
export const COMMITMENT = 'confirmed';

// RPC Endpoints
export const RPC_ENDPOINTS = {
    devnet: 'https://api.devnet.solana.com',
    mainnet: 'https://api.mainnet-beta.solana.com',
};

// Platform Fee (0.4%)
export const PLATFORM_FEE_BPS = 40; // 40 basis points = 0.4%

// Default Savings Rate
export const DEFAULT_SAVINGS_RATE = 50; // 50%

// Explorer URLs
export const EXPLORER_URL = `https://explorer.solana.com/?cluster=${NETWORK}`;

export const getExplorerUrl = (signature, type = 'tx') => {
    return `${EXPLORER_URL}/${type}/${signature}`;
};

// Feature Flags
export const FEATURES = {
    ENABLE_DEPOSITS: false, // Enable after contract deployment
    ENABLE_WITHDRAWALS: false, // Enable after contract deployment
    ENABLE_RATE_UPDATES: false, // Enable after contract deployment
    SHOW_DEMO_MODE: true, // Show demo mode banner
};

// Demo Mode Message
export const DEMO_MODE_MESSAGE =
    'Smart contract deployment pending. UI demonstration mode active.';
