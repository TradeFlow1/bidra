#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\watchlist\page.tsx'
$lines = @(
'import { redirect } from "next/navigation";',
'',
'export const dynamic = "force-dynamic";',
'export const revalidate = 0;',
'export const fetchCache = "force-no-store";',
'',
'export default async function WatchlistPage() {',
'  redirect("/listings");',
'}'
)

[System.IO.File]::WriteAllLines($path, $lines, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
