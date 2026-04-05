#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

function Replace-InFile {
    param(
        [string]$Path,
        [string]$OldValue,
        [string]$NewValue
    )
    if (-not (Test-Path -LiteralPath $Path)) { throw "Missing file: $Path" }
    $content = Get-Content -LiteralPath $Path -Raw
    $next = $content.Replace($OldValue, $NewValue)
    [System.IO.File]::WriteAllText($Path, $next, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "[OK] patched $Path"
}

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\contact\page.tsx') `
  -OldValue 'title="Orders & payments"' `
  -NewValue 'title="Orders & pickup flow"'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\contact\page.tsx') `
  -OldValue 'desc="Issues with an order status, Buy Now flow, accepted offers, or payment instructions shown in the order."' `
  -NewValue 'desc="Issues with an order status, Buy Now flow, accepted offers, or pickup scheduling shown in the order."'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\support\page.tsx') `
  -OldValue '          <li>Don’t accept suspicious “proof of payment” screenshots — verify funds properly.</li>' `
  -NewValue '          <li>Do not rely on screenshots or off-platform claims. Follow the order status and in-app pickup flow.</li>'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\support\page.tsx') `
  -OldValue '          <li>Someone refuses pickup inspection but insists you pay immediately.</li>' `
  -NewValue '          <li>Someone refuses pickup inspection or pressures you to ignore the in-app pickup flow.</li>'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\support\page.tsx') `
  -OldValue '          accounts) but does not act as a seller, escrow holder, or payment provider.' `
  -NewValue '          accounts) but does not act as a seller, escrow holder, shipping provider, or payment provider.'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\legal\terms\page.tsx') `
  -OldValue '              <li>When a buyer clicks Buy Now, the buyer commits to complete payment and follow the order flow.</li>' `
  -NewValue '              <li>When a buyer clicks Buy Now, the buyer commits to complete the order and follow the scheduled pickup flow.</li>'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\legal\terms\page.tsx') `
  -OldValue '        <h2 className="text-xl font-semibold">5) Orders, payments, and completion</h2>' `
  -NewValue '        <h2 className="text-xl font-semibold">5) Orders, pickup scheduling, and completion</h2>'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\legal\terms\page.tsx') `
  -OldValue '          <li>Bidra may show payment instructions and confirmation steps on an order, but <strong>Bidra does not hold funds</strong> and <strong>does not guarantee outcomes</strong>.</li>' `
  -NewValue '          <li>Bidra shows order status, pickup scheduling, and completion steps in-app, but <strong>Bidra does not hold funds</strong> and <strong>does not guarantee outcomes</strong>.</li>'

Replace-InFile `
  -Path (Join-Path $repoRoot 'app\legal\terms\page.tsx') `
  -OldValue '          <li>Buyers and sellers should verify payment and complete handover carefully and keep records (messages, photos).</li>' `
  -NewValue '          <li>Buyers and sellers should follow the in-app order flow, complete pickup carefully, and keep records (messages, photos).</li>'
