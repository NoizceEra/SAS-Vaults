use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("GsH9GZHHiVpoTkCgcdjWsezUup8b3dC7YkPF2mbzAzsJ");

// Platform fee: 0.4% (40 basis points out of 10,000)
const PLATFORM_FEE_BASIS_POINTS: u64 = 40;
const BASIS_POINTS_DIVISOR: u64 = 10000;
const TVL_CAP_LAMPORTS: u64 = 100_000_000_000; // 100 SOL cap

#[program]
pub mod auto_savings {
    use super::*;

    /// Initialize the platform treasury (one-time, protocol operator only)
    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        treasury_config.authority = ctx.accounts.authority.key();
        treasury_config.bump = ctx.bumps.treasury_config;
        treasury_config.is_paused = false;
        treasury_config.total_tvl = 0;
        treasury_config.tvl_cap = TVL_CAP_LAMPORTS;
        Ok(())
    }

    /// Activate a user's savings profile and vault
    pub fn activate_user(ctx: Context<ActivateUser>) -> Result<()> {
        let user_config = &mut ctx.accounts.user_config;
        user_config.owner = ctx.accounts.user.key();
        user_config.bump = ctx.bumps.user_config;
        user_config.vault_bump = ctx.bumps.vault;
        user_config.total_saved = 0;
        Ok(())
    }

    /// Save SOL into the secure vault (calculates 0.4% fee)
    pub fn save_sol(ctx: Context<SaveSol>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let treasury_config = &mut ctx.accounts.treasury_config;
        require!(!treasury_config.is_paused, ErrorCode::ProtocolPaused);

        let new_tvl = treasury_config
            .total_tvl
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;
        require!(
            new_tvl <= treasury_config.tvl_cap,
            ErrorCode::TvlCapExceeded
        );

        // Calculate platform fee (0.4%)
        let platform_fee = (amount as u128)
            .checked_mul(PLATFORM_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(BASIS_POINTS_DIVISOR as u128)
            .ok_or(ErrorCode::Overflow)? as u64;

        let amount_after_fee = amount
            .checked_sub(platform_fee)
            .ok_or(ErrorCode::Overflow)?;

        // Transfer fee to treasury
        if platform_fee > 0 {
            let fee_transfer = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            );
            transfer(fee_transfer, platform_fee)?;
        }

        // Transfer remaining SOL to vault
        let vault_transfer = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(vault_transfer, amount_after_fee)?;

        // Update global TVL and user stats
        treasury_config.total_tvl = treasury_config
            .total_tvl
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;
            
        let user_config = &mut ctx.accounts.user_config;
        user_config.total_saved = user_config.total_saved
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;

        Ok(())
    }

    /// Withdraw SOL from the savings vault
    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let user_config = &mut ctx.accounts.user_config;
        let treasury_config = &mut ctx.accounts.treasury_config;

        // Calculate platform fee (0.4%)
        let platform_fee = (amount as u128)
            .checked_mul(PLATFORM_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(BASIS_POINTS_DIVISOR as u128)
            .ok_or(ErrorCode::Overflow)? as u64;

        let total_needed = amount
            .checked_add(platform_fee)
            .ok_or(ErrorCode::Overflow)?;

        // Check vault has sufficient balance
        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= total_needed, ErrorCode::InsufficientFunds);

        // Create signer seeds for vault PDA
        let user_key = ctx.accounts.user.key();
        let seeds: &[&[u8]] = &[
            b"vault".as_ref(),
            user_key.as_ref(),
            &[user_config.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Transfer from vault to user
        let user_transfer = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            signer_seeds,
        );
        transfer(user_transfer, amount)?;

        // Transfer fee to treasury
        if platform_fee > 0 {
            let fee_transfer = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
                signer_seeds,
            );
            transfer(fee_transfer, platform_fee)?;
        }

        // Update global TVL and user stats
        treasury_config.total_tvl = treasury_config
            .total_tvl
            .checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;
            
        user_config.total_saved = user_config.total_saved
            .checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TreasuryConfig::INIT_SPACE,
        seeds = [b"treasury_config"],
        bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        seeds = [b"treasury_vault"],
        bump
    )]
    /// CHECK: Treasury PDA for collecting fees
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ActivateUser<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserConfig::INIT_SPACE,
        seeds = [b"user_config", user.key().as_ref()],
        bump
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    /// CHECK: User's savings vault PDA
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SaveSol<'info> {
    #[account(
        mut,
        seeds = [b"user_config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = user_config.vault_bump
    )]
    /// CHECK: User's savings vault PDA
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"treasury_config"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump
    )]
    /// CHECK: Treasury PDA
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        mut,
        seeds = [b"user_config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = user_config.vault_bump
    )]
    /// CHECK: User's savings vault PDA
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"treasury_config"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump
    )]
    /// CHECK: Treasury PDA
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TreasuryConfig {
    pub authority: Pubkey,
    pub bump: u8,
    pub is_paused: bool,
    pub total_tvl: u64,
    pub tvl_cap: u64,
}

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    pub owner: Pubkey,
    pub bump: u8,
    pub vault_bump: u8,
    pub total_saved: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("TVL cap exceeded")]
    TvlCapExceeded,
}
