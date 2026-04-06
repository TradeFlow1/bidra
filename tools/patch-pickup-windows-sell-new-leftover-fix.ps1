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
$rows = Get-Content -LiteralPath $path

$out = New-Object System.Collections.Generic.List[string]
$skip = 0

for ($i = 0; $i -lt $rows.Count; $i++) {
    if ($skip -gt 0) {
        $skip--
        continue
    }

    if ($rows[$i].Trim() -eq 'if (!pickup1.trim() || !pickup2.trim() || !pickup3.trim()) {') {
        $skip = 3
        continue
    }

    $out.Add($rows[$i])
}

[System.IO.File]::WriteAllLines($path, $out, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
