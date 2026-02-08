#Requires -Version 5.1
[CmdletBinding(SupportsShouldProcess=$true)]
param([switch]$Apply)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  param([string]$StartDir)
  if ([string]::IsNullOrWhiteSpace($StartDir)) { throw "StartDir is empty. Refusing to run." }
  $d = Resolve-Path -LiteralPath $StartDir
  while ($true) {
    $pkg = Join-Path -Path $d -ChildPath 'package.json'
    if (Test-Path -LiteralPath $pkg) { return $d }
    $p = Split-Path -Path $d -Parent
    if ($p -eq $d -or [string]::IsNullOrWhiteSpace($p)) { break }
    $d = $p
  }
  throw "Repo root not found (package.json). Refusing to run outside repo."
}

$startDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }
$repoRoot = Get-RepoRoot -StartDir $startDir
Set-Location -LiteralPath $repoRoot

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$patchRel = 'tools\patch-v2-46-weak-password-guidance.ps1'
$patchPath = Join-Path -Path $repoRoot -ChildPath $patchRel
if (-not (Test-Path -LiteralPath $patchPath)) { throw ("Missing: " + $patchRel) }
$text = $utf8NoBom.GetString([IO.File]::ReadAllBytes($patchPath))

# Add -AlreadyAppliedPattern to UI Replace-Regex callsites (so re-runs don't throw)
$pat = '(?s)(Replace-Regex\s+-RelPath\s+\$uiRel[\s\S]*?)(-MinReplacements\s+1\s+-BackupTag\s+''bak_v2_46'')'
$matches = [regex]::Matches($text, $pat)
if ($matches.Count -lt 1) { throw "No UI Replace-Regex callsites found (unexpected)." }

$changes = 0
$evaluator = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $block = $m.Groups[1].Value
  $tail  = $m.Groups[2].Value
  if ($block -match '-AlreadyAppliedPattern') { return $m.Value }
  $script:changes = $script:changes + 1
  return ($block + '-AlreadyAppliedPattern ''passwordGuidanceText'' ' + $tail)
}

$updated = [regex]::Replace($text, $pat, $evaluator)
if ($changes -lt 1) { throw "No changes made (UI callsites may already be idempotent)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Make UI Replace-Regex callsites idempotent")) {
    $bak = $patchPath + '.bak_v2_46_idempotent_ui'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel + " (UI callsites updated: " + $changes + ")")
  }
} else {
  Write-Host ("Dry-run: would add -AlreadyAppliedPattern to UI Replace-Regex callsites in " + $patchRel)
  Write-Host ("Would update callsites: " + $changes)
}
