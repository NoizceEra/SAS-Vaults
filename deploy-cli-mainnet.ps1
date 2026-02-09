# Solana Mainnet Deployment Script
# This script deploys the minimal auto-savings program to Solana mainnet

$ErrorActionPreference = "Stop"

Write-Host "🚀 Solana Mainnet Deployment Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Configuration
$PROGRAM_ID = "JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv"
$RPC_URL = "https://mainnet.helius-rpc.com/?api-key=f1268153-d201-46e0-a706-f0f1ae2334a9"
$DEPLOYER_KEY = "C:\Users\vclin_jjufoql\.config\solana\deployer.json"
$PROGRAM_BINARY = "target\deploy\auto_savings.so"

# Step 1: Check Solana CLI
Write-Host "📝 Checking Solana CLI..." -ForegroundColor Yellow
$solanaVersion = solana --version
Write-Host "✅ $solanaVersion`n" -ForegroundColor Green

# Step 2: Set RPC endpoint
Write-Host "🌐 Setting RPC endpoint..." -ForegroundColor Yellow
solana config set --url $RPC_URL
Write-Host ""

# Step 3: Check deployer balance
Write-Host "💰 Checking deployer balance..." -ForegroundColor Yellow
$balance = solana balance $DEPLOYER_KEY --url $RPC_URL
Write-Host "Balance: $balance`n" -ForegroundColor Green

# Step 4: Check if program binary exists
if (Test-Path $PROGRAM_BINARY) {
    $fileInfo = Get-Item $PROGRAM_BINARY
    $sizeKB = [math]::Round($fileInfo.Length / 1024, 2)
    Write-Host "✅ Found program binary: $sizeKB KB" -ForegroundColor Green
    Write-Host "   Last modified: $($fileInfo.LastWriteTime)`n" -ForegroundColor Gray
    
    # Warning if binary is too large
    if ($fileInfo.Length -gt 300000) {
        Write-Host "⚠️  WARNING: Binary is larger than expected!" -ForegroundColor Yellow
        Write-Host "   Expected: ~100-200 KB for minimal version" -ForegroundColor Yellow
        Write-Host "   Actual: $sizeKB KB" -ForegroundColor Yellow
        Write-Host "   This will cost more to deploy!`n" -ForegroundColor Yellow
        
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") {
            Write-Host "❌ Deployment cancelled." -ForegroundColor Red
            exit 1
        }
    }
}
else {
    Write-Host "❌ Program binary not found at: $PROGRAM_BINARY" -ForegroundColor Red
    Write-Host "   You need to build the program first with: anchor build`n" -ForegroundColor Yellow
    exit 1
}

# Step 5: Estimate deployment cost
Write-Host "💵 Estimating deployment cost..." -ForegroundColor Yellow
$bytes = (Get-Item $PROGRAM_BINARY).Length
$lamportsPerByte = 6960  # Approximate cost per byte
$estimatedLamports = $bytes * $lamportsPerByte
$estimatedSOL = [math]::Round($estimatedLamports / 1000000000, 4)
Write-Host "   Estimated cost: ~$estimatedSOL SOL`n" -ForegroundColor Cyan

# Step 6: Confirm deployment
Write-Host "🎯 Ready to deploy!" -ForegroundColor Green
Write-Host "   Program ID: $PROGRAM_ID" -ForegroundColor White
Write-Host "   RPC: $RPC_URL" -ForegroundColor White
Write-Host "   Estimated cost: ~$estimatedSOL SOL`n" -ForegroundColor White

$confirm = Read-Host "Deploy to mainnet? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 1
}

# Step 7: Deploy
Write-Host "`n🚢 Deploying to mainnet..." -ForegroundColor Yellow
Write-Host "   This may take 1-2 minutes...`n" -ForegroundColor Gray

try {
    solana program deploy $PROGRAM_BINARY `
        --program-id $PROGRAM_ID `
        --url $RPC_URL `
        --keypair $DEPLOYER_KEY `
        --with-compute-unit-price 100000
    
    Write-Host "`n✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "`n🎉 Program deployed to mainnet!" -ForegroundColor Cyan
    Write-Host "   Program ID: $PROGRAM_ID`n" -ForegroundColor White
    
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Initialize treasury: node scripts\initialize-mainnet-treasury.js" -ForegroundColor White
    Write-Host "   2. Update frontend PROGRAM_ID in frontend\src\config\solana.js" -ForegroundColor White
    Write-Host "   3. Deploy frontend to Netlify`n" -ForegroundColor White
    
}
catch {
    Write-Host "`n❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
    exit 1
}
