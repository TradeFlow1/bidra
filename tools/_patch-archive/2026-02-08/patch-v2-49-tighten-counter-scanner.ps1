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

function Backup-File {
  param([string]$File)
  $bak = "$File.bak_v2_49_tighten_counter_scanner"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$scan = '.\tools\v2-49-scan-no-counter-offer-wording.ps1'
if (-not (Test-Path -LiteralPath $scan)) { throw "Missing: $scan" }

$c = Get-Content -LiteralPath $scan -Raw -Encoding UTF8

# Remove the overly-broad pattern line: '\bcounter\b'
$n = $c -replace "(\r?\n\s*'\\bcounter\\b'\r?\n)", "`r`n"

if ($n -ne $c) {
  Backup-File -File $scan
  Set-Content -LiteralPath $scan -Value $n -Encoding UTF8
  Write-Host ("Patched: {0}" -f $scan)
} else {
  Write-Host ("No change: {0} (pattern already removed?)" -f $scan)
}

Write-Host 'Done: scanner now targets counter-offer wording only.'
