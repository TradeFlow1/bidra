#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

function Set-Line {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][int]$LineNumber,
        [Parameter(Mandatory = $true)][string]$Value
    )
    if (-not (Test-Path -LiteralPath $Path)) { throw "Missing file: $Path" }
    $rows = Get-Content -LiteralPath $Path
    if ($LineNumber -lt 1 -or $LineNumber -gt $rows.Count) {
        throw "Line out of range for ${Path}: ${LineNumber}"
    }
    $rows[$LineNumber - 1] = $Value
    [System.IO.File]::WriteAllLines($Path, $rows, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host ("[OK] patched {0}:{1}" -f $Path, $LineNumber)
}

$contact = Join-Path $repoRoot 'app\contact\page.tsx'
$support = Join-Path $repoRoot 'app\support\page.tsx'
$terms   = Join-Path $repoRoot 'app\legal\terms\page.tsx'

Set-Line -Path $contact -LineNumber 90 -Value '                title="Orders & pickup flow"'
Set-Line -Path $contact -LineNumber 91 -Value '                desc="Issues with an order status, Buy Now flow, accepted offers, or pickup scheduling shown in the order."'

Set-Line -Path $support -LineNumber 33 -Value '          <li>Do not rely on screenshots or off-platform claims. Follow the order status and in-app pickup flow.</li>'
Set-Line -Path $support -LineNumber 44 -Value '          <li>Someone refuses pickup inspection or pressures you to ignore the in-app pickup flow.</li>'
Set-Line -Path $support -LineNumber 57 -Value '          accounts) but does not act as a seller, escrow holder, shipping provider, or payment provider.'

Set-Line -Path $terms -LineNumber 53 -Value '              <li>When a buyer clicks Buy Now, the buyer commits to complete the order and follow the scheduled pickup flow.</li>'
Set-Line -Path $terms -LineNumber 74 -Value '        <h2 className="text-xl font-semibold">5) Orders, pickup scheduling, and completion</h2>'
Set-Line -Path $terms -LineNumber 77 -Value '          <li>Bidra shows order status, pickup scheduling, and completion steps in-app, but <strong>Bidra does not hold funds</strong> and <strong>does not guarantee outcomes</strong>.</li>'
Set-Line -Path $terms -LineNumber 78 -Value '          <li>Buyers and sellers should follow the in-app order flow, complete pickup carefully, and keep records (messages, photos).</li>'
