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
$reportPath = Join-Path $outDir "order-state-mutation-audit-ordersonly.txt"

$excludeFragments = @(
  "\node_modules\", "\.next\", "\dist\", "\build\", "\coverage\", "\.git\", "\out\", "\.turbo\", "\.vercel\", "\tools\audit\"
)

$extensions = @("*.ts","*.tsx","*.js","*.jsx","*.prisma","*.sql")

$files = Get-ChildItem -LiteralPath $root -Recurse -File -Include $extensions | Where-Object {
  $full = $_.FullName
  foreach ($frag in $excludeFragments) {
    if ($full -like ("*" + $frag + "*")) { return $false }
  }
  if ($full -match "\.bak(\.|$)" -or $full -match "\.bak_" ) { return $false }
  return $true
}

$patterns = @(
  "prisma\.order\.(update|updateMany|upsert)"
  "data:\s*{[^}]*\bstatus\b"
  "data:\s*{[^}]*\boutcome\b"
  "\bUPDATE\b.*\borders\b"
)

$sections = @()
$sections += "BIDRA V2 - ORDER STATE MUTATION AUDIT (ORDERS ONLY)"
$sections += ("Generated (local): " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$sections += ("Repo root: " + $root)
$sections += ""

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

$sections += "=== UNIQUE HITS ==="
if ($unique.Count -eq 0) {
  $sections += "(no matches found)"
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
Write-Host ("Wrote orders-only report: " + $reportPath)
Write-Host ("Total unique hits: " + $unique.Count)
Write-Host ""
Write-Host "Now print the FIRST 120 lines and the LAST 120 lines of the orders-only report."
