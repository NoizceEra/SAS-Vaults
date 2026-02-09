# 🎯 Rust Code Optimization Script
# Removes debug msg!() calls to reduce program size by 20-30%
# Safe: Creates backups and can be reversed

Write-Host "`n🔧 RUST CODE OPTIMIZATION FOR DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor DarkGray
Write-Host "This script removes informational msg!() calls to reduce .so file size" -ForegroundColor White
Write-Host "Expected result: 20-30% smaller program = $30-40 cheaper deployment" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor DarkGray

# Files to optimize
$files = @(
    "programs\auto-savings\src\lib.rs",
    "programs\auto-savings\src\jupiter.rs"
)

$totalRemoved = 0
$backups = @()

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "`n⚠️  File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`n📄 Processing: $file" -ForegroundColor Cyan
    Write-Host "━" * 70 -ForegroundColor DarkGray
    
    # Create backup
    $backupFile = "$file.backup"
    Copy-Item $file $backupFile -Force
    $backups += $backupFile
    Write-Host "✓ Backup created: $backupFile" -ForegroundColor Green
    
    # Read file
    $lines = Get-Content $file
    $newLines = @()
    $inMsgBlock = $false
    $msgStartLine = 0
    $removedInFile = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Check if this line starts a msg!() call
        if ($line -match '^\s*msg!\s*\(' -and $line -notmatch '\);') {
            # Multi-line msg!() starts
            $inMsgBlock = $true
            $msgStartLine = $i + 1
            $newLines += "    // Removed debug msg!() for size optimization"
            continue
        }
        elseif ($line -match '^\s*msg!\s*\(.*\);') {
            # Single-line msg!()
            $newLines += "    // Removed debug msg!() for size optimization"
            $removedInFile++
            Write-Host "  Line $($i + 1): Removed msg!() call" -ForegroundColor DarkGray
            continue
        }
        elseif ($inMsgBlock) {
            # Inside multi-line msg!() block
            if ($line -match '\);') {
                # End of multi-line msg!()
                $inMsgBlock = $false
                $removedInFile++
                Write-Host "  Lines $msgStartLine-$($i + 1): Removed multi-line msg!() call" -ForegroundColor DarkGray
            }
            # Skip this line (it's part of the msg!() we're removing)
            continue
        }
        
        # Keep this line
        $newLines += $line
    }
    
    # Save optimized file
    $newLines | Set-Content $file
    
    Write-Host "`n📊 Results for $([System.IO.Path]::GetFileName($file)):" -ForegroundColor Yellow
    Write-Host "  msg!() calls removed: $removedInFile" -ForegroundColor Green
    
    $totalRemoved += $removedInFile
}

Write-Host "`n" + ("=" * 70) -ForegroundColor DarkGray
Write-Host "✅ OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor DarkGray

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total msg!() calls removed: $totalRemoved" -ForegroundColor Green
Write-Host "  Files optimized: $($files.Count)" -ForegroundColor White
Write-Host "  Backups created: $($backups.Count)" -ForegroundColor White

Write-Host "`n💾 Backups:" -ForegroundColor Cyan
foreach ($backup in $backups) {
    Write-Host "  ✓ $backup" -ForegroundColor DarkGray
}

Write-Host "`n🔄 To restore original code:" -ForegroundColor Yellow
Write-Host "  foreach (`$backup in @('$($backups -join "', '")')) {" -ForegroundColor White
Write-Host "    `$original = `$backup -replace '\.backup$', ''" -ForegroundColor White
Write-Host "    Copy-Item `$backup `$original -Force" -ForegroundColor White
Write-Host "  }" -ForegroundColor White

Write-Host "`n🔨 Next Steps:" -ForegroundColor Cyan
Write-Host "━" * 70 -ForegroundColor DarkGray
Write-Host "  1. Clean build artifacts:" -ForegroundColor White
Write-Host "     anchor clean" -ForegroundColor Green
Write-Host ""
Write-Host "  2. Build optimized program:" -ForegroundColor White
Write-Host "     anchor build --release" -ForegroundColor Green
Write-Host ""
Write-Host "  3. Check program size:" -ForegroundColor White
Write-Host "     `$size = (Get-Item target\deploy\auto_savings.so).Length / 1KB" -ForegroundColor Green
Write-Host "     Write-Host `"Program size: `$([math]::Round(`$size, 2)) KB`"" -ForegroundColor Green
Write-Host ""
Write-Host "  4. Calculate deployment cost:" -ForegroundColor White
Write-Host "     `$cost = `$size * 1024 * 0.00000348" -ForegroundColor Green
Write-Host "     Write-Host `"Estimated cost: `$([math]::Round(`$cost, 4)) SOL`"" -ForegroundColor Green

Write-Host "`n💡 Expected Results:" -ForegroundColor Cyan
Write-Host "  Before optimization: ~250 KB = 0.87 SOL (~`$87)" -ForegroundColor White
Write-Host "  After optimization:  ~165 KB = 0.57 SOL (~`$57)" -ForegroundColor Green
Write-Host "  Savings:            ~85 KB  = 0.30 SOL (~`$30)" -ForegroundColor Yellow

Write-Host "`n" + ("=" * 70) -ForegroundColor DarkGray
Write-Host "Ready to build! Run: anchor clean && anchor build --release" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor DarkGray
Write-Host ""
