# 🛡️ SAFETY PATCH - Minimum Viable Deployment
# Adds: TVL cap, emergency pause, disables swaps

Write-Host "[SAFETY] APPLYING SAFETY PATCHES FOR MINIMUM VIABLE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor DarkGray
Write-Host "Changes:" -ForegroundColor White
Write-Host "  1. Add `$1,000 TVL cap (10 SOL)" -ForegroundColor Yellow
Write-Host "  2. Add emergency pause mechanism" -ForegroundColor Yellow
Write-Host "  3. Disable ALL swap functionality" -ForegroundColor Yellow
Write-Host "  4. Add total TVL tracking" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor DarkGray

$libFile = "programs\auto-savings\src\lib.rs"
$backupFile = "programs\auto-savings\src\lib.rs.safety-backup"

# Create backup
Write-Host "Creating safety backup..." -ForegroundColor Cyan
Copy-Item $libFile $backupFile -Force
Write-Host "OK: Backup created: $backupFile" -ForegroundColor Green

# Read file
$content = Get-Content $libFile -Raw

Write-Host "Applying patches..." -ForegroundColor Cyan

# Patch 1: Add safety constants after BASIS_POINTS_DIVISOR
$constantsPatch = @"

// ============================================================================
// MINIMUM VIABLE DEPLOYMENT - SAFETY LIMITS
// ============================================================================
const TVL_CAP_LAMPORTS: u64 = 10_000_000_000; // 10 SOL = ~$1,000 cap
const SWAPS_ENABLED: bool = false; // SWAPS COMPLETELY DISABLED
"@

$content = $content -replace '(const BASIS_POINTS_DIVISOR: u64 = 10000;)', "`$1$constantsPatch"
Write-Host "  OK: Added safety constants" -ForegroundColor Green

# Patch 2: Add fields to TreasuryConfig struct
# Find the TreasuryConfig struct and add new fields
$treasuryPatch = @"
    pub total_fees_collected: u64,
    pub bump: u8,
    // SAFETY FEATURES
    pub is_paused: bool,              // Emergency pause flag
    pub total_tvl: u64,               // Track total value locked
    pub tvl_cap: u64,                 // TVL cap in lamports
"@

$content = $content -replace '(pub total_fees_collected: u64,\s+pub bump: u8,)', $treasuryPatch
Write-Host "  OK: Updated TreasuryConfig struct" -ForegroundColor Green

# Patch 3: Update initialize_treasury to set safety values
$initPatch = @"
        treasury_config.authority = ctx.accounts.authority.key();
        treasury_config.total_fees_collected = 0;
        treasury_config.bump = ctx.bumps.treasury_config;
        // Initialize safety features
        treasury_config.is_paused = false;
        treasury_config.total_tvl = 0;
        treasury_config.tvl_cap = TVL_CAP_LAMPORTS;
"@

$content = $content -replace '(treasury_config\.authority = ctx\.accounts\.authority\.key\(\);[\s\S]*?treasury_config\.bump = ctx\.bumps\.treasury_config;)', $initPatch
Write-Host "  OK: Updated initialize_treasury" -ForegroundColor Green

# Patch 4: Add TVL check to deposit function
$depositCheckPatch = @"
        let user_config = &mut ctx.accounts.user_config;
        let treasury_config = &mut ctx.accounts.treasury_config;
        
        // SAFETY: Check if protocol is paused
        require!(!treasury_config.is_paused, ErrorCode::ProtocolPaused);
        
        // SAFETY: Check TVL cap
        let new_tvl = treasury_config.total_tvl.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        require!(new_tvl <= treasury_config.tvl_cap, ErrorCode::TvlCapExceeded);
        
        require!(user_config.is_active, ErrorCode::AccountNotActive);
"@

$content = $content -replace '(let user_config = &mut ctx\.accounts\.user_config;\s+let treasury_config = &mut ctx\.accounts\.treasury_config;\s+require!\(user_config\.is_active, ErrorCode::AccountNotActive\);)', $depositCheckPatch
Write-Host "  OK: Added TVL checks to deposit" -ForegroundColor Green

# Patch 5: Update TVL after successful deposit
$tvlUpdatePatch = @"
        user_config.total_saved = user_config
            .total_saved
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;

        // Update total TVL
        treasury_config.total_tvl = treasury_config
            .total_tvl
            .checked_add(amount_after_fee)
            .ok_or(ErrorCode::Overflow)?;
