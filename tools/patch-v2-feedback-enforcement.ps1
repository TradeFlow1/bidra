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

# Shape guards
if ($src -notmatch "await prisma\.feedback\.create\(") { throw "Unexpected file shape: feedback.create not found" }
if ($src -notmatch "await prisma\.order\.update\(") { throw "Unexpected file shape: order.update not found" }

# Insert enforcement block immediately before: await prisma.feedback.create(
$needle = "await prisma.feedback.create("
$idx = $src.IndexOf($needle)
if ($idx -lt 0) { throw "Needle not found: $needle" }

# Refuse to double-apply
if ($src -match "V2 enforcement: feedback only allowed after completion") { throw "Patch already applied (marker found). Refusing to reapply." }

$enfLines = @(
  ""
  "  // V2 enforcement: feedback only allowed after completion; only participants; no dispute/cancelled."
  "  const order = await prisma.order.findUnique({"
  "    where: { id: orderId },"
  "    select: {"
  "      id: true,"
  "      status: true,"
  "      outcome: true,"
  "      completedAt: true,"
  "      buyerId: true,"
  "      buyerFeedbackAt: true,"
  "      sellerFeedbackAt: true,"
  "      listing: { select: { sellerId: true } },"
  "    },"
  "  });"
  "  if (!order) { return NextResponse.json({ error: ""Order not found."" }, { status: 404 }); }"
  "  const sellerId = (order.listing as any) ? String((((order.listing as any).sellerId) || """")) : """";"
  "  const buyerId = String(((order as any).buyerId) || """");"
  "  const isBuyer = buyerId && buyerId === userId;"
  "  const isSeller = sellerId && sellerId === userId;"
  "  if (!isBuyer && !isSeller) { return NextResponse.json({ error: ""Not permitted."" }, { status: 403 }); }"
  "  if (role === ""BUYER"" && !isBuyer) { return NextResponse.json({ error: ""Role mismatch."" }, { status: 403 }); }"
  "  if (role === ""SELLER"" && !isSeller) { return NextResponse.json({ error: ""Role mismatch."" }, { status: 403 }); }"
  "  if (order.outcome === ""DISPUTED"" || order.outcome === ""CANCELLED"") {"
  "    return NextResponse.json({ error: ""Feedback is not available for this order."" }, { status: 409 });"
  "  }"
  "  if (order.outcome !== ""COMPLETED"") {"
  "    return NextResponse.json({ error: ""Feedback is only available after completion."" }, { status: 409 });"
  "  }"
  "  if (role === ""BUYER"" && order.buyerFeedbackAt) { return NextResponse.json({ ok: true, alreadySubmitted: true }); }"
  "  if (role === ""SELLER"" && order.sellerFeedbackAt) { return NextResponse.json({ ok: true, alreadySubmitted: true }); }"
  ""
)

$enf = ($enfLines -join "`r`n")

$before = $src.Substring(0, $idx)
$after  = $src.Substring($idx)

$src2 = $before + $enf + $after

# Replace duplicate-feedback handler to NOT mutate order timestamps.
$src3 = $src2
$src3 = [regex]::Replace(
  $src3,
  "(?s)if\s*\(code\s*===\s*""P2002""\)\s*\{.*?return\s+NextResponse\.json\(\{\s*ok:\s*true,\s*alreadySubmitted:\s*true\s*\}\);\s*\}",
  "if (code === ""P2002"") {`r`n      // Duplicate feedback - idempotent success (no order mutation here).`r`n      return NextResponse.json({ ok: true, alreadySubmitted: true });`r`n    }",
  1
)

if ($src3 -eq $src) { throw "No changes detected - aborting" }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $src3, $enc)
Write-Host ("Patched: " + $file)
