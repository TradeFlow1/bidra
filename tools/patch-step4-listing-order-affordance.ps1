#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

# listing page
$listingPath = Join-Path $repoRoot 'app\listings\[id]\page.tsx'
$listing = Get-Content -LiteralPath $listingPath -Raw
$listing = $listing.Replace('className="underline"', 'className="bd-btn bd-btn-ghost text-center"')
$listing = $listing.Replace('className="mt-2 inline-flex text-xs"', 'className="bd-btn bd-btn-primary text-center"')
[System.IO.File]::WriteAllText($listingPath, $listing, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $listingPath"

# order page
$orderPath = Join-Path $repoRoot 'app\orders\[id]\page.tsx'
$order = Get-Content -LiteralPath $orderPath -Raw
$order = $order.Replace('className="underline font-semibold"', 'className="bd-btn bd-btn-ghost text-center"')
[System.IO.File]::WriteAllText($orderPath, $order, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $orderPath"
