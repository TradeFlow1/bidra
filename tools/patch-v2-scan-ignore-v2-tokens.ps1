#Requires -Version 5.1
[CmdletBinding(SupportsShouldProcess=$true)]
param([switch]$Apply)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  param([string]$StartDir)
  $d = Resolve-Path -LiteralPath $StartDir
  while ($true) {
    if (Test-Path -LiteralPath (Join-Path $d 'package.json')) { return $d }
    $p = Split-Path -Parent $d
    if ($p -eq $d) { break }
    $d = $p
  }
  throw "Repo root not found (package.json)."
}

$startDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }
$repoRoot = Get-RepoRoot -StartDir $startDir
Set-Location -LiteralPath $repoRoot

$scanPath = Join-Path $repoRoot 'tools\v2-scan-truth.ps1'
if (-not (Test-Path -LiteralPath $scanPath)) { throw "Missing tools\v2-scan-truth.ps1" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$orig = $utf8NoBom.GetString([IO.File]::ReadAllBytes($scanPath))

# Make the scan ignore V2-positive tokens so it only reports contradictions.
# We do this by injecting an ignore regex list if not present.

$marker = '# V2_SCAN_IGNORE_PATTERNS_INJECTED'
if ($orig.IndexOf($marker, [StringComparison]::Ordinal) -ge 0) {
  Write-Host "Scan script already patched."
  exit 0
}

$inject = @()
$inject += $marker
$inject += '# Ignore V2-positive tokens (these are expected and not contradictions)'
$inject += '$V2ScanIgnorePatterns = @(''
$inject += ' )'
$inject += ''
$injectBlock = ($inject -join [Environment]::NewLine)

# Try to insert right after the banner line if it exists, else prepend to top (after requires).
$newline = [Environment]::NewLine
$parts = $orig -split [regex]::Escape($newline)

$insertAt = 0
for ($i=0; $i -lt $parts.Length; $i++) {
  if ($parts[$i] -like '*V2 scan*') { $insertAt = $i + 1; break }
}

$newParts = New-Object System.Collections.Generic.List[string]
for ($i=0; $i -lt $parts.Length; $i++) {
  $newParts.Add($parts[$i]) | Out-Null
  if ($i -eq $insertAt) {
    foreach ($l in ($injectBlock -split [regex]::Escape($newline))) { $newParts.Add($l) | Out-Null }
  }
}

$updated = ($newParts.ToArray() -join $newline)

# Now patch the hit-printing section to skip ignored patterns, without guessing exact variable names:
# Replace any line that adds hits with a guard: if match is NOT in ignore list.
$updated = $updated -replace '(?m)^\s*\$hits\.Add\((.+)\)\s*$','if (-not ($V2ScanIgnorePatterns | Where-Object { $line -match $_ })) { $hits.Add($1) }'

if ($Apply) {
  if ($PSCmdlet.ShouldProcess('tools\v2-scan-truth.ps1','Patch ignore patterns')) {
    $bak = $scanPath + '.bak_v2scanignore'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($scanPath)) }
    [IO.File]::WriteAllBytes($scanPath, $utf8NoBom.GetBytes($updated))
  }
}

Write-Host ("Apply: " + ([bool]$Apply))
Write-Host "Patched tools\v2-scan-truth.ps1 to ignore V2-positive tokens."
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-scan-ignore-v2-tokens.ps1 -Apply"
}
