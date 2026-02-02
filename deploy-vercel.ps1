# Vercel Deployment Script
# Run this to deploy to Vercel

Write-Host "🚀 Deploying Solana Auto-Savings to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
    Write-Host ""
}

# Navigate to project root
Set-Location -Path $PSScriptRoot

# Build locally first to check for errors
Write-Host "🔨 Building frontend locally..." -ForegroundColor Cyan
Set-Location -Path "frontend"
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Local build successful!" -ForegroundColor Green
    Write-Host ""
    
    # Return to root
    Set-Location -Path ".."
    
    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Follow the prompts:" -ForegroundColor Yellow
    Write-Host "  - Set up and deploy? Yes" -ForegroundColor Gray
    Write-Host "  - Which scope? (select your account)" -ForegroundColor Gray
    Write-Host "  - Link to existing project? No" -ForegroundColor Gray
    Write-Host "  - Project name? solana-auto-savings" -ForegroundColor Gray
    Write-Host "  - Directory? ./frontend" -ForegroundColor Gray
    Write-Host "  - Override settings? No" -ForegroundColor Gray
    Write-Host ""
    
    vercel
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Visit your Vercel dashboard to see the live URL" -ForegroundColor Gray
        Write-Host "  2. Test the demo mode UI" -ForegroundColor Gray
        Write-Host "  3. Share the preview link!" -ForegroundColor Gray
        Write-Host "  4. Update Program ID after smart contract deployment" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎉 Your Auto-Savings frontend is live!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Fix errors before deploying." -ForegroundColor Red
    Set-Location -Path ".."
}
