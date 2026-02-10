#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $MyInvocation.MyCommand.Path
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

$target = Join-Path $repoRoot 'tools\patch-v2-60-protect-main-require-ci.ps1'
if (-not (Test-Path -LiteralPath $target)) { throw "Missing: $target" }

$raw = Get-Content -LiteralPath $target -Raw -Encoding UTF8

# Replace the optimistic verify block with a strict try/catch that stops on 403
$needle = 'Write-Host ''Applying branch protection to main...'''
if ($raw -notlike "*$needle*") { throw 'Expected marker not found in v2-60 script.' }

$before = $raw

$raw = [regex]::Replace(
  $raw,
  [regex]::Escape("Write-Host 'Applying branch protection to main...'`r`n" +
                "gh api -X PUT (""repos/{0}/branches/main/protection"" -f $ownerRepo) -H ""Accept: application/vnd.github+json"" -f body=""`$body"" | Out-Null`r`n`r`n" +
                "Write-Host 'Verifying protection...'`r`n" +
                "`$p = gh api (""repos/{0}/branches/main/protection"" -f $ownerRepo) | ConvertFrom-Json`r`n" +
                "Write-Host (""Protection enabled. Required contexts: {0}"" -f ((`$p.required_status_checks.contexts) -join ', '))`r`n" +
                "Write-Host 'Done.'"),
  ("Write-Host 'Applying branch protection to main...'`r`n" +
   "try {`r`n" +
   "  gh api -X PUT (""repos/{0}/branches/main/protection"" -f $ownerRepo) -H ""Accept: application/vnd.github+json"" -f body=""$body"" | Out-Null`r`n" +
   "} catch {`r`n" +
   "  Write-Host 'Branch protection API call failed. If this repo is private, this may require GitHub Pro (or make repo public).'`r`n" +
   "  throw`r`n" +
   "}`r`n`r`n" +
   "Write-Host 'Verifying protection...'`r`n" +
   "try {`r`n" +
   "  $p = gh api (""repos/{0}/branches/main/protection"" -f $ownerRepo) | ConvertFrom-Json`r`n" +
   "} catch {`r`n" +
   "  Write-Host 'Could not read branch protection settings back (likely plan limitation).'`r`n" +
   "  throw`r`n" +
   "}`r`n" +
   "Write-Host (""Protection enabled. Required contexts: {0}"" -f ((`$p.required_status_checks.contexts) -join ', '))`r`n" +
   "Write-Host 'Done.'"),
  1
)

if ($raw -eq $before) {
  throw 'No changes made (pattern did not match). v2-60 may have changed.'
}

Set-Content -LiteralPath $target -Value $raw -Encoding UTF8
Write-Host ("Patched error handling in: {0}" -f $target)
Write-Host 'Done.'
