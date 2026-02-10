# 🚀 Minimal Version Deployment Guide - Solana Playground

Since we've stripped the program to its absolute minimum to save costs, here is the exact code you need to copy-paste into Solana Playground.

## 📋 Steps to Deploy

1. **Open Solana Playground**: https://beta.solpg.io/
2. **Create New Project**: Name it `auto_savings_minimal`
3. **Connect Wallet**: Create a fresh burner wallet in the playground (do not use your main wallet).
4. **Copy Code**: Replace the contents of `src/lib.rs` with the code below.
5. **Build**: Click the "Build" button.
6. **Deploy**: Click the "Deploy" icon (hammer/wrench) and then "Deploy".

---

## 💻 Minimal Smart Contract Code

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

// ⚠️ REPLACE THIS WITH YOUR NEW PROGRAM ID AFTER FIRST DEPLOYMENT ATTEMPT IF NEEDED
// But initially, you can let Playground generate one for you.
declare_id!("11111111111111111111111111111111"); 

const PLATFORM_FEE_BASIS_POINTS: u64 = 40; // 0.4%
const BASIS_POINTS_DIVISOR: u64 = 10000;
const TVL_CAP_LAMPORTS: u64 = 10_000_000_000; // 10 SOL Cap

#[program]
pub mod auto_savings {
    use super::*;

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        treasury_config.authority = ctx.accounts.authority.key();
        treasury_config.bump = ctx.bumps.treasury_config;
        treasury_config.is_paused = false;
        treasury_config.total_tvl = 0;
        treasury_config.tvl_cap = TVL_CAP_LAMPORTS;
        msg!("Treasury initialized");
        Ok(())
    }

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_config = &mut ctx.accounts.user_config;
        user_config.owner = ctx.accounts.user.key();
        user_config.bump = ctx.bumps.user_config;
        user_config.vault_bump = ctx.bumps.vault;
        msg!("User initialized");
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        
        // Security Checks
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(!treasury_config.is_paused, ErrorCode::ProtocolPaused);
        
        let new_tvl = treasury_config.total_tvl.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        require!(new_tvl <= treasury_config.tvl_cap, ErrorCode::TvlCapExceeded);

        // Fee Calculation
        let platform_fee = (amount as u128)
            .checked_mul(PLATFORM_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(BASIS_POINTS_DIVISOR as u128)
            .ok_or(ErrorCode::Overflow)? as u64;

        let amount_after_fee = amount.checked_sub(platform_fee).ok_or(ErrorCode::Overflow)?;

        // Transfer Fee
        if platform_fee > 0 {
            let fee_ctx = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                }
            );
            transfer(fee_ctx, platform_fee)?;
        }

        // Transfer to Vault
        let vault_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            }
        );
        transfer(vault_ctx, amount_after_fee)?;

        // Update Global State
        treasury_config.total_tvl = new_tvl;

        msg!("Deposited: {}", amount_after_fee);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let user_config = &ctx.accounts.user_config;
        let treasury_config = &mut ctx.accounts.treasury_config;

        require!(amount > 0, ErrorCode::InvalidAmount);

        // Fee Calculation
        let platform_fee = (amount as u128)
            .checked_mul(PLATFORM_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(BASIS_POINTS_DIVISOR as u128)
            .ok_or(ErrorCode::Overflow)? as u64;

        let total_needed = amount.checked_add(platform_fee).ok_or(ErrorCode::Overflow)?;

        // Create Signer Seeds
        let user_key = ctx.accounts.user.key();
        let seeds: &[&[u8]] = &[
            b"vault".as_ref(),
            user_key.as_ref(),
            &[user_config.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Transfer to User
        let user_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            signer_seeds
        );
        transfer(user_ctx, amount)?;

        // Transfer Fee
        if platform_fee > 0 {
            let fee_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
                signer_seeds
            );
            transfer(fee_ctx, platform_fee)?;
        }

        // Update Global State
        treasury_config.total_tvl = treasury_config.total_tvl.checked_sub(amount).ok_or(ErrorCode::Overflow)?;

        msg!("Withdrawn: {}", amount);
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
    #[account(seeds = [b"treasury_vault"], bump)]
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
    #[account(seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)] // Removed has_one check for simplicity, anyone can deposit to your vault
    pub user_config: Account<'info, UserConfig>,
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump = user_config.vault_bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut, seeds = [b"treasury_config"], bump = treasury_config.bump)]
    pub treasury_config: Account<'info, TreasuryConfig>,
    #[account(mut, seeds = [b"treasury_vault"], bump)]
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        seeds = [b"user_config", user.key().as_ref()], 
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump = user_config.vault_bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut, seeds = [b"treasury_config"], bump = treasury_config.bump)]
    pub treasury_config: Account<'info, TreasuryConfig>,
    #[account(mut, seeds = [b"treasury_vault"], bump)]
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub owner: Signer<'info>, // Require owner signature
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
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")] InvalidAmount,
    #[msg("Insufficient funds")] InsufficientFunds,
    #[msg("Unauthorized")] Unauthorized,
    #[msg("Overflow")] Overflow,
    #[msg("Protocol paused")] ProtocolPaused,
    #[msg("TVL Cap Exceeded")] TvlCapExceeded,
}
```
