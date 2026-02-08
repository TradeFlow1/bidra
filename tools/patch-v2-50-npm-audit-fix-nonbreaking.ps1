#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

Write-Host '== Before: npm audit =='
npm audit | Out-Host

Write-Host '== Running: npm audit fix (non-breaking) =='
npm audit fix | Out-Host

Write-Host '== After: npm audit =='
npm audit | Out-Host

Write-Host '== Verify: build =='
npm run build | Out-Host

Write-Host '== Verify: lint =='
npm run lint | Out-Host

Write-Host 'Done.'
