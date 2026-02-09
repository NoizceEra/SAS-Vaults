$ErrorActionPreference = "Stop"

Write-Host "Solana Mainnet Deployment Script"
Write-Host "=================================="

$PROGRAM_ID = "JCp8gq89zXSTxtNb2ZesxP2Kjx4EcsofZFUJqSJWGJEv"
$RPC_URL = "https://mainnet.helius-rpc.com/?api-key=f1268153-d201-46e0-a706-f0f1ae2334a9"
$DEPLOYER_KEY = "C:\Users\vclin_jjufoql\.config\solana\deployer.json"
$PROGRAM_BINARY = "target\deploy\auto_savings.so"

Write-Host "Checking Solana CLI..."
solana --version

Write-Host "Setting RPC endpoint..."
solana config set --url $RPC_URL

Write-Host "Checking deployer balance..."
solana balance $DEPLOYER_KEY --url $RPC_URL

if (Test-Path $PROGRAM_BINARY) {
    $fileInfo = Get-Item $PROGRAM_BINARY
    $sizeKB = [math]::Round($fileInfo.Length / 1024, 2)
    Write-Host "Found program binary: $sizeKB KB"
    
    $bytes = $fileInfo.Length
    $lamportsPerByte = 6960
    $estimatedLamports = $bytes * $lamportsPerByte
    $estimatedSOL = [math]::Round($estimatedLamports / 1000000000, 4)
    Write-Host "Estimated cost: ~$estimatedSOL SOL"
    
    if ($fileInfo.Length -gt 300000) {
        Write-Host "WARNING: Binary is larger than expected ($sizeKB KB)"
        Write-Host "This will cost more to deploy!"
    }
}
else {
    Write-Host "ERROR: Program binary not found"
    exit 1
}

Write-Host ""
Write-Host "Ready to deploy!"
Write-Host "Program ID: $PROGRAM_ID"
Write-Host "Estimated cost: ~$estimatedSOL SOL"
Write-Host ""

$confirm = Read-Host "Deploy to mainnet? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled"
    exit 1
}

Write-Host ""
Write-Host "Deploying to mainnet..."
Write-Host "This may take 1-2 minutes..."
Write-Host ""

solana program deploy $PROGRAM_BINARY --program-id $PROGRAM_ID --url $RPC_URL --keypair $DEPLOYER_KEY --with-compute-unit-price 100000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "DEPLOYMENT SUCCESSFUL!"
    Write-Host "Program ID: $PROGRAM_ID"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Initialize treasury: node scripts\initialize-mainnet-treasury.js"
    Write-Host "2. Update frontend PROGRAM_ID in frontend\src\config\solana.js"
    Write-Host "3. Deploy frontend to Netlify"
}
else {
    Write-Host "DEPLOYMENT FAILED!"
    exit 1
}
