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
  $bak = "$File.bak_v2_48_offer_rename"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$schemaPath = '.\prisma\schema.prisma'
if (-not (Test-Path -LiteralPath $schemaPath)) { throw "Missing: $schemaPath" }
Backup-File -File $schemaPath

$schema = Get-Content -LiteralPath $schemaPath -Encoding UTF8

$out = New-Object System.Collections.Generic.List[string]
$inBidModel = $false
$inListing = $false
$inUser = $false
$inOfferDecision = $false
$offerModelHasMap = $false

foreach ($line in $schema) {
  $l = $line

  # Track model boundaries
  if ($l -match '^\s*model\s+Bid\s*\{') {
    $l = ($l -replace 'model\s+Bid', 'model Offer')
    $inBidModel = $true
    $offerModelHasMap = $false
   } elseif ($l -match '^\s*model\s+Listing\s*\{') {
    $inListing = $true
   } elseif ($l -match '^\s*model\s+User\s*\{') {
    $inUser = $true
   } elseif ($l -match '^\s*model\s+OfferDecision\s*\{') {
    $inOfferDecision = $true
  }

  # Detect @@map inside Offer model
  if ($inBidModel -and ($l -match '@@map\("Bid"\)')) {
    $offerModelHasMap = $true
  }

  # Inside Listing/User: rename relation field bids -> offers (field name only)
  if (($inListing -or $inUser) -and ($l -match '^\s*bids\s+')) {
    $l = [regex]::Replace($l, '^\s*bids(\s+)', '  offers$1')
  }

  # Global type rename in schema: Bid -> Offer (types only, not words inside strings)
  # These are safe within schema syntax.
  $l = $l -replace '\bBid\[\]', 'Offer[]'
  $l = $l -replace '\bBid\b', 'Offer'

  # Inside OfferDecision ONLY: rename bidId/bid relation naming to offerId/offer, with DB column mapping
  if ($inOfferDecision) {
    # bidId field -> offerId with @map("bidId") (preserve optional ?)
    $l = [regex]::Replace($l, '^\s*bidId\s+String(\??)\b', '  offerId String$1 @map("bidId")')
    # fields: [bidId] -> fields: [offerId]
    $l = $l -replace 'fields:\s*\[bidId\]', 'fields: [offerId]'
    # @@index([bidId]) -> @@index([offerId])
    $l = $l -replace '@@index\(\[bidId\]\)', '@@index([offerId])'
    # relation field bid -> offer (field name only)
    if ($l -match '^\s*bid\s+Offer\b') {
      $l = [regex]::Replace($l, '^\s*bid(\s+)', '  offer$1')
    }
  }

  # On closing braces, inject @@map("Bid") into Offer model if missing
  if ($inBidModel -and ($l -match '^\s*\}\s*$')) {
    if (-not $offerModelHasMap) {
      $out.Add('  @@map("Bid")')
    }
    $inBidModel = $false
  }
  if ($inListing -and ($l -match '^\s*\}\s*$')) { $inListing = $false }
  if ($inUser -and ($l -match '^\s*\}\s*$')) { $inUser = $false }
  if ($inOfferDecision -and ($l -match '^\s*\}\s*$')) { $inOfferDecision = $false }

  $out.Add($l)
}

Set-Content -LiteralPath $schemaPath -Value $out.ToArray() -Encoding UTF8
Write-Host 'Updated prisma/schema.prisma: Bid->Offer (code), offers relation, mappings applied.'

# Code updates (skip backups and binaries). Conservative replacements only.
$exclude = @('\node_modules\','\.next\','\prisma\migrations\','\.git\')
$files = Get-ChildItem -Recurse -File | Where-Object {
  $p = $_.FullName
  if ($exclude | Where-Object { $p -like "*$_*" }) { return $false }
  if ($_.Name -like '*.bak*') { return $false }
  $ext = [IO.Path]::GetExtension($_.Name).ToLowerInvariant()
  return ($ext -in @('.ts','.tsx','.js','.jsx'))
}

foreach ($f in $files) {
  $p = $f.FullName
  $c = Get-Content -LiteralPath $p -Raw -Encoding UTF8
  $n = $c

  $n = [regex]::Replace($n, '\bprisma\.bid\b', 'prisma.offer')
  $n = [regex]::Replace($n, '\blisting\.bids\b', 'listing.offers')

  # common include/select shapes
  $n = [regex]::Replace($n, '\bbids\s*:\s*\{', 'offers: {')
  $n = [regex]::Replace($n, 'select:\s*\{\s*bids\b', 'select: { offers')
  $n = [regex]::Replace($n, 'include:\s*\{\s*bids\b', 'include: { offers')

  # UI copy: only this page, lowercase word
  if ($p -like '*app\account\restrictions\page.tsx') {
    $n = [regex]::Replace($n, '\bbid\b', 'offer')
  }

  if ($n -ne $c) {
    Backup-File -File $p
    Set-Content -LiteralPath $p -Value $n -Encoding UTF8
  }
}

Write-Host 'Updated code references: prisma.bid/listing.bids -> offer(s) (conservative).'
Write-Host 'Done: V2-48 rename Bid->Offer (code semantics).'

