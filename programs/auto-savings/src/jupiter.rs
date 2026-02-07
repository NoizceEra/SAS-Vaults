// Jupiter Integration Module
// This module handles all Jupiter Aggregator CPI calls for token swaps

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{self, Token, TokenAccount, Transfer as TokenTransfer};

// Jupiter Program IDs
#[cfg(feature = "mainnet")]
declare_id!("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

#[cfg(not(feature = "mainnet"))]
declare_id!("JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB");

/// Execute a swap from SOL to SPL token using Jupiter Aggregator
pub fn execute_jupiter_swap(
    jupiter_program: &AccountInfo,
    source_account: &AccountInfo,
    destination_account: &AccountInfo,
    authority: &AccountInfo,
    amount_in: u64,
    min_amount_out: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // Note: This is a simplified implementation
    // In production, you'll need to pass all required Jupiter accounts
    // including route accounts, market accounts, etc.

    msg!(
        "Executing Jupiter swap: {} lamports -> {} tokens minimum",
        amount_in,
        min_amount_out
    );

    // Jupiter swap instruction would be built here
    // The actual implementation requires:
    // 1. Quote data from Jupiter API
    // 2. Route accounts
    // 3. Market program accounts
    // 4. Token accounts

    // For now, this is a placeholder that shows the structure
    // Real implementation will use jupiter_cpi::instruction::swap()

    Ok(())
}

/// Helper function to wrap SOL to wSOL for Jupiter swaps
pub fn wrap_sol_to_wsol(
    system_program: &AccountInfo,
    token_program: &AccountInfo,
    source: &AccountInfo,
    wsol_account: &AccountInfo,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // Transfer SOL to wSOL account
    let transfer_ctx = CpiContext::new_with_signer(
        system_program.clone(),
        Transfer {
            from: source.clone(),
            to: wsol_account.clone(),
        },
        signer_seeds,
    );
    transfer(transfer_ctx, amount)?;

    msg!("Wrapped {} SOL to wSOL", amount);
    Ok(())
}

/// Helper function to unwrap wSOL back to SOL
pub fn unwrap_wsol_to_sol(
    token_program: &AccountInfo,
    wsol_account: &AccountInfo,
    destination: &AccountInfo,
    authority: &AccountInfo,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // Close wSOL account and return SOL
    // This requires calling the Token program's CloseAccount instruction

    msg!("Unwrapping wSOL back to SOL");
    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SwapParams {
    pub amount_in: u64,
    pub min_amount_out: u64,
    pub slippage_bps: u16,
}

impl SwapParams {
    pub fn validate(&self) -> Result<()> {
        require!(self.amount_in > 0, JupiterError::InvalidAmount);
        require!(self.min_amount_out > 0, JupiterError::InvalidAmount);
        require!(self.slippage_bps <= 10000, JupiterError::InvalidSlippage);
        Ok(())
    }
}

#[error_code]
pub enum JupiterError {
    #[msg("Invalid swap amount")]
    InvalidAmount,
    #[msg("Invalid slippage tolerance")]
    InvalidSlippage,
    #[msg("Jupiter swap failed")]
    SwapFailed,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}
