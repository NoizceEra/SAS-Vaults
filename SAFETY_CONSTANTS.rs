// SAFETY CONSTANTS - Add these after the existing constants in lib.rs
// Around line 11, after BASIS_POINTS_DIVISOR

// ============================================================================
// MINIMUM VIABLE DEPLOYMENT - SAFETY LIMITS
// ============================================================================

// TVL Cap: $1,000 at $100/SOL = 10 SOL = 10 billion lamports
const TVL_CAP_LAMPORTS: u64 = 10_000_000_000; // 10 SOL maximum

// Emergency pause flag (will be added to TreasuryConfig)
// When paused: NO deposits allowed, withdrawals still work

// Swap feature: COMPLETELY DISABLED
// All swap-related functions will return error
