# 📁 Project Structure

```
SAS/
├── 📄 README.md                          # Project overview and documentation
├── 📄 QUICKSTART.md                      # Quick start guide (5-minute setup)
├── 📄 DEPLOYMENT.md                      # Detailed deployment instructions
├── 📄 INTEGRATION.md                     # Frontend integration guide
├── 📄 .gitignore                         # Git ignore rules
├── 📄 Anchor.toml                        # Anchor framework configuration
├── 📄 package.json                       # Node.js dependencies
├── 📄 tsconfig.json                      # TypeScript configuration
│
├── 📂 programs/                          # Solana smart contracts
│   └── 📂 auto-savings/
│       ├── 📄 Cargo.toml                 # Rust dependencies
│       └── 📂 src/
│           └── 📄 lib.rs                 # Main program logic (Rust)
│
├── 📂 tests/                             # Integration tests
│   └── 📄 auto-savings.ts                # Comprehensive test suite
│
├── 📂 sdk/                               # Client SDK for frontend
│   ├── 📄 client.ts                      # TypeScript client library
│   └── 📄 useAutoSavings.tsx             # React hook for easy integration
│
├── 📂 scripts/                           # Deployment and utility scripts
│   └── 📄 deploy.sh                      # Automated deployment script
│
├── 📂 target/                            # Build outputs (generated)
│   ├── 📂 deploy/
│   │   ├── auto_savings.so               # Compiled program
│   │   └── auto_savings-keypair.json     # Program keypair
│   ├── 📂 idl/
│   │   └── auto_savings.json             # Interface Definition Language
│   └── 📂 types/
│       └── auto_savings.ts               # TypeScript type definitions
│
└── 📂 frontend/                          # (Your existing frontend)
    └── 📄 SAS Front End.txt              # React UI component
```

## 📋 File Descriptions

### Root Configuration Files

- **README.md**: Main project documentation with overview, architecture, and getting started guide
- **QUICKSTART.md**: 5-minute quick start guide for rapid setup
- **DEPLOYMENT.md**: Comprehensive deployment guide with troubleshooting
- **INTEGRATION.md**: Frontend integration guide with code examples
- **Anchor.toml**: Anchor framework configuration (program IDs, clusters, scripts)
- **package.json**: Node.js dependencies and npm scripts
- **tsconfig.json**: TypeScript compiler configuration
- **.gitignore**: Git ignore patterns (prevents committing sensitive files)

### Programs Directory (`programs/`)

Contains the Solana smart contract written in Rust using the Anchor framework.

**programs/auto-savings/src/lib.rs**:
- Program entry point
- 7 main instructions:
  1. `initialize_user` - Create user account with savings rate
  2. `update_savings_rate` - Modify savings percentage
  3. `deposit` - Manual deposit to vault
  4. `withdraw` - Withdraw from vault
  5. `process_transfer` - Auto-save on transfers
  6. `deactivate` - Emergency stop
  7. `reactivate` - Resume operations
- PDA (Program Derived Address) management
- Security validations and error handling

**programs/auto-savings/Cargo.toml**:
- Rust dependencies (anchor-lang, anchor-spl)
- Package metadata

### Tests Directory (`tests/`)

**tests/auto-savings.ts**:
- Comprehensive test suite
- Tests all program instructions
- Edge case validation
- Error handling tests
- Integration tests

### SDK Directory (`sdk/`)

Client-side libraries for frontend integration.

**sdk/client.ts**:
- `AutoSavingsClient` class
- Methods for all program instructions
- PDA derivation helpers
- Balance queries
- TypeScript types

**sdk/useAutoSavings.tsx**:
- React hook for easy integration
- State management
- Automatic data loading
- Error handling
- Loading states

### Scripts Directory (`scripts/`)

**scripts/deploy.sh**:
- Automated deployment script
- Builds program
- Updates program IDs
- Deploys to cluster
- Verification steps

### Target Directory (`target/`)

Generated during build process. Contains:

