# Script to Remove Debug msg!() Calls from Rust Code
# This optimizes program size for cheaper deployment

Write-Host "`n🔧 Removing debug msg!() calls from Rust code..." -ForegroundColor Cyan
Write-Host "━" * 60 -ForegroundColor DarkGray

$sourceFile = "programs\auto-savings\src\lib.rs"
$backupFile = "programs\auto-savings\src\lib.rs.backup"

# Create backup
Write-Host "`n📋 Creating backup..." -ForegroundColor Yellow
Copy-Item $sourceFile $backupFile -Force
Write-Host "✓ Backup created: $backupFile" -ForegroundColor Green

# Read the file
$content = Get-Content $sourceFile -Raw

# Count original msg!() calls
$originalCount = ([regex]::Matches($content, 'msg!')).Count
Write-Host "`n📊 Found $originalCount msg!() calls" -ForegroundColor Cyan

# Strategy: Remove all msg!() calls that are simple info/debug messages
# Keep: Error messages (none currently - all msgs are info)
# Remove: All informational msg!() calls

# Pattern 1: Single-line msg! with string literals
# Example: msg!("Platform treasury initialized");
$content = $content -replace 'msg!\s*\(\s*"[^"]*"\s*\);', '// Removed debug msg'

# Pattern 2: Multi-line msg! with formatting
# Example: msg!("User initialized with {}% savings rate", savings_rate);
$content = $content -creplace '(?s)msg!\s*\([^;]+\);', '// Removed debug msg'

# Count remaining msg!() calls
$remainingCount = ([regex]::Matches($content, 'msg!')).Count

Write-Host "`n📉 Results:" -ForegroundColor Yellow
Write-Host "  Original msg!() calls: $originalCount" -ForegroundColor White
Write-Host "  Removed: $($originalCount - $remainingCount)" -ForegroundColor Green
Write-Host "  Remaining: $remainingCount" -ForegroundColor $(if ($remainingCount -eq 0) { "Green" } else { "Yellow" })

# Save the optimized file
Set-Content -Path $sourceFile -Value $content -NoNewline

Write-Host "`n✅ Optimization complete!" -ForegroundColor Green
Write-Host "`n💡 To restore original:" -ForegroundColor Cyan
Write-Host "  Copy-Item $backupFile $sourceFile -Force" -ForegroundColor White

Write-Host "`n🔨 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: anchor clean" -ForegroundColor White
Write-Host "  2. Run: anchor build --release" -ForegroundColor White
Write-Host "  3. Check size: ls -lh target\deploy\auto_savings.so" -ForegroundColor White
Write-Host "  4. Expected savings: 20-30% smaller program" -ForegroundColor Green
Write-Host "`n"
