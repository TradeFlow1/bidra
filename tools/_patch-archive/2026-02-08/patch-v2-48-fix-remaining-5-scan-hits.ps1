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
  $bak = "$File.bak_v2_48_fix_5_scan_hits_v2"
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

# app/listings/[id]/page.tsx : remaining .bids and _count?.bids
$f1 = '.\app\listings\[id]\page.tsx'
if (Patch-Regex -File $f1 -Pattern '\?(\s*)\._count(\s*)\?(\s*)\.bids\b' -Replacement '?$1._count$2?$3.offers') { $changed++ }
if (Patch-Regex -File $f1 -Pattern '\)\.bids\)\s+as\s+unknown\[\]\)' -Replacement ').offers) as unknown[])') { $changed++ }
if (Patch-Regex -File $f1 -Pattern '\)\.bids\)\s+as\s+unknown\[\]\)\s+\?\?\s+\[\]\)' -Replacement ').offers) as unknown[]) ?? [])') { $changed++ }

# Be explicit for the two occurrences shown in your output:
if (Patch-Regex -File $f1 -Pattern '\{\s*_count\?\s*:\s*\{\s*offers\?\s*:\s*number\s*\}\s*\}\)\?\._count\?\.bids\b' -Replacement '{ _count?: { offers?:  number } })?._count?.offers') { $changed++ }
if (Patch-Regex -File $f1 -Pattern '\{\s*offers\?\s*:\s*unknown\[\]\s*\}\)\.bids\b' -Replacement '{ offers?: unknown[] }).offers') { $changed++ }

# app/sell/new/sell-new-client.tsx : remove standalone "bid" from user-facing copy
$f2 = '.\app\sell\new\sell-new-client.tsx'
if (Patch-Regex -File $f2 -Pattern 'you can''t list or bid\.' -Replacement 'you can''t list or make offers.') { $changed++ }

Write-Host ("Done: fixed remaining 5 scanner hits (applied {0} change(s))." -f $changed)
