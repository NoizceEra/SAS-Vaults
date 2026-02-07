# Fix Solana Platform Tools permissions and installation
# Run this as Administrator

$solanaCacheDir = "C:\Users\vclin_jjufoql\.cache\solana"
$versionDir = "$solanaCacheDir\v1.43"
$platformToolsDir = "$versionDir\platform-tools"
$downloadUrl = "https://github.com/anza-xyz/platform-tools/releases/download/v1.43/platform-tools-windows-x86_64.tar.bz2"
$archivePath = "$versionDir\platform-tools.tar.bz2"

Write-Host "🔧 Fixing Solana platform-tools..." -ForegroundColor Cyan

# 1. Clean existing directory
if (Test-Path $versionDir) {
    Write-Host "🗑️ Removing corrupted directory: $versionDir" -ForegroundColor Yellow
    Remove-Item -Recurse -Force $versionDir -ErrorAction SilentlyContinue
}

# 2. Create fresh directory
Write-Host "gp️ Creating directory: $versionDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $versionDir | Out-Null

# 3. Download platform tools manually
Write-Host "⬇️ Downloading platform-tools (this may take a moment)..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath -UseBasicParsing
    Write-Host "✅ Download complete!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Extract archive
Write-Host "📦 Extracting platform-tools..." -ForegroundColor Yellow
try {
    # Using tar which is available on Windows 10+
    tar -xhjf $archivePath -C $versionDir
    
    if (Test-Path "$platformToolsDir\llvm") {
        Write-Host "✅ Extraction successful!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Extraction completed but verify contents manually." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Extraction failed: $_" -ForegroundColor Red
    Write-Host "You may need to install 7-Zip or use WinRAR to extract $archivePath manually to $versionDir"
}

# 5. Cleanup archive
if (Test-Path $archivePath) {
    Remove-Item -Force $archivePath
}

Write-Host "`n🎉 Fix attempt complete! Try running 'anchor build' now." -ForegroundColor Cyan
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
