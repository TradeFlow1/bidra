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
if ($src -notmatch "V2 enforcement: feedback only allowed after completion") { throw "Marker not found; refusing." }

# Exact current lines (as printed) -> rewrite to avoid redeclare
$old1 = '  const sellerId = (order.listing as any) ? String((((order.listing as any).sellerId) || "")) : "";'
$new1 = '  const sellerId2 = (order.listing as any) ? String((((order.listing as any).sellerId) || "")) : "";'

$old2 = '  const buyerId = String(((order as any).buyerId) || "");'
$new2 = '  const buyerId2 = String(((order as any).buyerId) || "");'

$old3 = '  const isBuyer = buyerId && buyerId === userId;'
$new3 = '  const isBuyer = buyerId2 && buyerId2 === userId;'

$old4 = '  const isSeller = sellerId && sellerId === userId;'
$new4 = '  const isSeller = sellerId2 && sellerId2 === userId;'

# Also fix indentation for the create call inside try
$old5 = 'await prisma.feedback.create({'
$new5 = '    await prisma.feedback.create({'

$src2 = $src
$src2 = $src2.Replace($old1, $new1)
$src2 = $src2.Replace($old2, $new2)
$src2 = $src2.Replace($old3, $new3)
$src2 = $src2.Replace($old4, $new4)
$src2 = $src2.Replace($old5, $new5)

if ($src2 -eq $src) { throw "No changes detected - aborting" }

# Safety: ensure the new identifiers exist
if ($src2 -notmatch "sellerId2") { throw "Expected sellerId2 not present after patch" }
if ($src2 -notmatch "buyerId2") { throw "Expected buyerId2 not present after patch" }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $src2, $enc)
Write-Host ("Patched: " + $file)
