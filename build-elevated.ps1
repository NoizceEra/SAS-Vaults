# Build script to run with elevated privileges
# This script attempts to build the Anchor program with admin rights

Write-Host "🔨 Building Solana Auto-Savings Program..." -ForegroundColor Cyan
Write-Host "━" * 60

# Change to project directory
Set-Location "c:\Users\vclin_jjufoql\Documents\SAS"

# Run anchor build
Write-Host "`n📦 Running anchor build...`n" -ForegroundColor Yellow
anchor build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Deploy to devnet: anchor deploy" -ForegroundColor White
    Write-Host "  2. Run tests: anchor test --skip-deploy tests/allocation.ts" -ForegroundColor White
}
else {
    Write-Host "`n❌ Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "`nTry running this script as Administrator" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
