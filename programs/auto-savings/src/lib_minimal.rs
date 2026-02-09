use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv");

// Platform fee: 0.4% (40 basis points out of 10,000)
const PLATFORM_FEE_BASIS_POINTS: u64 = 40;
const BASIS_POINTS_DIVISOR: u64 = 10000;
const TVL_CAP_LAMPORTS: u64 = 10_000_000_000; // 10 SOL cap

#[program]
pub mod auto_savings {
    use super::*;

    /// Initialize the platform treasury (one-time, protocol operator only)
    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        treasury_config.authority = ctx.accounts.authority.key();
        treasury_config.total_fees_collected = 0;
        treasury_config.bump = ctx.bumps.treasury_config;
        treasury_config.is_paused = false;
        treasury_config.total_tvl = 0;
        treasury_config.tvl_cap = TVL_CAP_LAMPORTS;
        msg!("Platform treasury initialized with 10 SOL TVL cap");
        Ok(())
    }

    /// Initialize a user's savings account and vault
    pub fn initialize_user(ctx: Context<InitializeUser>, savings_rate: u8) -> Result<()> {
        require!(
            savings_rate >= 1 && savings_rate <= 90,
            ErrorCode::InvalidSavingsRate
        );

        let user_config = &mut ctx.accounts.user_config;
        user_config.owner = ctx.accounts.user.key();
        user_config.savings_rate = savings_rate;
        user_config.total_saved = 0;
        user_config.total_withdrawn = 0;
        user_config.transaction_count = 0;
        user_config.is_active = true;
        user_config.bump = ctx.bumps.user_config;
        user_config.vault_bump = ctx.bumps.vault;

        msg!("User initialized with {}% savings rate", savings_rate);
        Ok(())
    }

    /// Update the user's savings rate
    pub fn update_savings_rate(ctx: Context<UpdateSavingsRate>, new_rate: u8) -> Result<()> {
        require!(
            new_rate >= 1 && new_rate <= 90,
            ErrorCode::InvalidSavingsRate
        );

        let user_config = &mut ctx.accounts.user_config;
        require!(user_config.is_active, ErrorCode::AccountNotActive);

        let old_rate = user_config.savings_rate;
        user_config.savings_rate = new_rate;

        msg!("Savings rate updated from {}% to {}%", old_rate, new_rate);
        Ok(())
    }

    /// Manually deposit SOL into the savings vault
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let user_config = &mut ctx.accounts.user_config;
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

        require!(user_config.is_active, ErrorCode::AccountNotActive);

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

            treasury_config.total_fees_collected = treasury_config
                .total_fees_collected
                .checked_add(platform_fee)
                .ok_or(ErrorCode::Overflow)?;
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

        // Update stats
        user_config.total_saved = user_config
            .total_saved
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;

        treasury_config.total_tvl = treasury_config
            .total_tvl
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;

        user_config.transaction_count = user_config
            .transaction_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!(
            "Deposited {} lamports to vault (fee: {} lamports)",
            amount_after_fee,
            platform_fee
        );
        Ok(())
    }

    /// Withdraw SOL from the savings vault
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let user_config = &mut ctx.accounts.user_config;
        let treasury_config = &mut ctx.accounts.treasury_config;
        require!(user_config.is_active, ErrorCode::AccountNotActive);

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

            treasury_config.total_fees_collected = treasury_config
                .total_fees_collected
                .checked_add(platform_fee)
                .ok_or(ErrorCode::Overflow)?;
        }

        // Update stats
        user_config.total_withdrawn = user_config
            .total_withdrawn
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        treasury_config.total_tvl = treasury_config
            .total_tvl
            .checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;

        user_config.transaction_count = user_config
            .transaction_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!(
            "Withdrawn {} lamports from vault (fee: {} lamports)",
            amount,
            platform_fee
        );
        Ok(())
    }
}

// Account Structures
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
pub struct InitializeUser<'info> {
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
pub struct UpdateSavingsRate<'info> {
    #[account(
        mut,
        seeds = [b"user_config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,
    pub user: Signer<'info>,
    /// CHECK: Owner field in user_config
    pub owner: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
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
    /// CHECK: Owner field in user_config
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
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
    /// CHECK: Owner field in user_config
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

// Data Structures
#[account]
#[derive(InitSpace)]
pub struct TreasuryConfig {
    pub authority: Pubkey,
    pub total_fees_collected: u64,
    pub bump: u8,
    pub is_paused: bool,
    pub total_tvl: u64,
    pub tvl_cap: u64,
}

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    pub owner: Pubkey,
    pub savings_rate: u8,
    pub total_saved: u64,
    pub total_withdrawn: u64,
    pub transaction_count: u64,
    pub is_active: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid savings rate. Must be between 1-90%")]
    InvalidSavingsRate,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Account not active")]
    AccountNotActive,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("TVL cap exceeded")]
    TvlCapExceeded,
}
