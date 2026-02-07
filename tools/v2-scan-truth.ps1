#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  $dir = Resolve-Path $PSScriptRoot
  while ($true) {
    $candidate = Join-Path $dir 'package.json'
    if (Test-Path -LiteralPath $candidate) { return $dir }
    $parent = Split-Path -Parent $dir
    if ($parent -eq $dir) { throw 'Repo root not found (package.json).' }
    $dir = $parent
  }
}

$repoRoot = Get-RepoRoot
if ($repoRoot -ne 'C:\dev\bidra-main') { throw "Refusing to run: expected repo root C:\dev\bidra-main, got: $repoRoot" }
Set-Location $repoRoot

$excludeDirs = @(
  '\node_modules\',
  '\.next\',
  '\.vercel\',
  '\archives\',
  '\tmp\',
  '\dist\',
  '\build\',
  '\out\',
  '\coverage\',
  '\.turbo\',
  '\.git\'
)

function Is-ExcludedPath([string]$full) {
  foreach ($x in $excludeDirs) {
    if ($full -like "*$x*") { return $true }
  }
  return $false
}

function Shorten([string]$s, [int]$max) {
  if ($null -eq $s) { return '' }
  if ($s.Length -le $max) { return $s }
  return ($s.Substring(0, $max) + ' …')
}

Write-Host '== V2 scan (pickup + payments + copy) ==' -ForegroundColor Cyan

# Regex patterns (case-insensitive)
$patterns = @(
  'pickupAvailability',
  'pickupTimezone',
  'pickupScheduledAt',
  'pickupScheduleLockedAt',
  'PICKUP_REQUIRED',
  'PICKUP_SCHEDULED',
  'OrderStatus\s*\.\s*PENDING',
  '"PENDING"',
  '\bshipping\b',
  '\bpostage\b',
  '\bdelivery\b',
  '\bcheckout\b'
)

# File filters
$allowedExt = @('.ts','.tsx','.js','.jsx','.prisma')
$maxBytes = 500KB  # skip mega-bundles

$files = Get-ChildItem -Recurse -File
$hits = New-Object System.Collections.Generic.List[object]

$scanned = 0
$skipped = 0
$tooBig = 0
$start = Get-Date

foreach ($f in $files) {
  $p = $f.FullName
  if (Is-ExcludedPath $p) { continue }
  if ($allowedExt -notcontains $f.Extension) { continue }

  # skip obvious minified bundles
  if ($f.Name -match '\.min\.(js|jsx|ts|tsx)$') { $skipped++; continue }

  # skip huge files
  if ($f.Length -gt $maxBytes) { $tooBig++; continue }

  $scanned++
  if (($scanned % 250) -eq 0) {
    $elapsed = (Get-Date) - $start
    Write-Host ("Scanned {0} files... (skipped: {1}, tooBig: {2}) [{3:mm\:ss}]" -f $scanned, $skipped, $tooBig, $elapsed) -ForegroundColor DarkGray
  }

  foreach ($pat in $patterns) {
    $m = Select-String -LiteralPath $p -Pattern $pat -AllMatches -CaseSensitive:$false -ErrorAction SilentlyContinue
    if ($m) {
      foreach ($one in $m) {
        $hits.Add([pscustomobject]@{
          Path    = $one.Path
          Line    = $one.LineNumber
          Pattern = $pat
          Text    = (Shorten ($one.Line.Trim()) 220)
        })
      }
    }
  }
}

$count = 0
if ($hits) { $count = $hits.Count }

Write-Host ("Scanned files: {0} (eligible)" -f $scanned) -ForegroundColor DarkGray
Write-Host ("Skipped small filters: {0}; Too big: {1}" -f $skipped, $tooBig) -ForegroundColor DarkGray
Write-Host ("Hits: {0}" -f $count) -ForegroundColor Cyan

$reportPath = Join-Path $repoRoot 'tools\v2-scan-report.txt'

if ($count -eq 0) {
  'No hits found.' | Set-Content -LiteralPath $reportPath -Encoding UTF8
  Write-Host ("Report: {0}" -f $reportPath) -ForegroundColor DarkGray
  exit 0
}

$hitsSorted = $hits | Sort-Object Path, Line
$maxOut = 200
if ($env:V2SCAN_ALL -eq '1') { $maxOut = $hitsSorted.Count }

# Write full-ish report to file (up to 2000 lines unless V2SCAN_ALL=1)
$fileMax = 2000
if ($env:V2SCAN_ALL -eq '1') { $fileMax = $hitsSorted.Count }

$outLines = New-Object System.Collections.Generic.List[string]
$outLines.Add("== V2 scan report ==") | Out-Null
$outLines.Add(("Generated: {0}" -f (Get-Date))) | Out-Null
$outLines.Add(("Scanned eligible files: {0}" -f $scanned)) | Out-Null
$outLines.Add(("Skipped: {0}; TooBig: {1}" -f $skipped, $tooBig)) | Out-Null
$outLines.Add(("Hits: {0}" -f $count)) | Out-Null
$outLines.Add("") | Out-Null

$idx = 0
foreach ($h in ($hitsSorted | Select-Object -First $fileMax)) {
  $idx++
  $outLines.Add(("{0}:{1}  [{2}]  {3}" -f $h.Path, $h.Line, $h.Pattern, $h.Text)) | Out-Null
}

Set-Content -LiteralPath $reportPath -Value $outLines.ToArray() -Encoding UTF8
Write-Host ("Report: {0}" -f $reportPath) -ForegroundColor Green

# Print first page to console
foreach ($h in ($hitsSorted | Select-Object -First $maxOut)) {
  "{0}:{1}  [{2}]  {3}" -f $h.Path, $h.Line, $h.Pattern, $h.Text
}

if ($maxOut -lt $count) {
  Write-Host ('... truncated console output. Set $env:V2SCAN_ALL=1 to print all.') -ForegroundColor DarkGray
}
