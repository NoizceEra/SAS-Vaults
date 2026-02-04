use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer as TokenTransfer};

// ✅ UPDATED: New deployment with matching IDL
declare_id!("ALvwuWXCK48qFeTyHxkkSrufhAnP15bh4qkreZSwnhEi");

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
        let seeds: &[&[u8]] = &[b"treasury_vault".as_ref(), &[ctx.bumps.treasury]];
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

    /// Initialize a token vault for a specific SPL token
    pub fn initialize_token_vault(
        ctx: Context<InitializeTokenVault>,
        token_mint: Pubkey,
    ) -> Result<()> {
        let token_vault_config = &mut ctx.accounts.token_vault_config;

        token_vault_config.owner = ctx.accounts.user.key();
        token_vault_config.mint = token_mint;
        token_vault_config.token_account = ctx.accounts.token_account.key();
        token_vault_config.total_deposited = 0;
        token_vault_config.total_withdrawn = 0;
        token_vault_config.bump = ctx.bumps.token_vault_config;

        msg!(
            "Token vault initialized for mint {} with account {}",
            token_mint,
            ctx.accounts.token_account.key()
        );
        Ok(())
    }

    /// Configure auto-swap settings
    pub fn set_auto_swap(
        ctx: Context<SetAutoSwap>,
        enabled: bool,
        target_token_mint: Pubkey,
        min_swap_amount: u64,
    ) -> Result<()> {
        let swap_config = &mut ctx.accounts.swap_config;

        swap_config.user = ctx.accounts.user.key();
        swap_config.auto_swap_enabled = enabled;
        swap_config.target_token_mint = target_token_mint;
        swap_config.min_swap_amount = min_swap_amount;
        swap_config.bump = ctx.bumps.swap_config;

        msg!(
            "Auto-swap {} for user {} (target: {}, min: {} lamports)",
            if enabled { "enabled" } else { "disabled" },
            ctx.accounts.user.key(),
            target_token_mint,
            min_swap_amount
        );
        Ok(())
    }

    /// Swap SOL to SPL token (placeholder for Jupiter integration)
    /// This will be integrated with Jupiter Aggregator in Phase 2
    pub fn swap_to_token(
        ctx: Context<SwapToToken>,
        amount_in: u64,
        min_amount_out: u64,
    ) -> Result<()> {
        require!(amount_in > 0, ErrorCode::InvalidAmount);
        require!(min_amount_out > 0, ErrorCode::InvalidAmount);

        let user_config = &ctx.accounts.user_config;
        require!(user_config.is_active, ErrorCode::AccountNotActive);

        // Calculate platform fee (0.4%)
        let platform_fee = (amount_in as u128)
            .checked_mul(PLATFORM_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(BASIS_POINTS_DIVISOR as u128)
            .ok_or(ErrorCode::Overflow)? as u64;

        let amount_after_fee = amount_in
            .checked_sub(platform_fee)
            .ok_or(ErrorCode::Overflow)?;

        // Check vault has sufficient balance
        let vault_balance = ctx.accounts.sol_vault.lamports();
        require!(vault_balance >= amount_in, ErrorCode::InsufficientFunds);

        // TODO: Phase 2 - Integrate Jupiter Aggregator here
        // For now, this is a placeholder that validates the swap parameters
        // In Phase 2, we'll add:
        // 1. Jupiter CPI call to execute the swap
        // 2. Transfer swapped tokens to user's token vault
        // 3. Update token vault statistics

        msg!(
            "Swap prepared: {} SOL -> token (fee: {} SOL, min out: {} tokens)",
            amount_after_fee,
            platform_fee,
            min_amount_out
        );

        // Placeholder: In Phase 2, actual swap will happen here
        msg!("⚠️  Jupiter integration pending - swap not executed");

        Ok(())
    }

    /// Withdraw SPL tokens from token vault
    pub fn withdraw_token(ctx: Context<WithdrawToken>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let token_vault_config = &mut ctx.accounts.token_vault_config;
        let user_config = &ctx.accounts.user_config;
        require!(user_config.is_active, ErrorCode::AccountNotActive);

        // Verify token account has sufficient balance
        let token_balance = ctx.accounts.token_account.amount;
        require!(token_balance >= amount, ErrorCode::InsufficientFunds);

        // Create signer seeds for token vault config PDA
        let user_key = ctx.accounts.user.key();
        let mint_key = token_vault_config.mint.key();
        let seeds: &[&[u8]] = &[
            b"token_vault".as_ref(),
            user_key.as_ref(),
            mint_key.as_ref(),
            &[token_vault_config.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Transfer tokens from vault to user
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TokenTransfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: token_vault_config.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, amount)?;

        // Update stats
        token_vault_config.total_withdrawn = token_vault_config
            .total_withdrawn
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        msg!(
            "Withdrawn {} tokens from vault (mint: {})",
            amount,
            token_vault_config.mint
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

#[derive(Accounts)]
pub struct InitializeTokenVault<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + TokenVaultConfig::INIT_SPACE,
        seeds = [b"token_vault", user.key().as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub token_vault_config: Account<'info, TokenVaultConfig>,

    /// The associated token account that will hold the tokens
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = token_vault_config
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetAutoSwap<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + SwapConfig::INIT_SPACE,
        seeds = [b"swap_config", user.key().as_ref()],
        bump
    )]
    pub swap_config: Account<'info, SwapConfig>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapToToken<'info> {
    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"token_vault", user.key().as_ref(), token_mint.key().as_ref()],
        bump = token_vault_config.bump
    )]
    pub token_vault_config: Account<'info, TokenVaultConfig>,

    /// CHECK: User's SOL vault
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub sol_vault: SystemAccount<'info>,

    /// The token account that will receive swapped tokens
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = token_vault_config
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

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

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawToken<'info> {
    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"token_vault", user.key().as_ref(), token_vault_config.mint.key().as_ref()],
        bump = token_vault_config.bump
    )]
    pub token_vault_config: Account<'info, TokenVaultConfig>,

    /// The vault's token account
    #[account(
        mut,
        associated_token::mint = token_vault_config.mint,
        associated_token::authority = token_vault_config
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// User's token account to receive tokens
    #[account(
        mut,
        associated_token::mint = token_vault_config.mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
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

/// Token vault configuration for holding SPL tokens
#[account]
#[derive(InitSpace)]
pub struct TokenVaultConfig {
    pub owner: Pubkey,         // 32 bytes - user who owns this vault
    pub mint: Pubkey,          // 32 bytes - token mint address
    pub token_account: Pubkey, // 32 bytes - associated token account
    pub total_deposited: u64,  // 8 bytes - total tokens deposited
    pub total_withdrawn: u64,  // 8 bytes - total tokens withdrawn
    pub bump: u8,              // 1 byte
}

/// Swap configuration for auto-swap feature
#[account]
#[derive(InitSpace)]
pub struct SwapConfig {
    pub user: Pubkey,              // 32 bytes - user wallet
    pub auto_swap_enabled: bool,   // 1 byte - whether auto-swap is enabled
    pub target_token_mint: Pubkey, // 32 bytes - default token to swap to
    pub min_swap_amount: u64,      // 8 bytes - minimum SOL before auto-swap triggers
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
