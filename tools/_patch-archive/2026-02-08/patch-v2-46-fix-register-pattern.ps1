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

$newPattern = 'if \(passwordStr\.length < 8\)\s*\{\s*\r?\n\s*return\s+NextResponse\.json\(\s*\{\s*error:\s*"Password must be at least 8 characters\."\s*\}\s*,\s*\{\s*status\s*:\s*400\s*\}\s*\)\s*;?\s*\r?\n\s*\}\s*\r?\n'

$find = '(\$results\.Add\(\(Replace-Regex\s+-RelPath\s+\$regRel\s+-Pattern\s+'')([\s\S]*?)(''[\s]+-Replacement\s+'')'
$m = [regex]::Match($text, $find)
if (-not $m.Success) {
  throw "Could not locate the register Replace-Regex call in tools\patch-v2-46-weak-password-guidance.ps1"
}

$updated = [regex]::Replace($text, $find, ('$1' + $newPattern + '$3'), 1)
if ($updated -eq $text) { throw "No change made (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Update register -Pattern to be whitespace/newline tolerant")) {
    $bak = $patchPath + '.bak_v2_46_regpat'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host "Dry-run: would update register -Pattern inside tools\patch-v2-46-weak-password-guidance.ps1"
}
