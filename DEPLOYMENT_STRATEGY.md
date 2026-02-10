# 🍰 Slice (SAS) - Deployment Context & Strategy

## 🎯 Current Objectives
- **Protocol**: Solana Auto-Savings (SAS)
- **Status**: Live on Devnet
- **Program ID**: `FoPp8w9H2MFskx77ypu5yyxizKLDqtPSZ7dMvPs4whGn` (from latest `lib.rs`)
- **Key Files**: 
  - `lib.rs`: Core Rust logic (0.4% fee, 10 SOL cap)
  - `Anchor.toml`: Program configuration
  - `README.md`: Project overview

## 🛠 Stripped/Legacy Deployment Context
The following notes summarize decisions and configurations from earlier deployment cycles that were removed for simplicity but remain relevant for future scaling.

### 1. TVL Cap Evolution
- **Initial Devnet Cap**: 10 SOL (`10_000_000_000` lamports).
- **Strategy**: This was a safety measure for the early testing phase. It must be increased or removed before a Mainnet or public beta launch.

### 2. Fee Configuration
- **Standard Fee**: 40 Basis Points (0.4%).
- **Rationale**: Competitive with other DeFi protocols while ensuring treasury growth for the platform.
- **Legacy Note**: There was discussion of a "Tiered Fee" structure based on savings volume, which was stripped for the MVP.

### 3. Telegram Component Strategy
- **Decision**: Keep Telegram as a notification and analytics layer rather than a custodial trading bot.
- **Logic**: Preserves the non-custodial integrity of the PDA-based vault system.
- **Future Integration**: Webhooks from on-chain indexers to trigger Telegram notifications for "Slice" events.

### 4. Jupiter Integration (Phase 1/2)
- **Status**: Logic currently focuses on SOL-only savings.
- **Stripped Code**: Early stubs for manual swaps were moved to `.implementation/` or separate feature branches to keep the main `lib.rs` clean for the current audit/test cycle.
- **Priority**: Re-integrating the `swap_to_token` instruction using Jupiter's V6 API.

## 📂 Access Points for Future Updates
- **Source**: `programs/auto-savings/src/lib.rs`
- **Guides**: `docs/` and root `.md` guides (e.g., `DEPLOYMENT_CHECKLIST.md`)
- **Archive**: Refer to this file (`DEPLOYMENT_STRATEGY.md`) for high-level continuity between sessions.

---
*Created: 2026-02-09 | Context: Transitioning from Devnet to Beta Readiness*
