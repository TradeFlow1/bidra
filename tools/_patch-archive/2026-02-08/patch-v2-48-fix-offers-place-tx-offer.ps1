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
  $bak = "$File.bak_v2_48_tx_offer"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$file = '.\app\api\offers\place\route.ts'
if (-not (Test-Path -LiteralPath $file)) { throw "Missing: $file" }
Backup-File -File $file

$c = Get-Content -LiteralPath $file -Raw -Encoding UTF8
$n = $c

# Replace tx.bid.* with tx.offer.* (the Offer model is the renamed Bid table)
$n = [regex]::Replace($n, '\btx\.bid\b', 'tx.offer')

if ($n -eq $c) {
  Write-Host 'No changes made (tx.bid not found).'
} else {
  Set-Content -LiteralPath $file -Value $n -Encoding UTF8
  Write-Host 'Patched app/api/offers/place/route.ts: tx.bid -> tx.offer'
}

