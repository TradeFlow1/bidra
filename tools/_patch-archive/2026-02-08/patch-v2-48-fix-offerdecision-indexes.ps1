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
$bak = "$file.bak_v2_48_offerdecision_indexes"
if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $file -Destination $bak }

# Read as bytes -> UTF8 (no BOM)
$pathResolved = (Resolve-Path -LiteralPath $file).Path
$bytes = [System.IO.File]::ReadAllBytes($pathResolved)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$text = $utf8NoBom.GetString($bytes)

# Only touch OfferDecision model block: replace bidId -> offerId inside @@unique/@@index lines
$pattern = '(?s)(model\s+OfferDecision\s*\{.*?)(\r?\n\})'
$m = [regex]::Match($text, $pattern)
if (-not $m.Success) { throw 'OfferDecision model block not found in schema.prisma' }

$block = $m.Groups[1].Value
$tail = $m.Groups[2].Value

# Fix any remaining index declarations that still reference bidId
$block2 = $block
$block2 = [regex]::Replace($block2, '@@unique\(\[([^\]]*?)\bbidId\b([^\]]*?)\]\)', '@@unique([$1offerId$2])')
$block2 = [regex]::Replace($block2, '@@index\(\[([^\]]*?)\bbidId\b([^\]]*?)\]\)',  '@@index([$1offerId$2])')

if ($block2 -eq $block) {
  Write-Host 'No OfferDecision index references to bidId found to change.'
} else {
  $newText = $text.Substring(0, $m.Index) + $block2 + $tail + $text.Substring($m.Index + $m.Length)
  $outBytes = $utf8NoBom.GetBytes($newText)
  [System.IO.File]::WriteAllBytes($pathResolved, $outBytes)
  Write-Host 'Updated OfferDecision indexes: bidId -> offerId (schema only).'
}

