# Quick Deploy Script for Swap Feature
# Run this after anchor build completes successfully

Write-Host "🚀 Auto-Savings Swap Feature - Quick Deploy" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Step 1: Verify build
Write-Host "`n📦 Step 1: Verifying build..." -ForegroundColor Yellow
if (Test-Path "target/deploy/auto_savings.so") {
    Write-Host "✅ Program binary found" -ForegroundColor Green
}
else {
    Write-Host "❌ Program binary not found. Run 'anchor build' first." -ForegroundColor Red
    exit 1
}

if (Test-Path "target/idl/auto_savings.json") {
    Write-Host "✅ IDL found" -ForegroundColor Green
}
else {
    Write-Host "❌ IDL not found" -ForegroundColor Red
    exit 1
}

# Step 2: Set network to Devnet
Write-Host "`n🌐 Step 2: Setting network to Devnet..." -ForegroundColor Yellow
solana config set --url devnet
Write-Host "✅ Network set to Devnet" -ForegroundColor Green

# Step 3: Check balance
Write-Host "`n💰 Step 3: Checking wallet balance..." -ForegroundColor Yellow
$balance = solana balance --output json | ConvertFrom-Json
$balanceSOL = $balance.value / 1000000000

Write-Host "Current balance: $balanceSOL SOL" -ForegroundColor Cyan

if ($balanceSOL -lt 2) {
    Write-Host "⚠️  Low balance. Requesting airdrop..." -ForegroundColor Yellow
    solana airdrop 2
    Start-Sleep -Seconds 5
}

# Step 4: Deploy program
Write-Host "`n🚀 Step 4: Deploying program to Devnet..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

$deployOutput = anchor deploy --provider.cluster devnet 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Extract Program ID from output
    $programIdLine = $deployOutput | Select-String "Program Id:"
    if ($programIdLine) {
        $programId = ($programIdLine -split "Program Id:")[1].Trim()
        Write-Host "`n📋 New Program ID: $programId" -ForegroundColor Cyan
        
        # Save to file for reference
        $programId | Out-File -FilePath "LATEST_PROGRAM_ID.txt"
        Write-Host "✅ Program ID saved to LATEST_PROGRAM_ID.txt" -ForegroundColor Green
    }
}
else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Error output:" -ForegroundColor Red
    Write-Host $deployOutput -ForegroundColor Red
    exit 1
}

# Step 5: Get Program ID (alternative method)
Write-Host "`n🔑 Step 5: Getting Program ID..." -ForegroundColor Yellow
$programId = solana-keygen pubkey target/deploy/auto_savings-keypair.json
Write-Host "Program ID: $programId" -ForegroundColor Cyan

# Step 6: Copy IDL to frontend
Write-Host "`n📄 Step 6: Copying IDL to frontend..." -ForegroundColor Yellow
if (Test-Path "frontend/src/idl") {
    Copy-Item "target/idl/auto_savings.json" "frontend/src/idl/" -Force
    Write-Host "✅ IDL copied to frontend" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Frontend IDL directory not found. Creating..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "frontend/src/idl" -Force
    Copy-Item "target/idl/auto_savings.json" "frontend/src/idl/" -Force
    Write-Host "✅ IDL copied to frontend" -ForegroundColor Green
}

# Step 7: Display next steps
Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update Program ID in the following files:" -ForegroundColor White
Write-Host "   - programs/auto-savings/src/lib.rs (line 5)" -ForegroundColor Gray
Write-Host "   - Anchor.toml ([programs.devnet])" -ForegroundColor Gray
Write-Host "   - frontend/src/config/solana.js" -ForegroundColor Gray

Write-Host "`n2. Rebuild with new Program ID:" -ForegroundColor White
Write-Host "   anchor build" -ForegroundColor Gray

Write-Host "`n3. Redeploy:" -ForegroundColor White
Write-Host "   anchor deploy --provider.cluster devnet" -ForegroundColor Gray

Write-Host "`n4. Initialize treasury:" -ForegroundColor White
Write-Host "   Use Solana Playground or run:" -ForegroundColor Gray
Write-Host "   node scripts/initialize-treasury.js" -ForegroundColor Gray

Write-Host "`n5. Test deployment:" -ForegroundColor White
Write-Host "   node scripts/test-deployment.js" -ForegroundColor Gray

Write-Host "`n6. Deploy frontend:" -ForegroundColor White
Write-Host "   cd frontend && npm run build && vercel --prod" -ForegroundColor Gray

Write-Host "`n🔗 USEFUL LINKS:" -ForegroundColor Yellow
Write-Host "Program Explorer: https://explorer.solana.com/address/$programId`?cluster=devnet" -ForegroundColor Cyan
Write-Host "Solana Playground: https://beta.solpg.io" -ForegroundColor Cyan

Write-Host "`n📚 DOCUMENTATION:" -ForegroundColor Yellow
Write-Host "Full deployment guide: DEPLOY_SWAP_FEATURE.md" -ForegroundColor Gray
Write-Host "Troubleshooting: FIX_ANCHOR_BUILD.md" -ForegroundColor Gray

Write-Host "`n🎉 Great job! Your swap feature is deployed to Devnet!" -ForegroundColor Green
Write-Host ""
