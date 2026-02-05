# Jupiter Swap Integration Implementation Plan

## Overview
Integrate Jupiter Aggregator for real SOL ↔ SPL token swaps in the Slice protocol.

## Architecture

### Option 1: Client-Side Jupiter (Recommended for MVP)
**Pros:**
- Simpler implementation
- No need to modify smart contract extensively
- Jupiter handles all routing complexity
- Easier to update/maintain

**Cons:**
- Requires 2 transactions (withdraw from vault → swap)
- Slightly higher gas costs

**Flow:**
```
1. User initiates swap in UI
2. Frontend calls Jupiter API for quote
3. User approves transaction
4. Execute: Withdraw SOL from vault → Jupiter swap → Tokens to user's ATA
```

### Option 2: On-Chain CPI Integration
**Pros:**
- Atomic transaction (all or nothing)
- Better UX (single signature)

**Cons:**
- Complex implementation
- Harder to maintain
- Jupiter program updates could break integration

## Recommended Approach: Client-Side (Option 1)

### Phase 1: Frontend Integration

#### Step 1: Install Jupiter SDK
```bash
npm install @jup-ag/api @jup-ag/react-hook
```

#### Step 2: Create Jupiter Hook
```typescript
// frontend/src/hooks/useJupiterSwap.js
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createJupiterApiClient } from '@jup-ag/api';
import { VersionedTransaction } from '@solana/web3.js';

export function useJupiterSwap() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const jupiterApi = createJupiterApiClient();

  const getQuote = async (inputMint, outputMint, amount) => {
    return await jupiterApi.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps: 50, // 0.5%
    });
  };

  const executeSwap = async (quote) => {
    const swapResult = await jupiterApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
      },
    });

    const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature);
    
    return signature;
  };

  return { getQuote, executeSwap };
}
```

#### Step 3: Update SwapInterface Component
- Replace mock rate calculation with real Jupiter quotes
- Implement real swap execution
- Add proper error handling
- Show transaction status

### Phase 2: Smart Contract Updates (Optional Enhancement)

If we want atomic swaps later, we can add Jupiter CPI:

```rust
// Add to Cargo.toml
jupiter-cpi = "0.1.0"

// In lib.rs
use jupiter_cpi::jupiter;

pub fn swap_via_jupiter(
    ctx: Context<SwapViaJupiter>,
    amount_in: u64,
    minimum_amount_out: u64,
) -> Result<()> {
    // Withdraw from vault
    // Call Jupiter CPI
    // Deposit tokens to user's token vault
}
```

## Implementation Steps

### Immediate (Today):
1. ✅ Install Jupiter dependencies
2. ✅ Create useJupiterSwap hook
3. ✅ Update SwapInterface to use real quotes
4. ✅ Test on Devnet with small amounts

### Short-term (This Week):
1. Add swap history tracking
2. Implement auto-swap feature (scheduled swaps)
3. Add price impact warnings
4. Improve error messages

### Long-term (Before Mainnet):
1. Consider on-chain CPI if atomic swaps are critical
2. Add MEV protection
3. Implement advanced routing options
4. Add limit orders (if needed)

## Testing Checklist
- [ ] SOL → USDC swap
- [ ] SOL → USDT swap  
- [ ] SOL → BONK swap
- [ ] Reverse swaps (token → SOL)
- [ ] Slippage protection works
- [ ] Error handling (insufficient balance, etc.)
- [ ] Transaction confirmation UI
- [ ] Swap history display

## Security Considerations
- Always validate quotes before execution
- Implement maximum slippage limits
- Add transaction simulation before signing
- Monitor for suspicious routing
- Rate limit swap requests

## Cost Analysis
- Jupiter fee: ~0.2% (built into quote)
- Platform fee: 0.4% (our fee)
- Solana transaction fee: ~0.000005 SOL
- **Total user cost: ~0.6% + gas**

## Next Steps
Start with frontend integration using Jupiter API. This gives us:
- Real swap functionality immediately
- No smart contract changes needed
- Easy to test and iterate
- Can add on-chain CPI later if needed
