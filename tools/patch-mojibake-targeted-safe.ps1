#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}

Set-Location $repoRoot

$charSingleRight = [char]0x203A
$charGe = [char]0x2265
$charEm = [char]0x2014
$charEllipsis = [char]0x2026
$charBullet = [char]0x2022
$charEn = [char]0x2013

function Set-LineInFile {
    param(
        [string]$RelativePath,
        [int]$LineNumber,
        [string]$NewValue
    )
    $path = Join-Path $repoRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing file: $RelativePath"
    }
    $rows = Get-Content -LiteralPath $path
    if ($LineNumber -lt 1 -or $LineNumber -gt $rows.Count) {
        throw "Line out of range in ${RelativePath}: $LineNumber"
    }
    $rows[$LineNumber - 1] = $NewValue
    [System.IO.File]::WriteAllLines($path, $rows, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host ("[OK] patched {0}:{1}" -f $RelativePath, $LineNumber)
}

Set-LineInFile -RelativePath 'app\sell\new\sell-new-client.tsx' -LineNumber 188 -NewValue ("  // If it's a child label, convert to `"Parent " + $charSingleRight + " Child`"")
Set-LineInFile -RelativePath 'app\sell\new\sell-new-client.tsx' -LineNumber 490 -NewValue ("        if (buyNowCents < startBidCents) return setErr(`"Buy Now must be " + $charGe + " starting offer.`");")
Set-LineInFile -RelativePath 'app\sell\new\sell-new-client.tsx' -LineNumber 598 -NewValue ("        Add the basics " + $charEm + " title, description, category, condition, location, and pricing.")
Set-LineInFile -RelativePath 'app\sell\new\sell-new-client.tsx' -LineNumber 643 -NewValue ("        Buyers can place offers until the timer ends. When it ends, you choose whether to proceed with the highest offer " + $charEm + " nothing is sold automatically. Reserve is not part of this launch version.")
Set-LineInFile -RelativePath 'app\sell\new\sell-new-client.tsx' -LineNumber 712 -NewValue ("            <option value=`"`">Select a category" + $charEllipsis + "</option>")
Set-LineInFile -RelativePath 'app\sell\new\sell-new-client.tsx' -LineNumber 834 -NewValue ("                    " + $charBullet)

Set-LineInFile -RelativePath 'lib\password-policy.ts' -LineNumber 32 -NewValue ("  const warning = `"Tip: use a 12+ character passphrase (3" + $charEn + "4 words). Avoid reused or common passwords.`";")
Set-LineInFile -RelativePath 'lib\password-policy.ts.bak_v2_46' -LineNumber 32 -NewValue ("  const warning = `"Tip: use a 12+ character passphrase (3" + $charEn + "4 words). Avoid reused or common passwords.`";")