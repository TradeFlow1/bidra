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

$file = Join-Path $root "app\api\listings\[id]\accept-highest-offer\route.ts"
if (-not (Test-Path -LiteralPath $file)) { throw "Missing file: $file" }

$src = Get-Content -LiteralPath $file -Raw

# Guard: refuse if already transactional
if ($src -match "prisma\.\`$transaction") { throw "Transaction already present. Refusing to reapply." }

# Ensure OrderStatus import exists (used in new order.create)
if ($src -notmatch "OrderStatus") {
  $needleImport = "import { prisma } from `"`@/lib/prisma`"`;"
  $idxImp = $src.IndexOf($needleImport)
  if ($idxImp -lt 0) { throw "Import needle not found: $needleImport" }
  $insert = $needleImport + "`r`n" + "import { OrderStatus } from `"`@prisma/client`"`;"
  $src = $src.Replace($needleImport, $insert)
}

# Locate the block to replace
$startNeedle = "// Race-safe SOLD transition"
$start = $src.IndexOf($startNeedle)
if ($start -lt 0) { throw "Start needle not found: $startNeedle" }

$returnNeedle = "return NextResponse.json({"
$ret = $src.IndexOf($returnNeedle, $start)
if ($ret -lt 0) { throw "Return needle not found after start: $returnNeedle" }

# Find the end of the return block by locating the next occurrence of "});" after return
$endNeedle = "});"
$end = $src.IndexOf($endNeedle, $ret)
if ($end -lt 0) { throw "End needle not found after return: $endNeedle" }
$endAfter = $end + $endNeedle.Length

# Eat trailing whitespace/newlines after the return block
while ($endAfter -lt $src.Length) {
  $ch = $src[$endAfter]
  if ($ch -ne "`r" -and $ch -ne "`n" -and $ch -ne " " -and $ch -ne "`t") { break }
  $endAfter++
}

$before = $src.Substring(0, $start)
$after  = $src.Substring($endAfter)

$replacementLines = @(
  "    // V2: acceptance converts to SOLD and MUST create an Order (pending pickup) atomically."
  "    const result = await prisma.`$transaction(async (tx) => {"
  "      // Race-safe SOLD transition"
  "      const updated = await tx.listing.updateMany({"
  "        where: { id: listingId, status: `"`ACTIVE`"` },"
  "        data: { status: `"`SOLD`"` },"
  "      });"
  ""
  "      if (updated.count !== 1) {"
  "        // Idempotency: if an order already exists for this listing+buyer in the pre-schedule state, treat as success."
  "        const existing = await tx.order.findFirst({"
  "          where: { listingId, buyerId: offer.bidderId, status: OrderStatus.PICKUP_REQUIRED },"
  "          orderBy: { createdAt: `"`desc`"` },"
  "          select: { id: true },"
  "        });"
  "        if (existing) { return { ok: true, orderId: existing.id }; }"
  "        throw new Error(`"`LISTING_NOT_ACTIVE`"`);"
  "      }"
  ""
  "      // Record seller acceptance via OfferDecision (OfferDecision requires amount)"
  "      await tx.offerDecision.upsert({"
  "        where: { listingId_offerId: { listingId, offerId: offer.id } },"
  "        create: {"
  "          listingId,"
  "          offerId: offer.id,"
  "          amount: offer.amount,"
  "          sellerId: me.id,"
  "          buyerId: offer.bidderId,"
  "          decision: `"`ACCEPTED`"`,"
  "        },"
  "        update: {"
  "          amount: offer.amount,"
  "          sellerId: me.id,"
  "          buyerId: offer.bidderId,"
  "          decision: `"`ACCEPTED`"`,"
  "        },"
  "      });"
  ""
  "      // Create order: enters V2 enforcement chain"
  "      const order = await tx.order.create({"
  "        data: {"
  "          listingId,"
  "          buyerId: offer.bidderId,"
  "          amount: offer.amount,"
  "          status: OrderStatus.PICKUP_REQUIRED,"
  "          outcome: `"`PENDING`"`,"
  "        },"
  "        select: { id: true },"
  "      });"
  ""
  "      return { ok: true, orderId: order.id };"
  "    });"
  ""
  "    return NextResponse.json({"
  "      ok: true,"
  "      outcome: `"`PENDING`"`,"
  "      type: `"`OFFER_ACCEPTED`"`,"
  "      orderId: (result as any).orderId || null,"
  "    });"
  ""
)

$replacement = ($replacementLines -join "`r`n")

$src2 = $before + $replacement + $after

if ($src2 -eq $src) { throw "No changes detected - aborting" }
if ($src2 -notmatch "MUST create an Order") { throw "Replacement marker missing after patch" }
if ($src2 -notmatch "tx\.order\.create") { throw "Order create missing after patch" }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $src2, $enc)
Write-Host ("Patched: " + $file)
