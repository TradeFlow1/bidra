#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}

Set-Location $repoRoot

$target = Join-Path $repoRoot 'app\sell\new\sell-new-client.tsx'
if (-not (Test-Path -LiteralPath $target)) {
    throw "Target file not found: $target"
}

$rows = Get-Content -LiteralPath $target
if (181 -gt $rows.Count) { throw "Line 181 is out of range." }
$rows[180] = '];'
[System.IO.File]::WriteAllLines($target, $rows, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $target"