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

$oldFrag = '-OldText '''                   <p className={helper}>Use 8+ characters.</p>''' -NewText '''                   <p className={helper}>{passwordGuidanceText()}</p>'''
$newFrag = '-OldText '''<p className={helper}>Use 8+ characters.</p>''' -NewText '''<p className={helper}>{passwordGuidanceText()}</p>'''

$idx = $text.IndexOf($oldFrag, [StringComparison]::Ordinal)
if ($idx -lt 0) {
  throw "Could not find the UI Replace-Exact fragment in patch-v2-46 (it may already be fixed or differs)."
}

$updated = $text.Replace($oldFrag, $newFrag)
if ($updated -eq $text) { throw "No change made (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Make UI guidance Replace-Exact indentation-tolerant")) {
    $bak = $patchPath + '.bak_v2_46_uiexact'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host "Dry-run: would update UI guidance Replace-Exact fragment inside tools\patch-v2-46-weak-password-guidance.ps1"
}
