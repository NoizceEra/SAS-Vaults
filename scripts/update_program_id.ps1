param(
    [Parameter(Mandatory=$true)][string]$NewProgramId
)

Write-Output "Updating program id to: $NewProgramId"

# 1) Update programs lib.rs declare_id!
$libPath = "programs/auto-savings/src/lib.rs"
if (Test-Path $libPath) {
    $lib = Get-Content $libPath -Raw
    $lib = $lib -replace 'declare_id!\("[^"]+"\);', "declare_id!(\"$NewProgramId\");"
    Set-Content $libPath $lib -Encoding UTF8
    Write-Output "Updated $libPath"
} else { Write-Output "Missing $libPath" }

# 2) Update frontend IDL json
$idlJsonPath = "frontend/src/idl/auto_savings.json"
if (Test-Path $idlJsonPath) {
    $json = Get-Content $idlJsonPath -Raw
    if ($json -match '"metadata"\s*:\s*\{') {
        $json = $json -replace '"address"\s*:\s*"[^"]+"', "\"address\": \"$NewProgramId\""
    } else {
        # insert metadata before final closing brace
        $json = $json -replace '(\}\s*)\z', ",\n    \"metadata\": { \"address\": \"$NewProgramId\" }\n}\n"
    }
    Set-Content $idlJsonPath $json -Encoding UTF8
    Write-Output "Updated $idlJsonPath"
} else { Write-Output "Missing $idlJsonPath" }

# 3) Update frontend JS IDL (idl.js)
$idlJsPath = "frontend/src/idl/idl.js"
if (Test-Path $idlJsPath) {
    $js = Get-Content $idlJsPath -Raw
    if ($js -match '"metadata"\s*:\s*\{') {
        $js = $js -replace '"metadata"\s*:\s*\{\s*"address"\s*:\s*"[^"]+"\s*\}', "\"metadata\": { \"address\": \"$NewProgramId\" }"
    } else {
        # naive insert after name property
        $js = $js -replace '("name"\s*:\s*"auto_savings",)', "$1\n    \"metadata\": { \"address\": \"$NewProgramId\" },"
    }
    Set-Content $idlJsPath $js -Encoding UTF8
    Write-Output "Updated $idlJsPath"
} else { Write-Output "Missing $idlJsPath" }

# 4) Update client.js fallback literal (if present)
$clientPath = "frontend/src/sdk/client.js"
if (Test-Path $clientPath) {
    $c = Get-Content $clientPath -Raw
    # Replace any 44-char base58-like string fallback (simple heuristic)
    $c = $c -replace "'([1-9A-HJ-NP-Za-km-z]{32,64})'", "'${NewProgramId}'"
    Set-Content $clientPath $c -Encoding UTF8
    Write-Output "Updated $clientPath"
} else { Write-Output "Missing $clientPath" }

# 5) Update .env (create/update VITE_PROGRAM_ID)
$envPath = ".env"
if (Test-Path $envPath) {
    $env = Get-Content $envPath -Raw
    if ($env -match '^VITE_PROGRAM_ID\s*=') {
        $env = $env -replace '^VITE_PROGRAM_ID\s*=.*$', "VITE_PROGRAM_ID=$NewProgramId" -replace "`r`n`, "`n"
    } else {
        $env = $env.TrimEnd() + "`nVITE_PROGRAM_ID=$NewProgramId`n"
    }
    Set-Content $envPath $env -Encoding UTF8
    Write-Output "Updated $envPath"
} else {
    # create new .env
    "VITE_PROGRAM_ID=$NewProgramId" | Out-File -FilePath $envPath -Encoding UTF8
    Write-Output "Created $envPath"
}

Write-Output "Done. You should run:"
Write-Output "  - (optional) anchor build"
Write-Output "  - Copy updated IDL: cp programs/auto-savings/target/idl/auto_savings.json frontend/src/idl/auto_savings.json"
Write-Output "  - cd frontend && npm run build (or npm run dev)"
