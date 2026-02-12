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
if (-not (Test-Path -LiteralPath (Join-Path $root "package.json"))) { throw "Not at repo root: $(Get-Location)" }

$file = Join-Path $root "app\api\feedback\submit\route.ts"
if (-not (Test-Path -LiteralPath $file)) { throw "Missing file: $file" }

$src = Get-Content -LiteralPath $file -Raw
if ($src -notmatch "V2 enforcement: feedback only allowed after completion") { throw "Expected marker not found; refusing." }

# Replace only within the injected block by targeting the exact lines we added
$src2 = $src
$src2 = $src2 -replace "const sellerId = \(order\.listing as any\) \? String\(\(\(\(order\.listing as any\)\.sellerId\) \|\| \"\"\)\)\) : \"\";", "const sellerId2 = (order.listing as any) ? String((((order.listing as any).sellerId) || \"\")) : \"\";"
$src2 = $src2 -replace "const buyerId = String\(\(\(order as any\)\.buyerId\) \|\| \"\"\);", "const buyerId2 = String(((order as any).buyerId) || \"\");"
$src2 = $src2 -replace "const isBuyer = buyerId && buyerId === userId;", "const isBuyer = buyerId2 && buyerId2 === userId;"
$src2 = $src2 -replace "const isSeller = sellerId && sellerId === userId;", "const isSeller = sellerId2 && sellerId2 === userId;"

if ($src2 -eq $src) { throw "No changes detected - aborting" }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $src2, $enc)
Write-Host ("Patched redeclare fix: " + $file)
