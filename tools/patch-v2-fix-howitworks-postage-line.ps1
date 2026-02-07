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
    $parent = Split-Path -Path $d -Parent
    if ($parent -eq $d -or [string]::IsNullOrWhiteSpace($parent)) { break }
    $d = $parent
  }
  throw "Repo root not found (package.json). Refusing to run outside repo."
}

$startDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }
$repoRoot = Get-RepoRoot -StartDir $startDir
Set-Location -LiteralPath $repoRoot

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Text {
  param([string]$RelPath)
  $p = Join-Path $repoRoot $RelPath
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $RelPath) }
  $b = [IO.File]::ReadAllBytes($p)
  return $utf8NoBom.GetString($b)
}

function Write-Text {
  param([string]$RelPath,[string]$Text,[string]$BackupTag)
  $p = Join-Path $repoRoot $RelPath
  $bak = $p + '.' + $BackupTag
  if (-not (Test-Path -LiteralPath $bak)) {
    [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p))
  }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

$rel = 'app\how-it-works\page.tsx'
$text = Read-Text -RelPath $rel

# Replace the entire <li> that mentions postage. Avoid smart quotes by matching loosely.
$pattern = '<li>Use Messages to confirm details \(([^)]*pickup time[^)]*)\)\.</li>'
$replacement = '<li>Use Messages only to confirm item details (what is included, condition, access). Pickup time is scheduled in-app.</li>'

$m = [regex]::Matches($text, $pattern)
if ($m.Count -lt 1) { throw "Expected target <li> line not found in app\how-it-works\page.tsx" }
$updated = [regex]::Replace($text, $pattern, $replacement)

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($rel, "Replace postage/messaging line")) {
    Write-Text -RelPath $rel -Text $updated -BackupTag 'bak_v2howitworks'
  }
}

Write-Host ("Apply: " + ([bool]$Apply))
Write-Host ("Replacements: " + $m.Count)
Write-Host ("EDIT " + $rel)
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-fix-howitworks-postage-line.ps1 -Apply"
}
