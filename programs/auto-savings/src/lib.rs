use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

// ✅ UPDATED: New deployment with matching IDL
declare_id!("Gxsu5pFvMMFzjpJ8XRqSmaVteq6FuEXorAoPEEMLjBHj");

// Platform fee: 0.4% (40 basis points out of 10,000)
const PLATFORM_FEE_BASIS_POINTS: u64 = 40;
const BASIS_POINTS_DIVISOR: u64 = 10000;

#[program]
pub mod auto_savings {
    use super::*;

    /// Initialize the platform treasury (one-time, protocol operator only)
    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        treasury_config.authority = ctx.accounts.authority.key();
        treasury_config.total_fees_collected = 0;
        treasury_config.bump = ctx.bumps.treasury_config;

        msg!("Platform treasury initialized");
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

        // Update stats (amount after fee)
        user_config.total_saved = user_config
            .total_saved
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

        // Check vault has sufficient balance (including fee)
        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= total_needed, ErrorCode::InsufficientFunds);

        // Create signer seeds for vault PDA using stored bump
        let user_key = ctx.accounts.user.key();
        let seeds = &[b"vault", user_key.as_ref(), &[user_config.vault_bump]];
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

    /// Process a transfer and automatically save the configured percentage
    /// This would be called as part of a transfer transaction
    pub fn process_transfer(ctx: Context<ProcessTransfer>, transfer_amount: u64) -> Result<()> {
        require!(transfer_amount > 0, ErrorCode::InvalidAmount);

        let user_config = &mut ctx.accounts.user_config;
        require!(user_config.is_active, ErrorCode::AccountNotActive);

        // Calculate savings amount based on rate
        let savings_amount = (transfer_amount as u128)
            .checked_mul(user_config.savings_rate as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(100)
            .ok_or(ErrorCode::Overflow)? as u64;

        require!(savings_amount > 0, ErrorCode::InvalidAmount);

        // Transfer savings to vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(cpi_context, savings_amount)?;

        // Update stats
        user_config.total_saved = user_config
            .total_saved
            .checked_add(savings_amount)
            .ok_or(ErrorCode::Overflow)?;
        user_config.transaction_count = user_config
            .transaction_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!(
            "Auto-saved {} lamports ({}% of {} lamports)",
            savings_amount,
            user_config.savings_rate,
            transfer_amount
        );
        Ok(())
    }

    /// Deactivate the user's account (emergency stop)
    pub fn deactivate(ctx: Context<UpdateSavingsRate>) -> Result<()> {
        let user_config = &mut ctx.accounts.user_config;
        user_config.is_active = false;

        msg!("User account deactivated");
        Ok(())
    }

    /// Reactivate the user's account
    pub fn reactivate(ctx: Context<UpdateSavingsRate>) -> Result<()> {
        let user_config = &mut ctx.accounts.user_config;
        user_config.is_active = true;

        msg!("User account reactivated");
        Ok(())
    }

    /// Withdraw collected fees from treasury (authority only)
    pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let treasury_config = &ctx.accounts.treasury_config;

        // Verify caller is the authority
        require!(
            ctx.accounts.authority.key() == treasury_config.authority,
            ErrorCode::Unauthorized
        );

        // Check treasury has sufficient balance
        let treasury_balance = ctx.accounts.treasury.lamports();
        require!(treasury_balance >= amount, ErrorCode::InsufficientFunds);

        // Create signer seeds for treasury PDA
        let seeds = &[b"treasury_vault", &[ctx.bumps.treasury]];
        let signer_seeds = &[&seeds[..]];

        // Transfer from treasury to authority
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.treasury.to_account_info(),
                to: ctx.accounts.authority.to_account_info(),
            },
            signer_seeds,
        );
        transfer(transfer_ctx, amount)?;

        msg!(
            "Withdrew {} lamports from treasury to authority {}",
            amount,
            ctx.accounts.authority.key()
        );
        Ok(())
    }
}

// ============================================================================
// Account Contexts
// ============================================================================

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TreasuryConfig::INIT_SPACE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    /// CHECK: This is the PDA that will hold platform fees
    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump
    )]
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
        seeds = [b"config", user.key().as_ref()],
        bump
    )]
    pub user_config: Account<'info, UserConfig>,

    /// CHECK: This is the PDA vault that will hold the user's savings
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSavingsRate<'info> {
    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    /// CHECK: This is the PDA vault
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    /// CHECK: Treasury vault for fees
    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    /// CHECK: This is the PDA vault
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    /// CHECK: Treasury vault for fees
    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessTransfer<'info> {
    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    /// CHECK: This is the PDA vault
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    /// CHECK: This is the PDA that holds platform fees
    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// Account Structures
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    pub owner: Pubkey,          // 32 bytes
    pub savings_rate: u8,       // 1 byte (1-90%)
    pub total_saved: u64,       // 8 bytes
    pub total_withdrawn: u64,   // 8 bytes
    pub transaction_count: u64, // 8 bytes
    pub is_active: bool,        // 1 byte
    pub bump: u8,               // 1 byte
    pub vault_bump: u8,         // 1 byte
}

#[account]
#[derive(InitSpace)]
pub struct TreasuryConfig {
    pub authority: Pubkey,         // 32 bytes
    pub total_fees_collected: u64, // 8 bytes
    pub bump: u8,                  // 1 byte
}

// ============================================================================
// Error Codes
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Savings rate must be between 1 and 90")]
    InvalidSavingsRate,

    #[msg("Amount must be greater than 0")]
    InvalidAmount,

    #[msg("Insufficient funds in vault")]
    InsufficientFunds,

    #[msg("Account is not active")]
    AccountNotActive,

    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Arithmetic overflow")]
    Overflow,
}
