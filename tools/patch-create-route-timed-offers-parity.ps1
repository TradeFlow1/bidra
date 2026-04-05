#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath '.\package.json')) { throw "Not at repo root: $(Get-Location)" }

$path = 'app\api\listings\create\route.ts'
if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }
$content = Get-Content -LiteralPath $path -Raw

$old1 = '    const priceIn = toIntOrNull(body.price);'
$new1 = @(
  '    const startingBidIn = toIntOrNull(body.startingBid);',
  '    const reservePriceIn = toIntOrNull(body.reservePrice);',
  '    const durationDaysIn = toIntOrNull(body.durationDays);',
  '    const rawPriceIn = toIntOrNull(body.price);',
  '    const priceIn = type === "OFFERABLE" ? startingBidIn : rawPriceIn;'
) -join "`r`n"
if (-not $content.Contains($old1)) { throw 'Expected price parse line not found.' }
$content = $content.Replace($old1, $new1)

$old2 = '    if (priceIn === null || Number.isNaN(priceIn) || priceIn <= 0) return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });'
$new2 = @(
  '    if (type === "BUY_NOW") {',
  '      if (priceIn === null || Number.isNaN(priceIn) || priceIn <= 0) return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });',
  '    } else {',
  '      if (priceIn === null || Number.isNaN(priceIn) || priceIn <= 0) return NextResponse.json({ error: "Starting offer must be greater than 0." }, { status: 400 });',
  '      if (Number.isNaN(reservePriceIn)) return NextResponse.json({ error: "Reserve must be a number or blank." }, { status: 400 });',
  '      if (reservePriceIn !== null) return NextResponse.json({ error: "Reserve is not supported in this launch version." }, { status: 400 });',
  '      if (durationDaysIn === null || Number.isNaN(durationDaysIn) || @('3','5','7').IndexOf([string]$durationDaysIn) -lt 0) return NextResponse.json({ error: "Timed offers duration must be 3, 5, or 7 days." }, { status: 400 });',
  '    }'
) -join "`r`n"
if (-not $content.Contains($old2)) { throw 'Expected price validation line not found.' }
$content = $content.Replace($old2, $new2)

$old3 = '    const buyNowToSave = type === "BUY_NOW"'
$new3 = @(
  '    if (Number.isNaN(buyNowPriceIn)) return NextResponse.json({ error: "Buy Now must be a number or blank." }, { status: 400 });',
  '',
  '    if (type === "OFFERABLE" && buyNowPriceIn !== null && buyNowPriceIn <= 0) return NextResponse.json({ error: "Buy Now must be greater than 0 (or blank)." }, { status: 400 });',
  '    if (type === "OFFERABLE" && buyNowPriceIn !== null && buyNowPriceIn < priceIn) return NextResponse.json({ error: "Buy Now must be at least the starting offer." }, { status: 400 });',
  '',
  '    const buyNowToSave = type === "BUY_NOW"'
) -join "`r`n"
if (-not $content.Contains($old3)) { throw 'Expected buyNowToSave line not found.' }
$content = $content.Replace($old3, $new3)

[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $path), $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host '[OK] patched create route timed-offers parity'

