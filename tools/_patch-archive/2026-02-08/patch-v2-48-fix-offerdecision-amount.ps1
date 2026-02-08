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
  $bak = "$File.bak_v2_48_offerdecision_amount"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$file = '.\app\api\listings\[id]\accept-highest-offer\route.ts'
if (-not (Test-Path -LiteralPath $file)) { throw "Missing: $file" }
Backup-File -File $file

$c = Get-Content -LiteralPath $file -Raw -Encoding UTF8
$n = $c

# Add amount into OfferDecision create/update blocks (idempotent)
if ($n -notmatch 'amount:\s*offer\.amount') {
  $n = $n -replace 'decision:\s*"ACCEPTED",\s*', 'decision: "ACCEPTED",`r`n        amount: offer.amount,`r`n        '
  $n = $n -replace 'decision:\s*"ACCEPTED",\s*', 'decision: "ACCEPTED",`r`n        amount: offer.amount,`r`n        '
}

if ($n -eq $c) {
  Write-Host 'No changes needed (amount already present or pattern not found).'
} else {
  Set-Content -LiteralPath $file -Value $n -Encoding UTF8
  Write-Host 'Patched OfferDecision upsert to include amount: offer.amount'
}

