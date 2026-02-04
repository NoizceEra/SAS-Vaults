# Quick fix for Solana Playground build error
# The issue is with PDA seed arrays - they need to use .as_ref() or be typed as slices

Write-Host "🔧 Fixing PDA seed arrays for Solana Playground compatibility..." -ForegroundColor Cyan

$libPath = "programs\auto-savings\src\lib.rs"
$content = Get-Content $libPath -Raw

# Fix: Change fixed-size array declarations to use .as_ref()
$content = $content -replace 'let seeds = &\[b"treasury_vault", &\[ctx\.bumps\.treasury\]\];', 'let seeds: &[&[u8]] = &[b"treasury_vault".as_ref(), &[ctx.bumps.treasury]];'
$content = $content -replace 'let seeds = &\[b"vault", user_key\.as_ref\(\), &\[user_config\.vault_bump\]\];', 'let seeds: &[&[u8]] = &[b"vault".as_ref(), user_key.as_ref(), &[user_config.vault_bump]];'

# Save fixed version
$content | Out-File -FilePath $libPath -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed! Now copy to clipboard..." -ForegroundColor Green

# Copy to clipboard
Get-Content $libPath -Raw | Set-Clipboard

Write-Host "✅ Fixed code copied to clipboard!" -ForegroundColor Green
Write-Host "Now paste it into Solana Playground" -ForegroundColor Yellow
