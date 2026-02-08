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
  $bak = "$File.bak_v2_49_fix_how_it_works_counter_wording"
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
$f = '.\app\how-it-works\page.tsx'

# V2: no counter-offers. Replace the exact bullet copy.
if (Patch-Regex -File $f -Pattern 'Seller may decline,\s*counter,\s*or\s*relist\.' -Replacement 'Seller may decline or relist.') { $changed++ }

# Fallback (if punctuation/spacing differs)
if ($changed -eq 0) {
  if (Patch-Regex -File $f -Pattern 'decline,\s*counter,\s*or\s*relist' -Replacement 'decline or relist') { $changed++ }
}

Write-Host ("Done: fixed how-it-works wording (applied {0} change(s))." -f $changed)
