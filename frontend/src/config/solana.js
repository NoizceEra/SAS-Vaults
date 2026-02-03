import { PublicKey } from '@solana/web3.js';

/**
 * Solana Auto-Savings Protocol Configuration
 * 
 * Update PROGRAM_ID after deploying the smart contract
 */

// ✅ DEPLOYED TO DEVNET
// Program ID: 8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR
// ✅ UPDATED: New deployment via Solana Playground
export const PROGRAM_ID = new PublicKey('AmDo5E56ankmCRptH2yPdrV4xN2CEDEx4x35fCQdRE4j');

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

// Feature Flags - ALL ENABLED AFTER SUCCESSFUL DEPLOYMENT
export const FEATURES = {
    ENABLE_DEPOSITS: true, // ✅ Enabled - Contract deployed
    ENABLE_WITHDRAWALS: true, // ✅ Enabled - Contract deployed
    ENABLE_RATE_UPDATES: true, // ✅ Enabled - Contract deployed
    SHOW_DEMO_MODE: false, // ❌ Disabled - Live on devnet
};

// Demo Mode Message (not shown when SHOW_DEMO_MODE is false)
export const DEMO_MODE_MESSAGE =
    'Smart contract deployed to devnet. Full functionality active.';
