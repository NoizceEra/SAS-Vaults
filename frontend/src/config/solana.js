import { PublicKey } from '@solana/web3.js';

/**
 * Solana Auto-Savings Protocol Configuration
 * 
 * Update PROGRAM_ID after deploying the smart contract
 */

// ✅ DEPLOYED TO MAINNET - February 10, 2026
// Program ID: FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn
// ✅ LIVE: Minimal optimized version deployed to mainnet-beta
export const PROGRAM_ID = new PublicKey('FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn');

// Branding
export const APP_NAME = 'Slice';
export const PROTOCOL_NAME = 'Solana Auto-Savings Protocol';
export const TAGLINE = 'Automated Savings on Solana';


// Network Configuration
export const NETWORK = 'mainnet-beta'; // 'devnet' | 'mainnet-beta'
export const COMMITMENT = 'confirmed';

// RPC Endpoints
export const RPC_URL = "https://solana-mainnet.core.chainstack.com/bc71bed16350db49d622b7fa4d7c44d3";
export const RPC_ENDPOINTS = {
    devnet: 'https://api.devnet.solana.com',
    mainnet: RPC_URL,
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
