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

$content = Get-Content -LiteralPath $path -Raw
$content = $content.Replace(
'      if (!pickup1.trim() -or !pickup2.trim() -or !pickup3.trim()) {',
'      if (!pickup1.trim() || !pickup2.trim() || !pickup3.trim()) {'
)

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
