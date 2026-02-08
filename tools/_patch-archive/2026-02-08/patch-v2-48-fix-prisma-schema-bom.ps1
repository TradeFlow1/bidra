#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$file = '.\prisma\schema.prisma'
if (-not (Test-Path -LiteralPath $file)) { throw "Missing: $file" }

# Backup once
$bak = "$file.bak_v2_48_prisma_bom"
if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $file -Destination $bak }

# Remove UTF-8 BOM if present (EF BB BF)
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $file).Path)
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
  $bytes = $bytes[3..($bytes.Length - 1)]
}

# Write back as UTF-8 WITHOUT BOM
[System.IO.File]::WriteAllBytes((Resolve-Path -LiteralPath $file).Path, $bytes)
Write-Host 'Removed BOM (if present) and rewrote prisma/schema.prisma without BOM.'

