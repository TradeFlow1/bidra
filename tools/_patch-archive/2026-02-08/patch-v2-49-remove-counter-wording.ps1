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
  $bak = "$File.bak_v2_49_remove_counter_wording"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

function Patch-Regex {
  param([string]$File,[string]$Pattern,[string]$Replacement)
  if (-not (Test-Path -LiteralPath $File)) { throw "Missing: $File" }
  $c = Get-Content -LiteralPath $File -Raw -Encoding UTF8
  $n = [regex]::Replace($c, $Pattern, $Replacement)
  if ($n -ne $c) {
    Backup-File -File $File
    Set-Content -LiteralPath $File -Value $n -Encoding UTF8
    Write-Host ("Patched: {0}" -f $File)
    return $true
  }
  Write-Host ("No change: {0}" -f $File)
  return $false
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$changed = 0

# Remove counter-offers wording (V2: no counter-offers)
$f = '.\app\page.tsx'
if (Patch-Regex -File $f -Pattern '\bsellers can accept,\s*decline,\s*or\s*counter\.\b' -Replacement 'sellers can accept or decline.') { $changed++ }
if (Patch-Regex -File $f -Pattern '\bsellers can accept,\s*decline,\s*or\s*counter\b' -Replacement 'sellers can accept or decline') { $changed++ }

# Optional: if similar wording exists elsewhere, fix the common phrase too
$publicPages = @(
  '.\app\how-it-works\page.tsx'
  '.\app\legal\terms\page.tsx'
)
foreach ($p in $publicPages) {
  if (Test-Path -LiteralPath $p) {
    if (Patch-Regex -File $p -Pattern 'accept,\s*decline,\s*or\s*counter' -Replacement 'accept or decline') { $changed++ }
  }
}

Write-Host ("Done: removed counter-offer wording (applied {0} change(s))." -f $changed)
