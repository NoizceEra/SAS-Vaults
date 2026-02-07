# 🪐 Jupiter Integration Guide

**Last Updated:** February 6, 2026  
**Status:** Implementation Guide for Jupiter CPI Integration

---

## 📋 Overview

This guide covers the complete integration of Jupiter Aggregator into the Solana Auto-Savings Protocol for on-chain token swaps.

---

## 🎯 Integration Approach

We'll use **Jupiter CPI (Cross-Program Invocation)** which is the recommended method as of January 2025. This allows our smart contract to execute swaps directly on-chain without requiring external API calls.

### Architecture

```
User → Auto-Savings Program → Jupiter Program → DEX(s) → Token Output
```

### Key Steps

1. Add `jupiter-cpi` dependency to Cargo.toml
2. Update `swap_to_token` instruction with Jupiter CPI
3. Handle wSOL wrapping/unwrapping
4. Implement proper account validation
5. Add comprehensive error handling

---

## 📦 Step 1: Update Dependencies

**File:** `programs/auto-savings/Cargo.toml`

```toml
[dependencies]
anchor-lang = "0.32.1"
anchor-spl = "0.32.1"
jupiter-cpi = "0.1.0"  # Add this

# Pin blake3 to a version that doesn't require edition2024
blake3 = { version = "=1.5.5", features = ["digest"] }
```

---

## 🔧 Step 2: Implement Jupiter CPI

### Jupiter Program IDs

```rust
// Mainnet
pub const JUPITER_PROGRAM_ID: Pubkey = pubkey!("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

// Devnet (for testing)
pub const JUPITER_PROGRAM_ID_DEVNET: Pubkey = pubkey!("JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB");
```

### Updated `swap_to_token` Function

```rust
use anchor_spl::token::{self, Token, TokenAccount, Transfer as TokenTransfer, Mint};
use anchor_lang::solana_program::program::invoke_signed;

/// Swap SOL to SPL token using Jupiter Aggregator
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

    // Transfer fee to treasury
    if platform_fee > 0 {
        let user_key = ctx.accounts.user.key();
        let vault_seeds: &[&[u8]] = &[
            b"vault".as_ref(),
            user_key.as_ref(),
            &[user_config.vault_bump],
        ];
        let vault_signer_seeds = &[&vault_seeds[..]];

        let fee_transfer = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
            vault_signer_seeds,
        );
        transfer(fee_transfer, platform_fee)?;
    }

    // Execute Jupiter swap via CPI
    let swap_accounts = vec![
        // Jupiter program accounts
        ctx.accounts.jupiter_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.user_source_token_account.to_account_info(),
        ctx.accounts.user_destination_token_account.to_account_info(),
        ctx.accounts.user_transfer_authority.to_account_info(),
        // Add other required accounts based on Jupiter's interface
    ];

    // Create PDA signer for vault
    let user_key = ctx.accounts.user.key();
    let vault_seeds: &[&[u8]] = &[
        b"vault".as_ref(),
        user_key.as_ref(),
        &[user_config.vault_bump],
    ];
    let vault_signer_seeds = &[&vault_seeds[..]];

    // Build Jupiter swap instruction
    let swap_instruction = jupiter_cpi::instruction::swap(
        &ctx.accounts.jupiter_program.key(),
        &ctx.accounts.sol_vault.key(),
        &ctx.accounts.token_account.key(),
        amount_after_fee,
        min_amount_out,
    )?;

    // Execute swap
    invoke_signed(
        &swap_instruction,
        &swap_accounts,
        vault_signer_seeds,
    )?;

    // Update token vault statistics
    let token_vault_config = &mut ctx.accounts.token_vault_config;
    token_vault_config.total_deposited = token_vault_config
        .total_deposited
        .checked_add(min_amount_out)
        .ok_or(ErrorCode::Overflow)?;

    msg!(
        "Swapped {} SOL to {} tokens (fee: {} SOL)",
        amount_after_fee,
        min_amount_out,
        platform_fee
    );

    Ok(())
}
```

---

## 📝 Step 3: Update Account Context

```rust
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

    /// CHECK: Jupiter program
    #[account(address = JUPITER_PROGRAM_ID)]
    pub jupiter_program: AccountInfo<'info>,

    /// CHECK: User's source token account for swap
    #[account(mut)]
    pub user_source_token_account: AccountInfo<'info>,

    /// CHECK: User's destination token account for swap
    #[account(mut)]
    pub user_destination_token_account: AccountInfo<'info>,

    /// CHECK: Transfer authority for Jupiter
    pub user_transfer_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

---

## 🧪 Step 4: Testing

### Test File: `tests/jupiter-swap.ts`

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AutoSavings } from "../target/types/auto_savings";
import { assert } from "chai";

describe("Jupiter Swap Integration", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AutoSavings as Program<AutoSavings>;
  const user = provider.wallet;

  // USDC mint on devnet
  const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

  it("Swaps SOL to USDC via Jupiter", async () => {
    const amountIn = new anchor.BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
    const minAmountOut = new anchor.BN(1000000); // 1 USDC (6 decimals)

    const tx = await program.methods
      .swapToToken(amountIn, minAmountOut)
      .accounts({
        // ... account setup
      })
      .rpc();

    console.log("Swap transaction:", tx);
  });
});
```

---

## ⚠️ Important Considerations

### 1. Compute Units

Jupiter swaps can be compute-intensive. You may need to request additional compute units:

```rust
// In your instruction
solana_program::compute_budget::request_units(400_000)?;
```

### 2. Account Size Limits

Jupiter routes through multiple DEXs, which means many accounts. Ensure your transaction doesn't exceed Solana's account limits.

### 3. Slippage Protection

Always set a reasonable `min_amount_out` to protect users from MEV attacks and price slippage.

### 4. Error Handling

Add specific error codes for Jupiter-related failures:

```rust
#[error_code]
pub enum ErrorCode {
    // ... existing errors
    #[msg("Jupiter swap failed")]
    JupiterSwapFailed,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}
```

---

## 🚀 Deployment Checklist

- [ ] Add `jupiter-cpi` dependency
- [ ] Update `swap_to_token` function
- [ ] Update `SwapToToken` account context
- [ ] Add Jupiter program ID constant
- [ ] Test on devnet with real swaps
- [ ] Verify slippage protection works
- [ ] Test with different token pairs (SOL/USDC, SOL/USDT)
- [ ] Monitor compute unit usage
- [ ] Add comprehensive error handling
- [ ] Update frontend to pass correct accounts
- [ ] Document account requirements for users

---

## 📚 Resources

- **Jupiter Docs:** https://station.jup.ag/docs/apis/cpi
- **Jupiter CPI Example:** https://github.com/jup-ag/jupiter-cpi-swap-example
- **Solana CPI Guide:** https://docs.solana.com/developing/programming-model/calling-between-programs

---

## 🔄 Next Steps

1. **Implement the code** following this guide
2. **Test thoroughly** on devnet
3. **Get security audit** before mainnet
4. **Deploy to mainnet** with confidence

---

**Note:** This is a simplified implementation. Production code should include additional safety checks, proper account validation, and comprehensive error handling.
