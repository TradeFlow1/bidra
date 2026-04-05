#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding($false)))
}

$buyNowPath = Join-Path $repoRoot 'app\api\listings\[id]\buy-now\route.ts'
if (-not (Test-Path -LiteralPath $buyNowPath)) { throw "Missing file: $buyNowPath" }
$buyNow = Get-Content -LiteralPath $buyNowPath -Raw

$needle1 = '    const result = await prisma.$transaction(async function (tx) {'
$insert1 = @'
    const pickupAvailabilityRaw = (listing as unknown as { pickupAvailability?: unknown }).pickupAvailability;

    const pickupOptions = Array.isArray(pickupAvailabilityRaw)
      ? pickupAvailabilityRaw.map(function (x: unknown) { return String(x || "").trim(); }).filter(Boolean)
      : [];

    if (pickupOptions.length < 1) {
      return jsonError("Seller has not set pickup availability for this listing yet.", 409);
    }

    const result = await prisma.$transaction(async function (tx) {
'@
if ($buyNow.Contains($needle1)) {
    $buyNow = $buyNow.Replace($needle1, $insert1)
}

$oldBlock = @'
      const order = await tx.order.create({
        data: {
          amount: amount,
          status: OrderStatus.PICKUP_REQUIRED,
          outcome: "PENDING",
          buyerId: session.user.id,
          listingId: listing.id,
        },
      });

      try {
'@

$newBlock = @'
      const order = await tx.order.create({
        data: {
          amount: amount,
          status: OrderStatus.PICKUP_REQUIRED,
          outcome: "PENDING",
          buyerId: session.user.id,
          listingId: listing.id,
          pickupOptions: pickupOptions,
          pickupOptionsSentAt: new Date(),
        },
      });

      try {
'@

if ($buyNow.Contains($oldBlock)) {
    $buyNow = $buyNow.Replace($oldBlock, $newBlock)
}

Write-Utf8NoBom -Path $buyNowPath -Content $buyNow
Write-Host "[OK] patched $buyNowPath"

$orderPagePath = Join-Path $repoRoot 'app\orders\[id]\page.tsx'
if (-not (Test-Path -LiteralPath $orderPagePath)) { throw "Missing file: $orderPagePath" }
$orderPage = Get-Content -LiteralPath $orderPagePath -Raw
$orderPage = $orderPage.Replace('                    {pickupOptions.length ? "Choose one of the pickup options below." : "Waiting for seller to provide pickup options."}', '                    {pickupOptions.length ? "Choose one of the seller-defined pickup options below." : "Waiting for seller pickup availability."}')
$orderPage = $orderPage.Replace('        <li>Add a few pickup options for the buyer as the next step.</li>', '        <li>This listing should already have seller-defined pickup availability.</li>')
$orderPage = $orderPage.Replace('      Add pickup options for the buyer to choose from.', '      Pickup availability should already be set from the listing. Add options here only if needed.')
Write-Utf8NoBom -Path $orderPagePath -Content $orderPage
Write-Host "[OK] patched $orderPagePath"

$sellerFormPath = Join-Path $repoRoot 'app\orders\[id]\seller-pickup-options-form.tsx'
if (-not (Test-Path -LiteralPath $sellerFormPath)) { throw "Missing file: $sellerFormPath" }
$sellerForm = Get-Content -LiteralPath $sellerFormPath -Raw
$sellerForm = $sellerForm.Replace('Submit pickup options', 'Add/replace pickup options')
Write-Utf8NoBom -Path $sellerFormPath -Content $sellerForm
Write-Host "[OK] patched $sellerFormPath"

Write-Host "[DONE] step-1 patch complete"
