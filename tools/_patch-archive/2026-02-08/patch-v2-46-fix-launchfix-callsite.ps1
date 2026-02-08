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

# Force-fix ONLY the launch-fixes Replace-Regex callsite to be re-runnable
$sq = [char]39

$find = '(?s)\$results\.Add\(\(Replace-Regex\s+-RelPath\s+\$fixRel\s+-Pattern\s+' + $sq + '[\s\S]*?' + $sq + '\s+-Replacement\s+' + $sq + '[\s\S]*?' + $sq + '\s+(?:-AlreadyAppliedPattern\s+' + $sq + '[\s\S]*?' + $sq + '\s+)?-MinReplacements\s+1\s+-BackupTag\s+' + $sq + 'bak_v2_46' + $sq + '\)\)\s*\|\s*Out-Null'
$m = [regex]::Match($text, $find)
if (-not $m.Success) { throw "Could not locate the $fixRel Replace-Regex block to patch." }

$patternFix = '("Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*)false'
$already = '(?s)"Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*true'
$replacement = '$1true'

$newBlock = '$results.Add((Replace-Regex -RelPath $fixRel -Pattern ' + $sq + $patternFix + $sq + ' -Replacement ' + $sq + $replacement + $sq + ' -MinReplacements 1 -AlreadyAppliedPattern ' + $sq + $already + $sq + ' -BackupTag ' + $sq + 'bak_v2_46' + $sq + ')) | Out-Null'
$updated = [regex]::Replace($text, $find, [System.Text.RegularExpressions.MatchEvaluator]{ param($mm) $newBlock }, 1)
if ($updated -eq $text) { throw "No change made (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Fix launch-fixes Replace-Regex callsite to be idempotent")) {
    $bak = $patchPath + '.bak_v2_46_launchfix_callsite'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel + " (launch-fixes callsite fixed)")
  }
} else {
  Write-Host ("Dry-run: would fix launch-fixes callsite in " + $patchRel)
}
