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

function Set-Line {
    param(
        [int]$Number,
        [string]$Value
    )
    if ($Number -lt 1 -or $Number -gt $rows.Count) {
        throw "Line number out of range: $Number"
    }
    $rows[$Number - 1] = $Value
}

Set-Line -Number 188 -Value '  // If it''s a child label, convert to "Parent › Child"'
Set-Line -Number 288 -Value '  // Simple "AI-like" structure: details + pickup + payment note'
Set-Line -Number 296 -Value '    lines.push("Timed offers: I''ll review offers when the time ends and decide whether to proceed with the highest offer.");'
Set-Line -Number 490 -Value '        if (buyNowCents < startBidCents) return setErr("Buy Now must be ≥ starting offer.");'
Set-Line -Number 571 -Value '          reason === "AGE_NOT_VERIFIED" ? "Your account isn''t age-verified yet. Please complete age verification to list items." :'
Set-Line -Number 572 -Value '          reason === "UNDER_18" ? "Bidra accounts are 18+ only. You can browse publicly, but you can''t list or make offers." :'
Set-Line -Number 574 -Value '          "You can''t create a listing right now.";'
Set-Line -Number 598 -Value '        Add the basics — title, description, category, condition, location, and pricing.'
Set-Line -Number 643 -Value '        Buyers can place offers until the timer ends. When it ends, you choose whether to proceed with the highest offer — nothing is sold automatically. Reserve is not part of this launch version.'
Set-Line -Number 712 -Value '            <option value="">Select a category…</option>'
Set-Line -Number 834 -Value '                    •'

[System.IO.File]::WriteAllLines($target, $rows, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $target"