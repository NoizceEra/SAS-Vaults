# Auto-Savings Protocol Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Solana CLI** installed and configured
2. **Anchor Framework** (v0.29.0+) installed
3. **Node.js** (v16+) and **npm** installed
4. **Rust** toolchain installed
5. A funded Solana wallet

## Installation Steps

### 1. Install Solana CLI

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version

# Create a new wallet (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Check your wallet address
solana address
```

### 2. Install Anchor

```bash
# Install Anchor Version Manager
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest Anchor version
avm install latest
avm use latest

# Verify installation
anchor --version
```

### 3. Install Project Dependencies

```bash
cd SAS
npm install
```

## Configuration

### 1. Set Solana Cluster

For **Devnet** (testing):
```bash
solana config set --url devnet
```

For **Mainnet** (production):
```bash
solana config set --url mainnet-beta
```

### 2. Fund Your Wallet

**Devnet:**
```bash
solana airdrop 2
```

**Mainnet:**
Transfer SOL to your wallet address from an exchange or another wallet.

### 3. Verify Configuration

```bash
# Check current configuration
solana config get

# Check wallet balance
solana balance
```

## Building the Program

### Build Command

```bash
anchor build
```

This will:
- Compile the Rust program
- Generate the IDL (Interface Definition Language) file
- Create the program keypair in `target/deploy/`

### Get Program ID

```bash
solana address -k target/deploy/auto_savings-keypair.json
```

### Update Program ID

Update the program ID in two places:

1. **Anchor.toml**:
```toml
[programs.devnet]
auto_savings = "YOUR_PROGRAM_ID_HERE"
```

2. **programs/auto-savings/src/lib.rs**:
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

Then rebuild:
```bash
anchor build
```

## Deployment

### Automated Deployment (Recommended)

Use the deployment script:

```bash
# Deploy to devnet
bash scripts/deploy.sh devnet

# Deploy to mainnet
bash scripts/deploy.sh mainnet-beta
```

### Manual Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

### Verify Deployment

```bash
solana program show <PROGRAM_ID>
```

## Testing

### Run Tests

```bash
# Run all tests
anchor test

# Run tests without deploying
anchor test --skip-deploy

# Run tests with logs
anchor test -- --nocapture
```

### Test on Devnet

```bash
# Set cluster to devnet
anchor test --provider.cluster devnet
```

## Post-Deployment

### 1. Update Frontend Configuration

Update the Program ID in your frontend:

**sdk/client.ts**:
```typescript
const PROGRAM_ID = new PublicKey('YOUR_DEPLOYED_PROGRAM_ID');
```

### 2. Generate TypeScript Types

```bash
# This is done automatically during build, but you can regenerate:
anchor build
```

The IDL and types will be in:
- `target/idl/auto_savings.json`
- `target/types/auto_savings.ts`

### 3. Initialize Your User Account

Using the SDK:
```typescript
import { AutoSavingsClient } from './sdk/client';

const client = new AutoSavingsClient(connection, wallet);
await client.initializeUser(10); // 10% savings rate
```

## Upgrading the Program

### 1. Make Changes

Edit `programs/auto-savings/src/lib.rs`

### 2. Rebuild

```bash
anchor build
```

### 3. Upgrade

```bash
anchor upgrade target/deploy/auto_savings.so --program-id <PROGRAM_ID> --provider.cluster devnet
```

## Monitoring

### View Program Logs

```bash
solana logs <PROGRAM_ID>
```

### Check Program Account

```bash
solana program show <PROGRAM_ID>
```

### View Transaction

```bash
solana confirm -v <TRANSACTION_SIGNATURE>
```

## Troubleshooting

### "Insufficient funds" Error

**Solution**: Fund your wallet with more SOL
```bash
# Devnet
solana airdrop 2

# Mainnet
# Transfer SOL from exchange
```

### "Program ID mismatch" Error

**Solution**: Ensure Program ID matches in:
1. `Anchor.toml`
2. `lib.rs` (declare_id!)
3. Rebuild after updating

### Build Errors

**Solution**: 
```bash
# Clean and rebuild
anchor clean
anchor build
```

### Test Failures

**Solution**:
```bash
# Check Solana cluster
solana config get

# Ensure local validator is running (for local tests)
solana-test-validator

# Run tests with verbose output
anchor test -- --nocapture
```

## Security Considerations

### Before Mainnet Deployment

1. **Audit the Code**: Have the smart contract audited by professionals
2. **Test Thoroughly**: Run extensive tests on devnet
3. **Use Multisig**: Consider using a multisig for program authority
4. **Set Upgrade Authority**: Decide on upgrade authority strategy
5. **Monitor Transactions**: Set up monitoring for suspicious activity

### Recommended Security Practices

1. **Limit Initial Deployment**: Start with limited functionality
2. **Gradual Rollout**: Don't promote to all users immediately
3. **Bug Bounty**: Consider running a bug bounty program
4. **Emergency Procedures**: Have a plan for pausing/upgrading if issues arise

## Cost Estimates

### Devnet
- **Deployment**: Free (airdrop SOL)
- **Testing**: Free

### Mainnet
- **Program Deployment**: ~2-5 SOL (depending on program size)
- **Account Creation**: ~0.002 SOL per user
- **Transactions**: ~0.000005 SOL per transaction

## Support

For issues or questions:
1. Check the [Anchor Documentation](https://www.anchor-lang.com/)
2. Visit [Solana Stack Exchange](https://solana.stackexchange.com/)
3. Join [Solana Discord](https://discord.gg/solana)

## Next Steps

After successful deployment:

1. ✅ Update frontend with Program ID
2. ✅ Test all instructions on devnet
3. ✅ Initialize test user accounts
4. ✅ Verify vault creation and deposits
5. ✅ Test withdrawal functionality
6. ✅ Monitor program logs
7. ✅ Prepare for mainnet (if applicable)

---

**Remember**: Always test thoroughly on devnet before deploying to mainnet!
