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
  $bak = "$File.bak_v2_48_fix_5_scan_hits"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

function Patch-Regex {
  param(
    [string]$File,
    [string]$Pattern,
    [string]$Replacement
  )
  if (-not (Test-Path -LiteralPath $File)) { throw "Missing: $File" }
  $c = Get-Content -LiteralPath $File -Raw -Encoding UTF8
  $n = [regex]::Replace($c, $Pattern, $Replacement)
  if ($n -ne $c) {
    Backup-File -File $File
    Set-Content -LiteralPath $File -Value $n -Encoding UTF8
    return $true
  }
  return $false
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$changed = 0

# 1) app/listings/[id]/page.tsx : fix type-casts that still say bids
$f1 = '.\app\listings\[id]\page.tsx'
if (Patch-Regex -File $f1 -Pattern '\{\s*_count\?\s*:\s*\{\s*bids\?\s*:' -Replacement '{ _count?: { offers?: ') { $changed++ }
if (Patch-Regex -File $f1 -Pattern '\{\s*bids\?\s*:\s*unknown\[\]' -Replacement '{ offers?: unknown[]') { $changed++ }

# 2) app/sell/new/sell-new-client.tsx : remove the word "bid" from user-facing text
$f2 = '.\app\sell\new\sell-new-client.tsx'
# Keep meaning, just avoid the word. "make offers" matches V2.
if (Patch-Regex -File $f2 -Pattern 'message,\s*bid,\s*or\s*transact\.' -Replacement 'message, make offers, or transact.') { $changed++ }

Write-Host ("Done: fixed scanner hits (touched {0} change(s))." -f $changed)
