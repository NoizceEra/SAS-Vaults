# 🚀 Solana Playground Deployment Guide - Step by Step

## Current Status: Solana Playground is Open!

You should see the Solana Playground interface with:
- ✅ "Create a new project" button in the sidebar
- ✅ Resources section with links
- ✅ Terminal at the bottom
- ✅ "Not connected" status (we'll fix this)

---

## 📋 Step-by-Step Deployment Instructions

### **Step 1: Create New Project**

1. Click the **"Create a new project"** button in the left sidebar
2. You'll see a dialog asking for:
   - **Project name**: Enter `auto-savings-protocol`
   - **Framework**: Select **"Anchor"**
3. Click **"Create"**

**What happens:** Playground creates a new Anchor project with template code.

---

### **Step 2: Replace Template Code with Your Code**

1. In the left sidebar, you'll see a file tree
2. Navigate to: `src` → `lib.rs`
3. Click on `lib.rs` to open it in the editor
4. **Select ALL the template code** (Ctrl+A)
5. **Delete it**
6. **Copy the code below** and paste it into the editor

---

### **Step 3: Your Complete Program Code**

Copy this ENTIRE code block:

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("GzAdCQF3AiCKeduYgRtok77czGBKcAragigtmWurXHcc");

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
        require!(savings_rate >= 1 && savings_rate <= 90, ErrorCode::InvalidSavingsRate);

        let user_config = &mut ctx.accounts.user_config;
        user_config.owner = ctx.accounts.user.key();
        user_config.savings_rate = savings_rate;
        user_config.total_saved = 0;
        user_config.total_withdrawn = 0;
        user_config.transaction_count = 0;
        user_config.is_active = true;
        user_config.bump = ctx.bumps.user_config;

        msg!("User initialized with {}% savings rate", savings_rate);
        Ok(())
    }

    /// Update the user's savings rate
    pub fn update_savings_rate(ctx: Context<UpdateSavingsRate>, new_rate: u8) -> Result<()> {
        require!(new_rate >= 1 && new_rate <= 90, ErrorCode::InvalidSavingsRate);
        
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
        
        let amount_after_fee = amount.checked_sub(platform_fee)
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
            
            treasury_config.total_fees_collected = treasury_config.total_fees_collected
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
        user_config.total_saved = user_config.total_saved.checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;
        user_config.transaction_count = user_config.transaction_count.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Deposited {} lamports to vault (fee: {} lamports)", amount_after_fee, platform_fee);
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
        
        let total_needed = amount.checked_add(platform_fee)
            .ok_or(ErrorCode::Overflow)?;

        // Check vault has sufficient balance (including fee)
        let vault_balance = ctx.accounts.vault.lamports();
        require!(vault_balance >= total_needed, ErrorCode::InsufficientFunds);

        // Transfer SOL from vault to user using PDA signing
        let user_key = ctx.accounts.user.key();
        let seeds = &[
            b"vault",
            user_key.as_ref(),
            &[user_config.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Transfer requested amount to user
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
            
            treasury_config.total_fees_collected = treasury_config.total_fees_collected
                .checked_add(platform_fee)
                .ok_or(ErrorCode::Overflow)?;
        }

        // Update stats
        user_config.total_withdrawn = user_config.total_withdrawn.checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;
        user_config.transaction_count = user_config.transaction_count.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Withdrawn {} lamports from vault (fee: {} lamports)", amount, platform_fee);
        Ok(())
    }

    /// Process a transfer and automatically save the configured percentage
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
        user_config.total_saved = user_config.total_saved.checked_add(savings_amount)
            .ok_or(ErrorCode::Overflow)?;
        user_config.transaction_count = user_config.transaction_count.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Auto-saved {} lamports ({}% of {} lamports)", 
            savings_amount, user_config.savings_rate, transfer_amount);
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

// ============================================================================
// Account Structures
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    pub owner: Pubkey,           // 32 bytes
    pub savings_rate: u8,        // 1 byte (1-90%)
    pub total_saved: u64,        // 8 bytes
    pub total_withdrawn: u64,    // 8 bytes
    pub transaction_count: u64,  // 8 bytes
    pub is_active: bool,         // 1 byte
    pub bump: u8,                // 1 byte
}

#[account]
#[derive(InitSpace)]
pub struct TreasuryConfig {
    pub authority: Pubkey,          // 32 bytes
    pub total_fees_collected: u64,  // 8 bytes
    pub bump: u8,                    // 1 byte
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
```

---

### **Step 4: Build the Program**

1. Look for the **Build** button (⚙️ icon) in the toolbar
2. Click **"Build"**
3. Wait ~2-3 minutes for the cloud build to complete
4. You'll see build output in the terminal
5. **Success message**: "Build successful" with checkmark ✅

---

### **Step 5: Connect Wallet**

1. Click **"Not connected"** in the bottom-left
2. Select **"Create Playground Wallet"** (easiest option)
3. Playground will generate a wallet for you
4. **Important**: This wallet needs devnet SOL

---

### **Step 6: Get Devnet SOL**

1. In the terminal at the bottom, type:
   ```
   solana airdrop 2
   ```
2. Press Enter
3. Wait for confirmation
4. Repeat if needed: `solana airdrop 2` (you need ~3-4 SOL for deployment)

---

### **Step 7: Deploy to Devnet**

1. Click the **"Deploy"** button (🚀 icon) in the toolbar
2. Select **"Devnet"** from the dropdown
3. Click **"Deploy"**
4. Wait ~30 seconds for deployment
5. **Success!** You'll see your new Program ID

---

### **Step 8: Save Important Information**

After deployment, you'll see:

```
Program Id: [YOUR_NEW_PROGRAM_ID]
```

**COPY THIS PROGRAM ID** - You'll need it for the frontend!

---

### **Step 9: Download the IDL**

1. Click the **"Export"** button (📥 icon)
2. Select **"IDL"**
3. Save the `auto_savings.json` file
4. This goes in your frontend: `frontend/src/idl/auto_savings.json`

---

## ✅ Success Checklist

After completing all steps, you should have:

- [x] Program built successfully
- [x] Program deployed to devnet
- [x] New Program ID copied
- [x] IDL JSON file downloaded
- [x] Ready to initialize treasury
- [x] Ready to update frontend

---

## 🎯 Next Steps After Deployment

1. **Update Frontend**:
   - Replace `frontend/src/idl/auto_savings.json` with downloaded IDL
   - Update Program ID in `frontend/src/sdk/client.js`

2. **Initialize Treasury** (one-time):
   ```typescript
   await program.methods.initializeTreasury().rpc();
   ```

3. **Test**:
   - Connect wallet
   - Initialize user
   - Deposit (verify 0.4% fee)
   - Withdraw (verify 0.4% fee)

---

## 💰 You're Now Collecting Fees!

Every deposit and withdrawal will automatically send 0.4% to your treasury!

**Ready to start? Follow the steps above!** 🚀
