# 💾 Solana Deployment Cost & Size Optimization Guide

**Created:** February 7, 2026  
**Topic:** Understanding deployment costs and reducing program size

---

## 💡 CRITICAL CONCEPT: What Actually Costs Money

### ❌ Common Misconception:
"All these files in my project folder will cost SOL to deploy"

### ✅ Reality:
**ONLY the compiled `.so` file gets deployed to the blockchain.**

---

## 📊 What Gets Deployed vs What Stays Local

### Deployed to Blockchain (Costs SOL):
```
target/deploy/auto_savings.so  ← ONLY THIS FILE
```
**Typical size:** 150-400 KB
**Cost:** 0.5 - 1.4 SOL

### Stays on Your Computer (Costs $0):
```
❌ All .md documentation files (5+ MB)
❌ Frontend folder (50+ MB)
❌ Scripts folder (10+ MB)
❌ node_modules (100+ MB)
❌ Marketing assets (20+ MB)
❌ Source code (.rs files)
❌ Tests
❌ Git history
❌ Logs
❌ EVERYTHING except the .so file
```

---

## 💰 Actual Deployment Costs

### Cost Formula:
```
Rent = Program Size (bytes) × 0.00000348 SOL per byte
```

### Example Costs:

| Program Size | Rent Cost | Total w/ Fees |
|--------------|-----------|---------------|
| 100 KB | 0.36 SOL | ~0.37 SOL |
| 200 KB | 0.72 SOL | ~0.73 SOL |
| 300 KB | 1.04 SOL | ~1.05 SOL |
| 400 KB | 1.39 SOL | ~1.40 SOL |

**At current SOL prices (~$100):**
- 100 KB program = $37
- 200 KB program = $73
- 300 KB program = $105
- 400 KB program = $140

### Your Likely Cost:
**Estimated: 0.7 - 1.2 SOL ($70-$120)**

---

## 🗑️ Files You CAN Delete (Won't Affect Deployment)

### Safe to Delete (Won't affect deployed program):

```bash
# Documentation (no impact on .so file)
ALLOCATION_BUILD_SUMMARY.md
ALLOCATION_DEPLOYMENT_GUIDE.md
CONSOLIDATION_COMPLETE.md
DOCUMENTATION_CLEANUP_PLAN.md
FEATURE_COMPARISON.md
JUPITER_IMPLEMENTATION_PLAN.md
JUPITER_INTEGRATION_SUMMARY.md
MAINNET_DEPLOYMENT_CHECKLIST.md
MAINNET_QUICK_GUIDE.md
MANUAL_INTEGRATION_GUIDE.md
MULTI_ACCOUNT_IMPLEMENTATION_PLAN.md
SIMPLIFIED_ALLOCATION_APPROACH.md
MONITORING_SETUP.md
MONITORING_QUICK_REF.md
MONITORING_COMPLETE.md
docs/ (entire folder)
.implementation/ (entire folder)

# Build artifacts (can be regenerated)
build.log
build_error.txt
build_errors.txt
build_panic.txt
debug_cache_contents.txt
test-output.txt
test-output-final.txt
test-success.txt

# Marketing (not needed for deployment)
marketing-assets/ (entire folder)

# Old test data
test-ledger/ (entire folder)

# Duplicate/nested SAS folder
SAS/ (appears to be duplicate)

# Node modules (can reinstall)
node_modules/ (can reinstall with npm install)
frontend/node_modules/ (can reinstall)
scripts/node_modules/ (can reinstall)
```

**Space saved:** ~200+ MB  
**Deployment cost saved:** $0 (these files never get deployed)

---

## ⚙️ What ACTUALLY Reduces Deployment Cost

### ✅ Optimize the Rust Code (Real Impact)

The .so file size comes from your **compiled Rust program**, not docs.

#### 1. Enable Release Optimizations

Check `programs/auto-savings/Cargo.toml`:

```toml
[profile.release]
opt-level = "z"          # Optimize for size
lto = true               # Link-time optimization
codegen-units = 1        # Better optimization
strip = true             # Remove debug symbols
panic = "abort"          # Smaller panic handling
overflow-checks = false  # Remove overflow checks
```

**Savings:** 20-30% size reduction = **0.15-0.30 SOL saved**

#### 2. Remove Unused Dependencies

Check `programs/auto-savings/Cargo.toml` for unused crates:

```toml
[dependencies]
# Only keep what you actually use
anchor-lang = "0.32.1"
anchor-spl = "0.32.1"
spl-token = "4.0.0"
# Remove any unused deps
```

**Savings:** 5-15% = **0.05-0.15 SOL saved**

#### 3. Remove Debug Logs

Find and remove in your Rust code:

```rust
// Remove these before mainnet:
msg!("Debug: user initialized");
msg!("Debug: amount is {}", amount);
// Keep only critical error messages
```

