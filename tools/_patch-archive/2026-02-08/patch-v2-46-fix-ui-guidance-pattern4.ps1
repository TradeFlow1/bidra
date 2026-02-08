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

# IMPORTANT: single-quoted so $results/$uiRel are NOT interpolated
$pattern = '(?s)(\$results\.Add\(\(Replace-Exact\s+-RelPath\s+\$uiRel\s+-OldText\s+''[^'']*Use 8\+ characters\.</p>''\s+-NewText\s+''[^'']*\{passwordGuidanceText\(\)\}</p>''\s+-MinReplacements\s+1\s+-BackupTag\s+''bak_v2_46''\)\)\s+\|\s+Out-Null\))'
$m = [regex]::Match($text, $pattern)
if (-not $m.Success) { throw "Could not locate the UI Replace-Exact call in tools\patch-v2-46-weak-password-guidance.ps1" }

$sq = [char]39
$oldText = "<p className={helper}>Use 8+ characters.</p>"
$newText = "<p className={helper}>{passwordGuidanceText()}</p>"
$targetLine = '$results.Add((Replace-Exact -RelPath $uiRel -OldText ' + $sq + $oldText + $sq + ' -NewText ' + $sq + $newText + $sq + ' -MinReplacements 1 -BackupTag ' + $sq + 'bak_v2_46' + $sq + ')) | Out-Null'
$updated = [regex]::Replace($text, $pattern, { param($mm) $targetLine }, 1)
if ($updated -eq $text) { throw "No change made (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Make UI helper Replace-Exact indentation-tolerant")) {
    $bak = $patchPath + '.bak_v2_46_uipat4'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host "Dry-run: would update UI helper Replace-Exact inside tools\patch-v2-46-weak-password-guidance.ps1"
}
