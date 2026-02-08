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

$pkg = Join-Path $root "package.json"
if (!(Test-Path $pkg)) { throw "Missing package.json at repo root: $pkg" }

[byte[]]$bytes = [System.IO.File]::ReadAllBytes($pkg)

# UTF-8 BOM = EF BB BF
$hasBom = $false
if ($bytes.Length -ge 3) {
  if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $hasBom = $true }
}

if ($hasBom) {
  $newBytes = New-Object byte[] ($bytes.Length - 3)
  [System.Array]::Copy($bytes, 3, $newBytes, 0, $newBytes.Length)
  [System.IO.File]::WriteAllBytes($pkg, $newBytes)
  Write-Host "OK: removed UTF-8 BOM from package.json" -ForegroundColor Green
} else {
  Write-Host "OK: package.json has no BOM" -ForegroundColor Green
}

Write-Host "Done." -ForegroundColor Green