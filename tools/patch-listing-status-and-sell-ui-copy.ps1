#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath '.\package.json')) { throw "Not at repo root: $(Get-Location)" }

$updatePath = 'app\api\listings\[id]\update\route.ts'
if (-not (Test-Path -LiteralPath $updatePath)) { throw "Missing file: $updatePath" }
$update = Get-Content -LiteralPath $updatePath -Raw
$oldStatus = 'const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED", "SOLD", "SUSPENDED", "DELETED"] as const;'
$newStatus = 'const SELLER_ALLOWED_STATUSES = ["DRAFT", "ACTIVE", "ENDED"] as const;'
if (-not $update.Contains($oldStatus)) { throw 'Expected seller status line not found.' }
$update = $update.Replace($oldStatus, $newStatus)
[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $updatePath), $update, (New-Object System.Text.UTF8Encoding($false)))
Write-Host '[OK] tightened seller statuses in update route'

$sellPath = 'app\sell\new\sell-new-client.tsx'
if (-not (Test-Path -LiteralPath $sellPath)) { throw "Missing file: $sellPath" }
$sell = Get-Content -LiteralPath $sellPath -Raw

$replacements = @(
  @(' Ã¢â‚¬Âº ', ' › '),
  @('Ã¢â‚¬Âº', '›'),
  @('Ã¢â‚¬â€', '—'),
  @('Ã¢â€°Â¥', '≥'),
  @('IÃ¢â‚¬â„¢ll', 'I’ll'),
  @('isnÃ¢â‚¬â„¢t', 'isn’t'),
  @('canÃ¢â‚¬â„¢t', 'can’t'),
  @('Select a categoryÃ¢â‚¬Â¦', 'Select a category…'),
  @('Add the basics Ã¢â‚¬â€ title, description, category, condition, location, and pricing.', 'Add the basics — title, description, category, condition, location, and pricing.'),
  @('Reserve must be Ã¢â€°Â¥ starting offer.', 'Reserve must be ≥ starting offer.'),
  @('Buy Now must be Ã¢â€°Â¥ starting offer.', 'Buy Now must be ≥ starting offer.'),
  @('Buy Now must be Ã¢â€°Â¥ reserve.', 'Buy Now must be ≥ reserve.'),
  @('Buyers can place offers until the timer ends. When it ends, you choose whether to proceed with the highest offer Ã¢â‚¬â€ nothing is sold automatically.', 'Buyers can place offers until the timer ends. When it ends, you choose whether to proceed with the highest offer — nothing is sold automatically.'),
  @('// Simple Ã¢â‚¬Å“AI-likeÃ¢â‚¬Â structure: details + pickup + payment note', '// Simple “AI-like” structure: details + pickup + payment note'),
  @('Ã¢Å“â€¢', '✕')
)

foreach ($pair in $replacements) {
  $sell = $sell.Replace([string]$pair[0], [string]$pair[1])
}

[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $sellPath), $sell, (New-Object System.Text.UTF8Encoding($false)))
Write-Host '[OK] cleaned sell-new-client copy mojibake'