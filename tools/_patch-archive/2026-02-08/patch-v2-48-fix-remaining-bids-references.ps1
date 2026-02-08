#Requires -Version 5.1
$ErrorActionPreference = "Stop"

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path -LiteralPath (Join-Path $fixed "package.json")) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p "package.json")) { return $p }
    $p = Split-Path $p -Parent
  }
  throw "Not at Bidra repo root (package.json not found)"
}

function Backup-File {
  param([string]$File)
  $bak = "$File.bak_v2_48_fix_remaining_bids"
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

# app/listings/page.tsx
if (Patch-Regex -File ".\app\listings\page.tsx" -Pattern "\bl\.bids\b" -Replacement "l.offers") { $changed++ }

# app/listings/[id]/page.tsx
if (Patch-Regex -File ".\app\listings\[id]\page.tsx" -Pattern "\blisting\.bids\b" -Replacement "listing.offers") { $changed++ }
if (Patch-Regex -File ".\app\listings\[id]\page.tsx" -Pattern "\bbids\s*:\s*\{" -Replacement "offers: {") { $changed++ }
if (Patch-Regex -File ".\app\listings\[id]\page.tsx" -Pattern "select:\s*\{\s*bids\b" -Replacement "select: { offers") { $changed++ }
if (Patch-Regex -File ".\app\listings\[id]\page.tsx" -Pattern "include:\s*\{\s*bids\b" -Replacement "include: { offers") { $changed++ }
if (Patch-Regex -File ".\app\listings\[id]\page.tsx" -Pattern "_count:\s*\{\s*select:\s*\{\s*bids\s*:\s*true\s*\}\s*\}" -Replacement "_count: { select: { offers: true } }") { $changed++ }

# app/api/listings/[id]/delete/route.ts (comment only)
if (Patch-Regex -File ".\app\api\listings\[id]\delete\route.ts" -Pattern "\bbids\b" -Replacement "offers") { $changed++ }

# app/api/offers/place/route.ts (comment only)
if (Patch-Regex -File ".\app\api\offers\place\route.ts" -Pattern "\bBid\b" -Replacement "Offer") { $changed++ }

Write-Host ("Done: patched remaining bids references (touched {0} file(s))." -f $changed)
