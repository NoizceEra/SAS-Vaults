# Build and Deploy Script for Mainnet
# Uses Docker for reliable builds, then deploys to mainnet

$ErrorActionPreference = "Stop"

$NEW_PROGRAM_ID = "5Vwxp3aWdbopCk1iwtjHKJ3A7eddn66686SQvE9PyB6bn"
$RPC_URL = "https://mainnet.helius-rpc.com/?api-key=f1268153-d201-46e0-a706-f0f1ae2334a9"
$DEPLOYER_KEY = "C:\Users\vclin_jjufoql\.config\solana\deployer.json"

Write-Host "========================================="
Write-Host "Solana Auto-Savings Mainnet Deployment"
Write-Host "========================================="
Write-Host ""
Write-Host "New Program ID: $NEW_PROGRAM_ID"
Write-Host ""

# Check if Docker is available
Write-Host "Checking Docker..."
try {
    docker --version
    Write-Host "Docker is available"
}
catch {
    Write-Host "Docker not found. Skipping Docker build."
    Write-Host "Will attempt to deploy existing binary..."
}

# Check if we have a recent build
$binaryPath = "programs\auto-savings\target\deploy\auto_savings.so"
if (Test-Path $binaryPath) {
    $fileInfo = Get-Item $binaryPath
    $sizeKB = [math]::Round($fileInfo.Length / 1024, 2)
    $age = (Get-Date) - $fileInfo.LastWriteTime
    
    Write-Host ""
    Write-Host "Found existing binary:"
    Write-Host "  Size: $sizeKB KB"
    Write-Host "  Age: $([math]::Round($age.TotalHours, 1)) hours old"
    Write-Host "  WARNING: This binary may have the old Program ID!"
    Write-Host ""
    
    $useBinary = Read-Host "Use this binary anyway? (yes/no)"
    if ($useBinary -ne "yes") {
        Write-Host "Deployment cancelled. Please build with correct Program ID first."
        exit 1
    }
}
else {
    Write-Host "ERROR: No binary found at $binaryPath"
    Write-Host "Please build the program first."
    exit 1
}

# Estimate cost
$bytes = (Get-Item $binaryPath).Length
$lamportsPerByte = 6960
$estimatedLamports = $bytes * $lamportsPerByte
$estimatedSOL = [math]::Round($estimatedLamports / 1000000000, 4)

Write-Host ""
Write-Host "Deployment Details:"
Write-Host "  Program ID: $NEW_PROGRAM_ID"
Write-Host "  Binary size: $sizeKB KB"
Write-Host "  Estimated cost: ~$estimatedSOL SOL"
Write-Host "  RPC: Helius (premium)"
Write-Host ""

# Check balance
Write-Host "Checking deployer balance..."
$balance = solana balance $DEPLOYER_KEY --url $RPC_URL
Write-Host "Balance: $balance"
Write-Host ""

# Confirm
$confirm = Read-Host "Deploy to mainnet? Type 'DEPLOY' to confirm"
if ($confirm -ne "DEPLOY") {
    Write-Host "Deployment cancelled"
    exit 1
}

# Deploy
Write-Host ""
Write-Host "Deploying to mainnet..."
Write-Host "This may take 1-2 minutes..."
Write-Host ""

solana program deploy $binaryPath `
    --program-id $NEW_PROGRAM_ID `
    --url $RPC_URL `
    --keypair $DEPLOYER_KEY `
    --with-compute-unit-price 100000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================="
    Write-Host "DEPLOYMENT SUCCESSFUL!"
    Write-Host "========================================="
    Write-Host ""
    Write-Host "Program ID: $NEW_PROGRAM_ID"
    Write-Host ""
    Write-Host "IMPORTANT: Save this Program ID!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Update Anchor.toml with new Program ID"
    Write-Host "2. Update frontend/src/config/solana.js with new Program ID"
    Write-Host "3. Initialize treasury: node scripts\initialize-mainnet-treasury.js"
    Write-Host "4. Test deposit/withdrawal"
    Write-Host "5. Deploy frontend to Netlify"
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "DEPLOYMENT FAILED!"
    Write-Host "Exit code: $LASTEXITCODE"
    exit 1
}
