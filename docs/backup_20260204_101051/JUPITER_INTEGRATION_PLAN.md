# 🪐 Jupiter Aggregator Integration - Phase 2

**Date:** February 4, 2026  
**Status:** 📋 Planning  
**Complexity:** High  
**Timeline:** 1-2 weeks

---

## 🎯 Objective

Integrate Jupiter Aggregator to enable real SOL ↔ Token swaps in the Auto-Savings Protocol.

---

## 📚 Prerequisites

### 1. Jupiter Documentation
- **Main Docs:** https://station.jup.ag/docs/apis/swap-api
- **CPI Guide:** https://station.jup.ag/docs/apis/cpi
- **SDK:** https://github.com/jup-ag/jupiter-core

### 2. Required Accounts
- Jupiter Program ID: `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`
- Jupiter V6 Program: `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`

### 3. Dependencies
```toml
[dependencies]
jupiter-cpi = "0.1.0"
# Or use Jupiter V6 SDK
```

---

## 🏗️ Implementation Steps

### Step 1: Add Jupiter Dependency

**Update `Cargo.toml`:**
```toml
[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
jupiter-cpi = { version = "0.1.0", features = ["cpi"] }
```

**Or use direct CPI:**
```toml
# No additional dependency needed
# We'll invoke Jupiter program directly
```

---

### Step 2: Update Smart Contract

**Add Jupiter Program Account:**

```rust
use anchor_lang::prelude::*;

// Jupiter Program ID
pub const JUPITER_PROGRAM_ID: Pubkey = pubkey!("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

#[derive(Accounts)]
pub struct SwapToToken<'info> {
    // ... existing accounts ...
    
    /// Jupiter Program
    /// CHECK: Jupiter V6 Program
    #[account(address = JUPITER_PROGRAM_ID)]
    pub jupiter_program: AccountInfo<'info>,
    
    /// Jupiter Swap State
    /// CHECK: Jupiter manages this account
    pub swap_state: AccountInfo<'info>,
    
    // Additional accounts for routing
    /// CHECK: Intermediate token accounts for multi-hop swaps
    pub route_account_1: Option<AccountInfo<'info>>,
    pub route_account_2: Option<AccountInfo<'info>>,
    pub route_account_3: Option<AccountInfo<'info>>,
}
```

---

### Step 3: Implement Swap Logic

**Replace placeholder in `swap_to_token`:**

```rust
pub fn swap_to_token(
    ctx: Context<SwapToToken>,
    amount_in: u64,
    min_amount_out: u64,
    route_plan: Vec<u8>, // Jupiter route data
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
        let vault_seeds = &[
            b"vault",
            user_key.as_ref(),
            &[user_config.vault_bump]
        ];
        let vault_signer = &[&vault_seeds[..]];

        let fee_transfer = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
            vault_signer,
        );
        transfer(fee_transfer, platform_fee)?;
    }

    // Execute Jupiter Swap
    let swap_instruction = build_jupiter_swap_instruction(
        ctx.accounts.jupiter_program.key(),
        ctx.accounts.sol_vault.key(),
        ctx.accounts.token_account.key(),
        amount_after_fee,
        min_amount_out,
        route_plan,
    )?;

    // Invoke Jupiter Program
    let user_key = ctx.accounts.user.key();
    let vault_seeds = &[
        b"vault",
        user_key.as_ref(),
        &[user_config.vault_bump]
    ];
    let vault_signer = &[&vault_seeds[..]];

    solana_program::program::invoke_signed(
        &swap_instruction,
        &[
            ctx.accounts.sol_vault.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.jupiter_program.to_account_info(),
            ctx.accounts.swap_state.to_account_info(),
            // Add route accounts as needed
        ],
        vault_signer,
    )?;

    // Update token vault statistics
    let token_vault_config = &mut ctx.accounts.token_vault_config;
    token_vault_config.total_deposited = token_vault_config
        .total_deposited
        .checked_add(min_amount_out) // Use actual received amount
        .ok_or(ErrorCode::Overflow)?;

    msg!(
        "Swapped {} SOL -> {} tokens (fee: {} SOL)",
        amount_after_fee,
        min_amount_out,
        platform_fee
    );

    Ok(())
}

// Helper function to build Jupiter swap instruction
fn build_jupiter_swap_instruction(
    jupiter_program: &Pubkey,
    source_account: &Pubkey,
    destination_account: &Pubkey,
    amount_in: u64,
    min_amount_out: u64,
    route_plan: Vec<u8>,
) -> Result<Instruction> {
    // Build Jupiter V6 swap instruction
    // This is a simplified version - actual implementation
    // will need to match Jupiter's exact instruction format
    
    let data = JupiterSwapData {
        amount_in,
        min_amount_out,
        route_plan,
    };

    Ok(Instruction {
        program_id: *jupiter_program,
        accounts: vec![
            AccountMeta::new(*source_account, false),
            AccountMeta::new(*destination_account, false),
            // Add other required accounts
        ],
        data: data.try_to_vec()?,
    })
}
```

---

### Step 4: Frontend Integration

**Install Jupiter SDK:**
```bash
npm install @jup-ag/core @jup-ag/react-hook
```

