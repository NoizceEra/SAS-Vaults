# 🔧 Anchor Build Permission Fix

**Issue:** `Access is denied. (os error 5)` when running `anchor build`  
**Cause:** Solana BPF tools installation requires elevated permissions  
**Solutions:** Multiple approaches below

---

## ✅ Solution 1: Run as Administrator (Recommended)

### PowerShell Method
1. **Close current terminal**
2. **Right-click PowerShell** → "Run as Administrator"
3. **Navigate to project:**
   ```powershell
   cd C:\Users\vclin_jjufoql\Documents\SAS
   ```
4. **Run build:**
   ```powershell
   anchor build
   ```

### VS Code Method
1. **Close VS Code**
2. **Right-click VS Code** → "Run as Administrator"
3. **Open project folder**
4. **Open terminal** (Ctrl + `)
5. **Run build:**
   ```powershell
   anchor build
   ```

---

## ✅ Solution 2: Fix Solana Tools Permissions

### Grant Full Control to Solana Directory

```powershell
# Run as Administrator
$solanaPath = "$env:USERPROFILE\.local\share\solana"
icacls $solanaPath /grant "${env:USERNAME}:(OI)(CI)F" /T
```

### Verify Permissions
```powershell
icacls "$env:USERPROFILE\.local\share\solana\install"
```

---

## ✅ Solution 3: Clean Install Solana Tools

### Remove Existing Installation
```powershell
# Run as Administrator
Remove-Item -Recurse -Force "$env:USERPROFILE\.local\share\solana"
Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\solana"
```

### Reinstall Solana CLI
```powershell
# Download and install
cmd /c "curl https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"

# Run installer as Administrator
Start-Process "C:\solana-install-tmp\solana-install-init.exe" -Wait -Verb RunAs
```

### Reinstall Anchor
```powershell
# Using cargo
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

---

## ✅ Solution 4: Use Solana Playground (Fastest)

If local build continues to fail, use Solana Playground:

### Steps:
1. **Go to:** https://beta.solpg.io
2. **Create new project** or import existing
3. **Copy `lib.rs`** content
4. **Click "Build"** in IDE
5. **Click "Deploy"** to Devnet
6. **Copy Program ID**
7. **Update local config**

### Advantages:
- ✅ No permission issues
- ✅ Fast build times
- ✅ Built-in deployment
- ✅ Automatic IDL generation

---

## ✅ Solution 5: WSL2 (Linux Subsystem)

### Install WSL2
```powershell
# Run as Administrator
wsl --install
```

### Setup in WSL2
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Build project
cd /mnt/c/Users/vclin_jjufoql/Documents/SAS
anchor build
```

---

## 🔍 Diagnostic Commands

### Check Current Permissions
```powershell
# Check Solana directory
Get-Acl "$env:USERPROFILE\.local\share\solana" | Format-List

# Check if running as Admin
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

### Check Solana Installation
```powershell
solana --version
anchor --version
rustc --version
```

### Check Disk Space
```powershell
Get-PSDrive C | Select-Object Used,Free
```

---

## 🚨 Common Errors & Fixes

### Error: "Access is denied"
**Fix:** Run as Administrator (Solution 1)

### Error: "Failed to install platform-tools"
**Fix:** Clean install (Solution 3)

### Error: "Cannot find solana-install"
**Fix:** Reinstall Solana CLI

### Error: "Disk full"
**Fix:** Free up space, need ~10GB for build

---

## ⚡ Quick Fix Script

Save as `fix-anchor-build.ps1` and run as Administrator:

```powershell
# Fix Anchor Build Permissions
# Run as Administrator

Write-Host "🔧 Fixing Anchor Build Permissions..." -ForegroundColor Cyan

# Step 1: Grant permissions to Solana directory
Write-Host "`n📁 Granting permissions to Solana directory..." -ForegroundColor Yellow
$solanaPath = "$env:USERPROFILE\.local\share\solana"
if (Test-Path $solanaPath) {
    icacls $solanaPath /grant "${env:USERNAME}:(OI)(CI)F" /T
    Write-Host "✅ Permissions granted" -ForegroundColor Green
} else {
    Write-Host "⚠️  Solana directory not found" -ForegroundColor Red
}

# Step 2: Grant permissions to cache
Write-Host "`n📁 Granting permissions to cache directory..." -ForegroundColor Yellow
$cachePath = "$env:USERPROFILE\.cache\solana"
if (Test-Path $cachePath) {
    icacls $cachePath /grant "${env:USERNAME}:(OI)(CI)F" /T
    Write-Host "✅ Permissions granted" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cache directory not found" -ForegroundColor Red
}

# Step 3: Test build
Write-Host "`n🔨 Testing build..." -ForegroundColor Yellow
cd C:\Users\vclin_jjufoql\Documents\SAS
anchor build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Build failed. Try Solution 3 (Clean Install)" -ForegroundColor Red
}
```

---

## 📋 Recommended Approach

**For Immediate Results:**
1. Use **Solution 4 (Solana Playground)** - No setup needed
2. Build and deploy in browser
3. Continue development

**For Long-term:**
1. Use **Solution 1 (Run as Admin)** - Simplest
2. If that fails, try **Solution 2 (Fix Permissions)**
3. Last resort: **Solution 3 (Clean Install)**

---

## ✅ Verification

After applying fix, verify with:

```powershell
# Test build
anchor build

# Should see:
# ✅ Compiling auto-savings v0.1.0
# ✅ Finished release [optimized] target(s)
```

---

## 🆘 Still Having Issues?

If none of these work:

1. **Check antivirus** - May be blocking Solana tools
2. **Check disk space** - Need at least 10GB free
3. **Check Windows version** - Needs Windows 10/11
4. **Use Solana Playground** - Guaranteed to work

---

**Status:** Ready to fix! Choose your solution above. 🚀