- **deploy/**: Compiled program binaries and keypairs
- **idl/**: Interface Definition Language (JSON schema)
- **types/**: TypeScript type definitions

## 🔑 Key Components

### Smart Contract (Rust)

The core Solana program that:
- Manages user savings configurations
- Creates and manages PDA vaults
- Handles deposits and withdrawals
- Processes automatic savings on transfers
- Enforces security rules

### Client SDK (TypeScript)

Provides easy-to-use interface for:
- Initializing user accounts
- Managing savings rates
- Depositing and withdrawing funds
- Querying balances and configurations
- Deriving PDAs

### React Hook

Simplifies frontend integration with:
- Automatic wallet connection handling
- State management
- Loading states
- Error handling
- Data refresh

## 🔄 Data Flow

```
User Wallet
    ↓
Frontend (React + SDK)
    ↓
Solana RPC
    ↓
Auto-Savings Program (On-chain)
    ↓
User PDA Vault (On-chain)
```

## 🏗️ Architecture

### On-Chain Accounts

1. **UserConfig Account**:
   - PDA derived from: `["config", user_pubkey]`
   - Stores: savings rate, totals, transaction count, status
   - Size: ~59 bytes

2. **Vault Account**:
   - PDA derived from: `["vault", user_pubkey]`
   - Stores: User's saved SOL
   - Rent-exempt

### Security Model

- **Non-custodial**: Users control their funds via PDAs
- **Atomic operations**: Savings occur in same transaction
- **Owner validation**: Only owner can modify their account
- **Rate limits**: Savings rate constrained to 1-90%
- **Emergency controls**: Deactivate/reactivate functionality

## 🚀 Deployment Flow

1. **Build**: `anchor build`
   - Compiles Rust to BPF
   - Generates IDL and types
   - Creates program keypair

2. **Configure**: Update program IDs
   - Anchor.toml
   - lib.rs (declare_id!)

3. **Deploy**: `anchor deploy`
   - Uploads program to Solana
   - Initializes program account

4. **Verify**: Check deployment
   - `solana program show <PROGRAM_ID>`

## 📊 Account Sizes

- **UserConfig**: 59 bytes
  - Discriminator: 8 bytes
  - Owner: 32 bytes
  - Savings rate: 1 byte
  - Total saved: 8 bytes
  - Total withdrawn: 8 bytes
  - Transaction count: 8 bytes
  - Is active: 1 byte
  - Bump: 1 byte

- **Vault**: Variable (holds SOL)
  - Minimum: Rent-exempt amount (~0.002 SOL)

## 💡 Usage Patterns

### Pattern 1: Manual Savings
```
User → deposit() → Vault
User ← withdraw() ← Vault
```

### Pattern 2: Automatic Savings
```
User → transfer() → Recipient
  ↓
  └→ process_transfer() → Vault (X% saved)
```

### Pattern 3: Configuration
```
User → initialize_user(rate) → Create accounts
User → update_savings_rate(new_rate) → Update config
```

## 🔐 Security Considerations

1. **Private Keys**: Never commit keypair JSON files
2. **Program Authority**: Secure the upgrade authority
3. **Rate Validation**: Enforced 1-90% range
4. **Owner Checks**: All operations validate ownership
5. **Overflow Protection**: Checked arithmetic operations

## 📈 Scalability

- **Per-user PDAs**: Each user has unique accounts
- **No global state**: Fully parallelizable
- **Minimal storage**: ~59 bytes per user
- **Low compute**: Simple arithmetic operations

## 🛠️ Development Workflow

1. **Modify** program code in `programs/auto-savings/src/lib.rs`
2. **Build** with `anchor build`
3. **Test** with `anchor test`
4. **Deploy** with `anchor deploy`
5. **Integrate** using SDK in frontend

## 📦 Dependencies

### Rust
- `anchor-lang`: 0.29.0
- `anchor-spl`: 0.29.0

### TypeScript
- `@coral-xyz/anchor`: ^0.29.0
- `@solana/web3.js`: ^1.87.6
- `@solana/spl-token`: ^0.3.9

### Development
- `chai`: Testing
- `mocha`: Test runner
- `typescript`: Type checking

---

This structure provides a complete, production-ready Solana program with comprehensive testing, documentation, and frontend integration tools.
