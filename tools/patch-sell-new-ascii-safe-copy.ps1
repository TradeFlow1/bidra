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

function Set-Line {
    param([int]$LineNumber, [string]$Value)
    if ($LineNumber -lt 1 -or $LineNumber -gt $rows.Count) {
        throw "Line out of range: $LineNumber"
    }
    $rows[$LineNumber - 1] = $Value
}

Set-Line 188 '  // If it''s a child label, convert to "Parent > Child"'
Set-Line 490 '        if (buyNowCents < startBidCents) return setErr("Buy Now must be >= starting offer.");'
Set-Line 598 '        Add the basics - title, description, category, condition, location, and pricing.'
Set-Line 643 '        Buyers can place offers until the timer ends. When it ends, you choose whether to proceed with the highest offer - nothing is sold automatically. Reserve is not part of this launch version.'
Set-Line 712 '            <option value="">Select a category...</option>'

[System.IO.File]::WriteAllLines($path, $rows, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched app\sell\new\sell-new-client.tsx"