**Savings:** 1-5% = **0.01-0.05 SOL saved**

#### 4. Simplify Complex Logic

Review your Rust code for:
- Unnecessary string formatting
- Complex error messages
- Redundant checks
- Unused functions

**Savings:** Varies, can be 10-20%

---

## 🎯 Realistic Optimization Strategy

### Current Estimated Size: ~250 KB
**Current Cost:** ~0.87 SOL ($87)

### With Optimizations:
1. Release profile optimization: -25% = 187 KB
2. Remove unused deps: -10% = 168 KB
3. Remove debug logs: -3% = 163 KB

**Optimized Cost:** ~0.57 SOL ($57)
**Savings:** 0.30 SOL ($30)

---

## 📋 Optimization Checklist

### Before Mainnet Deployment:

- [ ] Update Cargo.toml with release optimizations
- [ ] Remove all unused dependencies
- [ ] Remove debug msg!() logs
- [ ] Keep only critical error messages
- [ ] Remove commented-out code
- [ ] Run `anchor build --release`
- [ ] Check final .so file size

### After Build:

```powershell
# Check your program size
ls -lh target/deploy/auto_savings.so

# Example output:
# -rwxr-xr-x  1 user  staff   168K Feb  7 10:30 auto_savings.so
```

**Target:** Under 200 KB = Under 0.70 SOL ($70)

---

## 🚫 What NOT to Delete

### DO NOT Delete (Needed for deployment):

```
❌ Anchor.toml (configuration)
❌ Cargo.toml (build config)
❌ programs/ (source code)
❌ target/deploy/*-keypair.json (program keys)
❌ idl/auto_savings.json (interface definition)
```

---

## 🛠️ How to Actually Optimize

### Step 1: Update Cargo.toml

```toml
# Add to programs/auto-savings/Cargo.toml

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
strip = true
panic = "abort"
overflow-checks = false
```

### Step 2: Remove Debug Code

Search your Rust files for:
- `msg!(` and remove unnecessary ones
- `println!(` (remove all)
- Commented code (delete)
- Unused functions (delete)

### Step 3: Build and Check

```bash
anchor clean
anchor build --release
ls -lh target/deploy/auto_savings.so
```

### Step 4: Compare

```
Before: 250 KB = 0.87 SOL
After:  165 KB = 0.57 SOL
Saved:  85 KB = 0.30 SOL ($30)
```

---

## 💡 Important Notes

1. **Deleting documentation = $0 saved**
   - Docs don't get deployed
   - Keep them for reference

2. **Deleting node_modules = $0 saved**
   - Can reinstall anytime
   - Not deployed to blockchain

3. **Optimizing Rust code = Real savings**
   - This actually reduces .so file
   - Can save 20-40% on deployment

4. **Typical Solana programs:**
   - Small: 100-150 KB
   - Medium: 150-250 KB
   - Large: 250-400 KB
   - Your target: ~165 KB (optimized)

---

## 🎯 Bottom Line

### To Save on Deployment Costs:

1. ✅ Optimize Cargo.toml (saves 0.15-0.30 SOL)
2. ✅ Remove debug logs (saves 0.01-0.05 SOL)
3. ✅ Remove unused deps (saves 0.05-0.15 SOL)
4. ❌ Delete documentation (saves $0)

### Realistic Savings:
**0.20 - 0.50 SOL ($20-$50)**

### You'll Still Need:
**0.70 - 1.00 SOL ($70-$100)** for deployment

---

## 🧹 Cleanup Script

Want to clean up unnecessary files anyway? Here's a safe cleanup:

```powershell
# Safe to delete (won't affect deployment)
rm -r marketing-assets
rm -r test-ledger
rm -r .implementation
rm -r docs/archive
rm -r docs/backup*

# Build artifacts (regenerable)
rm build*.log
rm build*.txt
rm test-output*.txt

# Clean node_modules (can reinstall)
rm -r node_modules
rm -r frontend/node_modules
rm -r scripts/node_modules

# Reinstall when needed
npm install
cd frontend && npm install
cd scripts && npm install
```

**Disk space saved:** 200+ MB  
**Deployment cost saved:** $0  
**But:** Cleaner project folder!

---

## 📊 Summary

| Action | Disk Space | Deploy Cost |
|--------|-----------|-------------|
| Delete docs | -5 MB | $0 |
| Delete node_modules | -150 MB | $0 |
| Delete marketing | -20 MB | $0 |
| **Optimize Rust** | **N/A** | **-$20-50** |

**Conclusion:**  
Optimize your Rust code to save on deployment, not your documentation!

---

**Remember:** The blockchain only stores your compiled .so file. Everything else is just taking up space on your computer, not costing SOL!
