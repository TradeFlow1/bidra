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

# Find the Replace-Exact line for the UI helper text and remove indentation dependency
$pattern = "(?s)(\\$results\\.Add\\(\\(Replace-Exact\\s+-RelPath\\s+\\$uiRel\\s+-OldText\\s+'[^']*Use 8\\+ characters\\.<\\/p>'\\s+-NewText\\s+'[^']*\\{passwordGuidanceText\\(\\)\\}<\\/p>'\\s+-MinReplacements\\s+1\\s+-BackupTag\\s+'bak_v2_46'\\)\\)\\s+\\|\\s+Out-Null\\))"
$m = [regex]::Match($text, $pattern)
if (-not $m.Success) { throw "Could not locate the UI Replace-Exact call in tools\patch-v2-46-weak-password-guidance.ps1" }

$replacement = '$results.Add((Replace-Exact -RelPath $uiRel -OldText ''<p className={helper}>Use 8+ characters.</p>'' -NewText ''<p className={helper}>{passwordGuidanceText()}</p>'' -MinReplacements 1 -BackupTag ''bak_v2_46'')) | Out-Null'
$updated = [regex]::Replace($text, $pattern, $replacement, 1)
if ($updated -eq $text) { throw "No change made (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Make UI helper Replace-Exact indentation-tolerant")) {
    $bak = $patchPath + '.bak_v2_46_uipat'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host "Dry-run: would update UI helper Replace-Exact inside tools\patch-v2-46-weak-password-guidance.ps1"
}
