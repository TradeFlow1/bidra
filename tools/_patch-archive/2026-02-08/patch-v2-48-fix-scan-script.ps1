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

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$scanPath = ".\tools\v2-48-scan-no-bid-left.ps1"
if (-not (Test-Path -LiteralPath $scanPath)) { throw "Missing: $scanPath" }

$out = @(
  "#Requires -Version 5.1"
  "$ErrorActionPreference = 'Stop'"
  ""
  "function Find-RepoRoot {"
  "  $fixed = 'C:\dev\bidra-main'"
  "  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }"
  "  $p = Split-Path -Parent $PSCommandPath"
  "  while ($p -and $p -ne (Split-Path $p -Parent)) {"
  "    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }"
  "    $p = Split-Path $p -Parent"
  "  }"
  "  throw 'Not at Bidra repo root (package.json not found)'"
  "}"
  ""
  "$repoRoot = Find-RepoRoot"
  "Set-Location $repoRoot"
  ""
  "# Scan only real source (avoid backups, tools scripts, prisma schema, and binaries)"
  "$includeRoots = @(
    '.\app'
    '.\lib'
    '.\components'
  )"
  ""
  "$excludeParts = @(
    '\node_modules\'
    '\.next\'
    '\prisma\migrations\'
    '\.git\'
    '\tools\'
    '\public\'
  )"
  ""
  "$excludeNamePatterns = @(
    '*.bak'
    '*.bak_*'
  )"
  ""
  "$allowedExt = @(
    '.ts','.tsx','.js','.jsx','.json','.md','.txt','.css','.scss'
  )"
  ""
  "$patterns = @(
    '\bBid\b',
    '\bbid\b',
    '\bbids\b',
    '\bprisma\.bid\b',
    '\btx\.bid\b'
  )"
  ""
  "$hits = New-Object System.Collections.Generic.List[object]"
  ""
  "$files = New-Object System.Collections.Generic.List[System.IO.FileInfo]"
  "foreach ($r in $includeRoots) {"
  "  if (-not (Test-Path -LiteralPath $r)) { continue }"
  "  $g = Get-ChildItem -LiteralPath $r -Recurse -File"
  "  foreach ($f in $g) { $files.Add($f) }"
  "}"
  ""
  "$files = $files | Where-Object {"
  "  $p = $_.FullName"
  "  foreach ($ex in $excludeParts) { if ($p -like '*' + $ex + '*') { return $false } }"
  "  foreach ($np in $excludeNamePatterns) { if ($_.Name -like $np) { return $false } }"
  "  $ext = $_.Extension.ToLowerInvariant()"
  "  if (-not ($allowedExt -contains $ext)) { return $false }"
  "  return $true"
  "}"
  ""
  "foreach ($pat in $patterns) {"
  "  $m = $files | Select-String -Pattern $pat -ErrorAction SilentlyContinue"
  "  foreach ($h in $m) {"
  "    $hits.Add([pscustomobject]@{ Pattern=$pat; Path=$h.Path; Line=$h.LineNumber; Text=$h.Line.Trim() })"
  "  }"
  "}"
  ""
  "if ($hits.Count -eq 0) {"
  "  Write-Host 'OK: No Bid/bid/bids/prisma.bid/tx.bid references found in app/lib/components.'"
  "  exit 0"
  "}"
  ""
  "$hits | Sort-Object Path, Line | Format-Table -AutoSize"
  "Write-Host '----'"
  "Write-Host ('Found {0} hit(s) in app/lib/components. Fix them before moving on.' -f $hits.Count)"
  "exit 1"
 )

Set-Content -LiteralPath $scanPath -Value $out -Encoding UTF8
Write-Host "Rewrote scanner:" $scanPath