**Create Jupiter Hook:**
```typescript
// hooks/useJupiter.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Jupiter, RouteInfo } from '@jup-ag/core';
import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

export function useJupiter() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [jupiter, setJupiter] = useState<Jupiter | null>(null);

  useMemo(async () => {
    if (!wallet.publicKey) return;

    const jupiterInstance = await Jupiter.load({
      connection,
      cluster: 'devnet',
      user: wallet.publicKey,
    });

    setJupiter(jupiterInstance);
  }, [connection, wallet.publicKey]);

  const getQuote = async (
    inputMint: PublicKey,
    outputMint: PublicKey,
    amount: number,
    slippageBps: number = 50
  ): Promise<RouteInfo | null> => {
    if (!jupiter) return null;

    const routes = await jupiter.computeRoutes({
      inputMint,
      outputMint,
      amount,
      slippageBps,
      forceFetch: true,
    });

    return routes.routesInfos[0] || null;
  };

  const executeSwap = async (route: RouteInfo) => {
    if (!jupiter || !wallet.signTransaction) return null;

    const { execute } = await jupiter.exchange({
      routeInfo: route,
    });

    const swapResult = await execute();
    return swapResult;
  };

  return { jupiter, getQuote, executeSwap };
}
```

**Update SwapInterface Component:**
```typescript
import { useJupiter } from '@/hooks/useJupiter';

export default function SwapInterface({ program, userConfig }) {
  const { getQuote, executeSwap } = useJupiter();
  const [route, setRoute] = useState<RouteInfo | null>(null);

  // Get real-time quote
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const fetchQuote = async () => {
        const quote = await getQuote(
          new PublicKey(fromToken.mint),
          new PublicKey(toToken.mint),
          parseFloat(amount) * Math.pow(10, fromToken.decimals),
          slippage * 100
        );

        if (quote) {
          setRoute(quote);
          setEstimatedOutput(
            (quote.outAmount / Math.pow(10, toToken.decimals)).toString()
          );
        }
      };

      fetchQuote();
    }
  }, [amount, fromToken, toToken, slippage]);

  const handleSwap = async () => {
    if (!route) return;

    try {
      // Execute via our program with Jupiter route
      const routePlan = route.marketInfos.map(m => ({
        // Serialize route data
      }));

      const tx = await program.methods
        .swapToToken(
          new BN(route.inAmount),
          new BN(route.outAmount),
          Buffer.from(JSON.stringify(routePlan))
        )
        .accounts({
          // ... accounts
          jupiterProgram: JUPITER_PROGRAM_ID,
        })
        .rpc();

      console.log('Swap successful:', tx);
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };
}
```

---

## 🧪 Testing Plan

### 1. Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_swap_calculation() {
        // Test fee calculation
        // Test amount validation
        // Test overflow protection
    }

    #[test]
    fn test_jupiter_instruction_building() {
        // Test instruction serialization
        // Test account ordering
    }
}
```

### 2. Integration Tests
```typescript
describe('Jupiter Swap Integration', () => {
  it('should get quote from Jupiter', async () => {
    const quote = await getQuote(SOL_MINT, USDC_MINT, 1e9);
    expect(quote).toBeDefined();
    expect(quote.outAmount).toBeGreaterThan(0);
  });

  it('should execute swap successfully', async () => {
    const tx = await program.methods.swapToToken(...).rpc();
    expect(tx).toBeDefined();
  });
});
```

### 3. Devnet Testing
- [ ] Test SOL → USDC swap
- [ ] Test SOL → USDT swap
- [ ] Test multi-hop swaps
- [ ] Test slippage protection
- [ ] Test fee collection
- [ ] Test error handling

---

## 📊 Performance Considerations

### Gas Optimization
- Minimize account validations
- Use efficient data structures
- Batch operations where possible

### Slippage Management
- Default: 0.5%
- Max: 5%
- Dynamic based on liquidity

### Route Selection
- Prefer direct routes
- Limit to 3 hops max
- Consider fees in route scoring

---

## 🔐 Security Checklist

- [ ] Validate all Jupiter accounts
- [ ] Check program ID matches
- [ ] Verify route data integrity
- [ ] Implement reentrancy guards
- [ ] Add amount limits
- [ ] Test edge cases
- [ ] Audit before mainnet

---

## 📈 Monitoring & Analytics

### Metrics to Track
- Swap volume (24h, 7d, 30d)
- Average swap size
- Popular token pairs
- Success/failure rate
- Average slippage
- Fee collection

### Logging
```rust
msg!("Swap executed: {} -> {}", input_amount, output_amount);
msg!("Route: {:?}", route_plan);
msg!("Slippage: {}%", actual_slippage);
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Frontend tested
- [ ] Devnet deployment successful

### Deployment
- [ ] Deploy to Devnet
- [ ] Test with real users
- [ ] Monitor for 1 week
- [ ] Fix any issues
- [ ] Deploy to Mainnet

### Post-Deployment
- [ ] Monitor transactions
- [ ] Collect user feedback
- [ ] Optimize based on data
- [ ] Plan v2 features

---

## 📚 Resources

- **Jupiter Docs:** https://station.jup.ag/docs
- **Jupiter Discord:** https://discord.gg/jup
- **Example Code:** https://github.com/jup-ag/jupiter-cpi-example
- **Solana CPI Guide:** https://docs.solana.com/developing/programming-model/calling-between-programs

---

## ⏱️ Timeline

| Week | Tasks |
|------|-------|
| **Week 1** | Smart contract integration, Jupiter CPI setup |
| **Week 2** | Frontend integration, testing, bug fixes |
| **Week 3** | Devnet deployment, user testing |
| **Week 4** | Optimization, documentation, mainnet prep |

---

## ✅ Success Criteria

- [ ] Swaps execute successfully
- [ ] Fees collected correctly
- [ ] Slippage protection works
- [ ] UI shows accurate quotes
- [ ] Error handling robust
- [ ] Performance acceptable (<2s swaps)
- [ ] User feedback positive

---

**Status:** Ready to implement! 🚀  
**Next:** Start with Step 1 (Add Dependencies)
