# 🔧 Integration Guide: Simplified Allocation Functions

**MANUAL INTEGRATION STEPS**

Due to the complexity of automated replacement, please follow these manual steps to integrate the simplified allocation functions.

---

## Step 1: Backup Current File

```powershell
Copy-Item "programs\auto-savings\src\lib.rs" "programs\auto-savings\src\lib.rs.backup"
```

---

## Step 2: Delete Old deposit_with_allocation Function

In `programs/auto-savings/src/lib.rs`:

1. Find line **652**: `/// Deposit SOL and split across allocations based on percentages`
2. Delete from line **652** to line **767** (the entire `deposit_with_allocation` function)
3. This removes ~115 lines of the old complex implementation

---

## Step 3: Insert New deposit_with_allocation Function

At line **652** (where you just deleted), paste this:

```rust
    /// Deposit SOL and track allocation splits (simplified - uses single vault)
    pub fn deposit_with_allocation(
        ctx: Context<DepositWithAllocation>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let allocation_config = &mut ctx.accounts.allocation_config;
        let user_config = &mut ctx.accounts.user_config;
        let treasury_config = &mut ctx.accounts.treasury_config;
        
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

        // Transfer to main SOL vault
        let vault_transfer = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.sol_vault.to_account_info(),
            },
        );
        transfer(vault_transfer, amount_after_fee)?;

        // Update allocation tracking (amounts only, all in one vault)
        for allocation in allocation_config.allocations.iter_mut() {
            if allocation.is_active && allocation.percentage > 0 {
                let allocation_amount = (amount_after_fee as u128)
                    .checked_mul(allocation.percentage as u128)
                    .ok_or(ErrorCode::Overflow)?
                    .checked_div(100)
                    .ok_or(ErrorCode::Overflow)? as u64;
                
                allocation.total_saved = allocation
                    .total_saved
                    .checked_add(allocation_amount)
                    .ok_or(ErrorCode::Overflow)?;

                msg!(
                    "Tracked {} lamports to '{}' ({}%)",
                    allocation_amount,
                    allocation.name,
                    allocation.percentage
                );
            }
        }

        // Update user config
        user_config.total_saved = user_config
            .total_saved
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;
        
        user_config.transaction_count = user_config
            .transaction_count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Deposited {} SOL with allocation tracking (fee: {} SOL)", amount_after_fee, platform_fee);
        Ok(())
    }
```

---

## Step 4: Delete Old withdraw_from_allocation Function

1. Find the line with: `/// Withdraw from a specific allocation`
2. Delete from that line to the closing `}` of the function
3. This should be around lines **769-825**

---

## Step 5: Insert New withdraw_from_allocation Function

Where you just deleted, paste this:

```rust
    /// Withdraw from tracked allocation amount (simplified - from single vault)
    pub fn withdraw_from_allocation(
        ctx: Context<WithdrawFromAllocation>,
        index: u8,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let allocation_config = &mut ctx.accounts.allocation_config;
        let user_config = &mut ctx.accounts.user_config;
        
        // Validate index
        require!(
            (index as usize) < allocation_config.allocations.len(),
            ErrorCode::AllocationNotFound
        );

        let allocation = &mut allocation_config.allocations[index as usize];
        require!(allocation.is_active, ErrorCode::AllocationNotFound);

        // Check allocation has sufficient tracked balance
        let available = allocation
            .total_saved
            .checked_sub(allocation.total_withdrawn)
            .ok_or(ErrorCode::InsufficientFunds)?;
        
        require!(available >= amount, ErrorCode::InsufficientFunds);

        // Check main vault has sufficient balance
        let vault_balance = ctx.accounts.sol_vault.lamports();
        require!(vault_balance >= amount, ErrorCode::InsufficientFunds);

        // Create signer seeds for main vault PDA
        let user_key = ctx.accounts.user.key();
        let vault_seeds: &[&[u8]] = &[
            b"vault".as_ref(),
            user_key.as_ref(),
            &[user_config.vault_bump],
        ];
        let vault_signer_seeds = &[&vault_seeds[..]];

        // Transfer from main vault to user
        let withdraw_transfer = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            vault_signer_seeds,
        );
        transfer(withdraw_transfer, amount)?;

        // Update allocation tracking
        allocation.total_withdrawn = allocation
            .total_withdrawn
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        // Update user config
        user_config.total_withdrawn = user_config
            .total_withdrawn
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        msg!(
            "Withdrawn {} lamports from '{}' allocation",
            amount,
            allocation.name
        );
        Ok(())
    }
```

---

## Step 6: Update Account Contexts

Find the `DepositWithAllocation` struct (around line 1140) and replace it with:

```rust
#[derive(Accounts)]
pub struct DepositWithAllocation<'info> {
    #[account(
        mut,
        seeds = [b"allocation_config", user.key().as_ref()],
        bump = allocation_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub allocation_config: Account<'info, AllocationConfig>,

    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = user_config.vault_bump
    )]
    /// CHECK: Main SOL vault PDA
    pub sol_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"treasury_config"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump
    )]
    /// CHECK: Treasury PDA
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
```

Find the `WithdrawFromAllocation` struct and replace it with:

```rust
#[derive(Accounts)]
#[instruction(index: u8)]
pub struct WithdrawFromAllocation<'info> {
    #[account(
        mut,
        seeds = [b"allocation_config", user.key().as_ref()],
        bump = allocation_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub allocation_config: Account<'info, AllocationConfig>,

    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = user_config.vault_bump
    )]
    /// CHECK: Main SOL vault PDA
    pub sol_vault: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
```

---

## Step 7: Test Compilation

```powershell
cd programs\auto-savings
cargo check
```

Should compile cleanly!

---

## ✅ Expected Result

- No compilation errors
- No lifetime issues
- Clean, simple code
- Ready for testing!

---

## 🔄 If Something Goes Wrong

Restore backup:
```powershell
Copy-Item "programs\auto-savings\src\lib.rs.backup" "programs\auto-savings\src\lib.rs"
```

Then try again!
