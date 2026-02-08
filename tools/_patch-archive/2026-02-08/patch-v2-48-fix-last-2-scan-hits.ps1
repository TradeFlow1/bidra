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
  $bak = "$File.bak_v2_48_fix_last_2_scan_hits"
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
    Write-Host ("Patched: {0}" -f $File)
    return $true
  }
  Write-Host ("No change: {0}" -f $File)
  return $false
}

function Remove-Line-ExactTrim {
  param(
    [string]$File,
    [string]$TrimEquals
  )
  if (-not (Test-Path -LiteralPath $File)) { throw "Missing: $File" }
  $c = Get-Content -LiteralPath $File -Encoding UTF8
  $n = @()
  $removed = 0
  foreach ($l in $c) {
    if ($l.Trim() -eq $TrimEquals) { $removed++; continue }
    $n += $l
  }
  if ($removed -gt 0) {
    Backup-File -File $File
    Set-Content -LiteralPath $File -Value $n -Encoding UTF8
    Write-Host ("Removed {0} line(s) from: {1}" -f $removed, $File)
    return $true
  }
  Write-Host ("No lines removed from: {0}" -f $File)
  return $false
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$changed = 0

# 1) Remove the word "bid" from the UNDER_18 message (no apostrophe handling needed)
$f = '.\app\sell\new\sell-new-client.tsx'
$pat = '(reason\s*===\s*"UNDER_18"\s*\?\s*"[^"]*?)list\s+or\s+bid\.'
$rep = '$1list or make offers.'
if (Patch-Regex -File $f -Pattern $pat -Replacement $rep) { $changed++ }

# 2) Fix scanner double-counting: remove the redundant \bBid\b pattern line
# Select-String is case-insensitive by default, so \bBid\b also matches "bid".
$scan = '.\tools\v2-48-scan-no-bid-left.ps1'
if (Remove-Line-ExactTrim -File $scan -TrimEquals '\bBid\b') { $changed++ }

Write-Host ("Done: fixed last scanner issues (applied {0} change(s))." -f $changed)
