#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\dashboard\listings\page.tsx'
$rows = Get-Content -LiteralPath $path
if (115 -gt $rows.Count) { throw "Line out of range: 115" }
$rows[114] = '                    {labelCategory(l.category)} • {l.location}'
[System.IO.File]::WriteAllLines($path, $rows, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
