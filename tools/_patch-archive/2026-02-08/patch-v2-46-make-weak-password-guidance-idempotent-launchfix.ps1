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

# Ensure the launch-fixes Replace-Regex callsite is idempotent
$sq = [char]39

$callFind = '(?s)(Replace-Regex\s+-RelPath\s+\$fixRel[\s\S]*?)(-MinReplacements\s+1\s+-BackupTag\s+' + $sq + 'bak_v2_46' + $sq + ')'
$m = [regex]::Match($text, $callFind)
if (-not $m.Success) { throw "Could not find launch-fixes Replace-Regex callsite for $fixRel." }

$changes = 0
$e = [System.Text.RegularExpressions.MatchEvaluator]{
  param($mm)
  $block = $mm.Groups[1].Value
  $tail  = $mm.Groups[2].Value
  if ($block -match '-AlreadyAppliedPattern') { return $mm.Value }
  $script:changes = $script:changes + 1
  $ap = '(?s)"Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*true'
  return ($block + '-AlreadyAppliedPattern ' + $sq + $ap + $sq + ' ' + $tail)
}

$updated = [regex]::Replace($text, $callFind, $e, 1)
if ($changes -lt 1) { throw "No changes made (launch-fixes callsite may already be idempotent)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Make launch-fixes Replace-Regex idempotent")) {
    $bak = $patchPath + '.bak_v2_46_idempotent_launchfix'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel + " (launch-fixes callsite updated)")
  }
} else {
  Write-Host ("Dry-run: would make launch-fixes Replace-Regex idempotent in " + $patchRel)
}
