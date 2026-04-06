#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $PSCommandPath
if ([string]::IsNullOrWhiteSpace($scriptRoot)) {
    throw 'This script must be run from a .ps1 file, not pasted into the console.'
}

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
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

function Replace-Exact {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$OldValue,
        [AllowEmptyString()][string]$NewValue
    )
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing file: $Path"
    }
    $raw = Get-Content -LiteralPath $Path -Raw
    if ($raw.IndexOf($OldValue, [System.StringComparison]::Ordinal) -lt 0) {
        throw "Expected text not found in $Path"
    }
    $updated = $raw.Replace($OldValue, $NewValue)
    Write-Utf8NoBom -Path $Path -Content $updated
}

$buyNowPath = Join-Path $repoRoot 'app\api\listings\[id]\buy-now\route.ts'
$orderPagePath = Join-Path $repoRoot 'app\orders\[id]\page.tsx'
$schedulePath = Join-Path $repoRoot 'app\api\orders\[id]\pickup\schedule\route.ts'

$old1 = @'
    const pickupAvailabilityRaw = (listing as unknown as { pickupAvailability?: unknown }).pickupAvailability;

    const pickupOptions = Array.isArray(pickupAvailabilityRaw)
      ? pickupAvailabilityRaw.map(function (x: unknown) { return String(x || "").trim(); }).filter(Boolean)
      : [];

    if (pickupOptions.length < 1) {
      return jsonError("Seller has not set pickup availability for this listing yet.", 409);
    }

'@
Replace-Exact -Path $buyNowPath -OldValue $old1 -NewValue ""

$old2 = @'
          pickupOptions: pickupOptions,
          pickupOptionsSentAt: new Date(),
'@
Replace-Exact -Path $buyNowPath -OldValue $old2 -NewValue ""

Replace-Exact -Path $orderPagePath -OldValue '        <li>This listing should already have seller-defined pickup availability.</li>' -NewValue '        <li>After purchase, provide pickup options here so the buyer can choose in-app.</li>'
Replace-Exact -Path $orderPagePath -OldValue '      Pickup availability should already be set from the listing. Add options here only if needed.' -NewValue '      Add pickup options here after the sale. The buyer will choose one in-app to lock the schedule.'
Replace-Exact -Path $orderPagePath -OldValue '                          <li><b>Pickup options</b> should be provided by the seller.</li>' -NewValue '                          <li><b>Pickup options</b> are provided by the seller after purchase.</li>'

$old3 = @'
    const availability = (order.listing as any) ? (order.listing as any).pickupAvailability : null;
    if (!availability) {
      return NextResponse.json({ ok: false, error: "Seller has not set pickup availability windows yet." }, { status: 409 });
    }

    const windows = availability as PickupWindow[];
    if (!Array.isArray(windows) || windows.length === 0) {
      return NextResponse.json({ ok: false, error: "Seller pickup availability windows are invalid." }, { status: 409 });
    }
'@

$new3 = @'
    const pickupOptionsRaw = Array.isArray((order as any).pickupOptions) ? (order as any).pickupOptions : [];
    if (!pickupOptionsRaw.length) {
      return NextResponse.json({ ok: false, error: "Seller has not provided pickup options for this order yet." }, { status: 409 });
    }

    const windows = pickupOptionsRaw as PickupWindow[];
    if (!Array.isArray(windows) || windows.length === 0) {
      return NextResponse.json({ ok: false, error: "Seller pickup options for this order are invalid." }, { status: 409 });
    }
'@
Replace-Exact -Path $schedulePath -OldValue $old3 -NewValue $new3

Write-Host '[OK] pickup-flow redesign patch applied'
