#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}

Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\sell\new\sell-new-client.tsx'
if (-not (Test-Path -LiteralPath $path)) { throw "Missing file: $path" }
$rows = Get-Content -LiteralPath $path
if (834 -gt $rows.Count) { throw "Line out of range: 834" }
$rows[833] = '                    -'
[System.IO.File]::WriteAllLines($path, $rows, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched app\sell\new\sell-new-client.tsx:834"