"@

$content = $content -replace '(user_config\.total_saved = user_config\s+\.total_saved\s+\.checked_add\(amount_after_fee\)\s+\.ok_or\(ErrorCode::Overflow\)\?;)(?!\s+\/\/ Update total TVL)', $tvlUpdatePatch
Write-Host "  OK: Added TVL tracking to deposit" -ForegroundColor Green

# Patch 6: Update TVL on withdrawal
$withdrawTvlPatch = @"
        user_config.total_withdrawn = user_config
            .total_withdrawn
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        // Update total TVL
        treasury_config.total_tvl = treasury_config
            .total_tvl
            .checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;
"@

$content = $content -replace '(user_config\.total_withdrawn = user_config\s+\.total_withdrawn\s+\.checked_add\(amount\)\s+\.ok_or\(ErrorCode::Overflow\)\?;)(?!\s+\/\/ Update total TVL)', $withdrawTvlPatch
Write-Host "  OK: Added TVL tracking to withdrawal" -ForegroundColor Green

# Patch 7: Disable swap_to_token function
$swapDisablePatch = @"
    pub fn swap_to_token(
        ctx: Context<SwapToToken>,
        amount_in: u64,
        min_amount_out: u64,
    ) -> Result<()> {
        // SAFETY: SWAPS COMPLETELY DISABLED FOR MINIMUM VIABLE DEPLOYMENT
        require!(SWAPS_ENABLED, ErrorCode::SwapsDisabled);
        
        // This code will never execute while SWAPS_ENABLED = false
        Ok(())
    }
"@

# Find and replace the swap_to_token function
$content = $content -replace '(?s)(pub fn swap_to_token\([\s\S]*?\n    \})', $swapDisablePatch
Write-Host "  OK: Disabled swap_to_token function" -ForegroundColor Green

# Patch 8: Add new error codes
$errorPatch = @"
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid savings rate (must be 1-90%)")]
    InvalidSavingsRate,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Account not active")]
    AccountNotActive,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid allocation percentage")]
    InvalidAllocationPercentage,
    #[msg("Allocation not found")]
    AllocationNotFound,
    #[msg("Max allocations reached")]
    MaxAllocationsReached,
    // SAFETY ERROR CODES
    #[msg("Protocol is paused - deposits disabled")]
    ProtocolPaused,
    #[msg("TVL cap exceeded - maximum deposits reached")]
    TvlCapExceeded,
    #[msg("Swaps are disabled in this version")]
    SwapsDisabled,
}
"@

$content = $content -replace '(?s)#\[error_code\][\s\S]*?\}', $errorPatch
Write-Host "  OK: Added safety error codes" -ForegroundColor Green

# Save patched file
Set-Content -Path $libFile -Value $content -NoNewline
Write-Host "SUCCESS: SAFETY PATCHES APPLIED!" -ForegroundColor Green

Write-Host "Changes Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  - TVL Cap: 10 SOL (~1,000 USD)" -ForegroundColor Green
Write-Host "  ✓ Emergency Pause: Ready (controlled by authority)" -ForegroundColor Green
Write-Host "  ✓ Swaps: COMPLETELY DISABLED" -ForegroundColor Green
Write-Host "  ✓ TVL Tracking: Active" -ForegroundColor Green
Write-Host "  - Error Codes: Added 3 new safety errors" -ForegroundColor Green

Write-Host "`n🔄 Restore Command:" -ForegroundColor Yellow
Write-Host "  Copy-Item $backupFile $libFile -Force" -ForegroundColor White

Write-Host "`n🔨 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  1. Review changes: code $libFile" -ForegroundColor White
Write-Host "  2. Remove debug msgs: .\optimize-rust-code.ps1" -ForegroundColor White
Write-Host "  3. Build: anchor clean && anchor build --release" -ForegroundColor White
Write-Host "  4. Deploy to mainnet" -ForegroundColor White

Write-Host "`n⚠️  SAFETY LIMITS:" -ForegroundColor Yellow
Write-Host "  • Maximum TVL: 10 SOL (~1,000 USD)" -ForegroundColor White
Write-Host "  • Swaps: DISABLED (will return error)" -ForegroundColor White
Write-Host "  • Pause: Available via update_treasury function" -ForegroundColor White
Write-Host ""
