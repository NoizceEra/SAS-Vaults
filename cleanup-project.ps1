# 🧹 Safe Project Cleanup Script
# This removes files that can be regenerated or aren't needed
# DOES NOT delete source code or deployment files

Write-Host "`n🧹 Starting Safe Project Cleanup..." -ForegroundColor Cyan
Write-Host "━" * 60 -ForegroundColor DarkGray

$totalSaved = 0

# Function to safely remove and track
function Remove-SafePath {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        $size = (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum).Sum / 1MB
        
        try {
            Remove-Item -Recurse -Force $Path -ErrorAction Stop
            Write-Host "✓ Removed $Description" -ForegroundColor Green -NoNewline
            Write-Host " ($([math]::Round($size, 1)) MB)" -ForegroundColor DarkGray
            return $size
        } catch {
            Write-Host "✗ Failed to remove $Description : $_" -ForegroundColor Red
            return 0
        }
    } else {
        Write-Host "⊘ $Description not found (already clean)" -ForegroundColor DarkGray
        return 0
    }
}

Write-Host "`n📦 Removing regenerable dependencies..." -ForegroundColor Yellow

# Remove node_modules (can reinstall with npm install)
$totalSaved += Remove-SafePath "node_modules" "Root node_modules"
$totalSaved += Remove-SafePath "frontend\node_modules" "Frontend node_modules"
$totalSaved += Remove-SafePath "scripts\node_modules" "Scripts node_modules"
$totalSaved += Remove-SafePath "frontend\dist" "Frontend build output"

Write-Host "`n🗑️  Removing test artifacts..." -ForegroundColor Yellow

# Remove test data
$totalSaved += Remove-SafePath "test-ledger" "Test ledger data"

Write-Host "`n🎨 Removing non-essential files..." -ForegroundColor Yellow

# Remove marketing assets (optional - comment out if you want to keep)
# $totalSaved += Remove-SafePath "marketing-assets" "Marketing assets"

# Remove duplicate/empty folders
$totalSaved += Remove-SafePath "SAS" "Duplicate SAS folder"
$totalSaved += Remove-SafePath ".implementation" "Implementation notes"

# Remove doc archives
$totalSaved += Remove-SafePath "docs\archive" "Documentation archives"
Get-ChildItem -Path "docs" -Filter "backup*" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $totalSaved += Remove-SafePath $_.FullName "Doc backup: $($_.Name)"
}

Write-Host "`n📝 Removing log files..." -ForegroundColor Yellow

# Remove log files
$logFiles = Get-ChildItem -Filter "*.log" -ErrorAction SilentlyContinue
foreach ($log in $logFiles) {
    Remove-Item -Force $log.FullName
    Write-Host "✓ Removed $($log.Name)" -ForegroundColor Green
}

# Remove error logs
$errorFiles = Get-ChildItem -Filter "*_error*.txt" -ErrorAction SilentlyContinue
$errorFiles += Get-ChildItem -Filter "*build*.txt" -ErrorAction SilentlyContinue
$errorFiles += Get-ChildItem -Filter "test-output*.txt" -ErrorAction SilentlyContinue
foreach ($file in $errorFiles) {
    Remove-Item -Force $file.FullName
    Write-Host "✓ Removed $($file.Name)" -ForegroundColor Green
}

Write-Host "`n" + ("━" * 60) -ForegroundColor DarkGray
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ("━" * 60) -ForegroundColor DarkGray

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Space saved: $([math]::Round($totalSaved, 1)) MB" -ForegroundColor White
Write-Host "  Deployment cost saved: `$0" -ForegroundColor Yellow
Write-Host "    (Files deleted weren't deployed to blockchain)" -ForegroundColor DarkGray

Write-Host "`n🔄 To reinstall dependencies:" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor White
Write-Host "  cd frontend && npm install" -ForegroundColor White
Write-Host "  cd scripts && npm install" -ForegroundColor White

Write-Host "`n💡 To ACTUALLY save on deployment:" -ForegroundColor Cyan
Write-Host "  1. Optimize Cargo.toml (see DEPLOYMENT_COST_OPTIMIZATION.md)" -ForegroundColor White
Write-Host "  2. Remove debug logs from Rust code" -ForegroundColor White
Write-Host "  3. Build with: anchor clean && anchor build --release" -ForegroundColor White
Write-Host "  Savings: `$30-40 in deployment costs`n" -ForegroundColor Green
