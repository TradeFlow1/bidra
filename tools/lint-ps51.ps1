param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path (Join-Path $fixed "package.json")) { return $fixed }

  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p.Length -gt 3) {
    if (Test-Path (Join-Path $p "package.json")) { return $p }
    $p = Split-Path -Parent $p
  }

  throw "Could not find repo root (package.json). Refusing to run."
}

$root = Find-RepoRoot
Set-Location $root

$bidra = Join-Path $root "tools\bidra.ps1"
if (!(Test-Path $bidra)) { throw "Missing tools\bidra.ps1 at: $bidra" }

$patch = Join-Path $root "tools\patch-eslint-relax-v2d.ps1"
if (!(Test-Path $patch)) { throw "Missing patch script at: $patch" }

try {
  & $bidra powershell -NoProfile -ExecutionPolicy Bypass -File $patch
  if ($LASTEXITCODE -ne 0) { throw "Patch script failed (exit $LASTEXITCODE)" }

  & $bidra npm run lint
  if ($LASTEXITCODE -ne 0) { throw "Lint failed (exit $LASTEXITCODE)" }

  Write-Host "OK: patch + lint passed." -ForegroundColor Green
  exit 0
}
catch {
  Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}