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
$content = Get-Content -LiteralPath $path -Raw
$content = $content.Replace('Couldnâ€™t update', 'Couldn''t update')
$content = $content.Replace('â€¢', '•')
[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
