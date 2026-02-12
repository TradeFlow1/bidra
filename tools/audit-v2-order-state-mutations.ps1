param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path -LiteralPath (Join-Path $fixed "package.json")) { return $fixed }

  $p = Split-Path -Parent $PSCommandPath
  while ($true) {
    if (Test-Path -LiteralPath (Join-Path $p "package.json")) { return $p }
    $parent = Split-Path -Parent $p
    if ($parent -eq $p -or [string]::IsNullOrWhiteSpace($parent)) { break }
    $p = $parent
  }
  return $null
}

$root = Find-RepoRoot
if (-not $root) { throw "Repo root not found. Refusing to run." }
Set-Location -LiteralPath $root
if (-not (Test-Path -LiteralPath .\package.json)) { throw "Not at repo root: $(Get-Location)" }

$outDir = Join-Path $root "tools\audit"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$reportPath = Join-Path $outDir "order-state-mutation-audit.txt"

$excludeFragments = @("\node_modules\","\ .next\","\dist\","\build\","\coverage\","\.git\","\out\","\.turbo\","\.vercel\")
# fix accidental space in the list above if it ever occurs by rebuilding the array safely
$excludeFragments = @("\node_modules\","\.next\","\dist\","\build\","\coverage\","\.git\","\out\","\.turbo\","\.vercel\")

$extensions = @("*.ts","*.tsx","*.js","*.jsx","*.prisma","*.sql")

$files = Get-ChildItem -LiteralPath $root -Recurse -File -Include $extensions | Where-Object {
  $full = $_.FullName
  foreach ($frag in $excludeFragments) {
    if ($full -like ("*" + $frag + "*")) { return $false }
  }
  return $true
}

$patterns = @(
  # Direct property mutation (common bypass risk)
  "\border\b.*\.status\s*="
  "\border\b.*\.outcome\s*="
  "\.status\s*="
  "\.outcome\s*="

  # Prisma / ORM updates (most likely real mutations)
  "prisma\.(order|orders)\.update"
  "prisma\.(order|orders)\.updateMany"
  "\.update\("
  "updateMany\("

  # Explicit data updates
  "data:\s*{[^}]*\bstatus\b"
  "data:\s*{[^}]*\boutcome\b"

  # SQL style updates
  "\bUPDATE\b.*\borders\b"
  "\bSET\b.*\bstatus\b"
  "\bSET\b.*\boutcome\b"
)

$sections = @()
$sections += "BIDRA V2 - ORDER STATE MUTATION AUDIT"
$sections += ("Generated (local): " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$sections += ("Repo root: " + $root)
$sections += ""
$sections += "This report lists ANY file and line that might mutate order.status or order.outcome."
$sections += "Next step: inspect each hit and classify as allowed / needs guard / illegal bypass."
$sections += ""

function Add-Section {
  param(
    [string]$title,
    $matches
  )
  $script:sections += ("=== " + $title + " ===")
  if (-not $matches -or $matches.Count -eq 0) {
    $script:sections += "(no matches)"
    $script:sections += ""
    return
  }
  foreach ($m in $matches) {
    $script:sections += ("- " + $m.Path + ":" + $m.LineNumber)
    $script:sections += ("  " + ($m.Line.Trim()))
  }
  $script:sections += ""
}

$allMatches = @()
foreach ($pat in $patterns) {
  $hits = $files | Select-String -Pattern $pat
  if ($hits) { $allMatches += $hits }
}

# De-dupe by file+line
$dedup = @{}
foreach ($m in $allMatches) {
  $k = $m.Path + ":" + $m.LineNumber
  if (-not $dedup.ContainsKey($k)) { $dedup[$k] = $m }
}
$unique = $dedup.Values | Sort-Object Path, LineNumber

# Categorize (lightweight; manual review still required)
$direct = $unique | Where-Object { $_.Line -match "\.status\s*=" -or $_.Line -match "\.outcome\s*=" }
$prisma = $unique | Where-Object { $_.Line -match "prisma\.(order|orders)\.(update|updateMany)" -or $_.Line -match "data:\s*{.*\bstatus\b" -or $_.Line -match "data:\s*{.*\boutcome\b" }
$sql    = $unique | Where-Object { $_.Line -match "\bUPDATE\b.*\borders\b" -or $_.Line -match "\bSET\b.*\bstatus\b" -or $_.Line -match "\bSET\b.*\boutcome\b" }

Add-Section "Direct status or outcome assignments (high risk)" $direct
Add-Section "Prisma or ORM updates and data:{ status/outcome }" $prisma
Add-Section "SQL-ish updates touching orders/status/outcome" $sql

$sections += "=== FULL UNIQUE HIT LIST (for manual review) ==="
if ($unique.Count -eq 0) {
  $sections += "(no matches found - unlikely; double-check patterns/extensions)"
} else {
  foreach ($m in $unique) {
    $sections += ("- " + $m.Path + ":" + $m.LineNumber)
    $sections += ("  " + ($m.Line.Trim()))
  }
}
$sections += ""
$sections += ("Total unique hits: " + $unique.Count)

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($reportPath, $sections, $enc)

Write-Host ""
Write-Host ("Wrote report: " + $reportPath)
Write-Host ("Total unique hits: " + $unique.Count)
Write-Host ""
Write-Host "Paste back the FIRST 60 lines of the report, and the last 40 lines (totals + tail hits)."
