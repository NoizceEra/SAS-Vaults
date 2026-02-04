# 🚀 Quick Start Guide - Solana Auto-Savings Protocol

Get your Auto-Savings Protocol up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js 16+ installed
- Basic familiarity with terminal/command line

## 📦 Step 1: Install Solana CLI

**Windows (PowerShell):**
```powershell
# Download and run installer
cmd /c "curl https://release.solana.com/v1.18.0/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe"
C:\solana-install-tmp\solana-install-init.exe v1.18.0
```

**macOS/Linux:**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Verify:**
```bash
solana --version
```

## 🔧 Step 2: Install Anchor

```bash
# Install Anchor Version Manager
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor
avm install latest
avm use latest

# Verify
anchor --version
```

## 💰 Step 3: Setup Wallet

```bash
# Create a new wallet
solana-keygen new

# Set to devnet
solana config set --url devnet

# Get some SOL for testing
solana airdrop 2
```

## 🏗️ Step 4: Build the Program

```bash
# Navigate to project directory
cd SAS

# Install dependencies
npm install

# Build the program
anchor build
```

## 🚀 Step 5: Deploy to Devnet

```bash
# Get your program ID
solana address -k target/deploy/auto_savings-keypair.json

# Update Anchor.toml with your program ID
# (Replace the program ID in Anchor.toml)

# Update lib.rs with your program ID
# (Replace the ID in declare_id!("..."))

# Rebuild
anchor build

# Deploy
anchor deploy --provider.cluster devnet
```

## ✅ Step 6: Test It

```bash
# Run tests
anchor test --skip-deploy
```

## 🎨 Step 7: Integrate Frontend

1. Copy SDK files to your frontend:
   - `sdk/client.ts`
   - `sdk/useAutoSavings.tsx`
   - `target/idl/auto_savings.json`
   - `target/types/auto_savings.ts`

2. Install frontend dependencies:
```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react
```

3. Use the hook in your React component:
```tsx
import { useAutoSavings } from './sdk/useAutoSavings';

function MyComponent() {
  const { initializeUser, deposit, withdraw } = useAutoSavings();
  
  // Initialize with 10% savings rate
  await initializeUser(10);
  
  // Deposit 1 SOL
  await deposit(1);
}
```

## 🎯 Common Commands

```bash
# Build
anchor build

# Test
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# View logs
solana logs <PROGRAM_ID>

# Check balance
solana balance

# Get more devnet SOL
solana airdrop 2
```

## 🐛 Troubleshooting

### "Insufficient funds"
```bash
solana airdrop 2
```

### "Program ID mismatch"
1. Get program ID: `solana address -k target/deploy/auto_savings-keypair.json`
2. Update `Anchor.toml`
3. Update `lib.rs` (declare_id!)
4. Rebuild: `anchor build`

### Build errors
```bash
anchor clean
anchor build
```

## 📚 Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
- Read [INTEGRATION.md](INTEGRATION.md) for frontend integration
- Check out the tests in `tests/auto-savings.ts` for usage examples

## 🆘 Need Help?

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

---

**Ready to save automatically? Let's go! 🎉**
