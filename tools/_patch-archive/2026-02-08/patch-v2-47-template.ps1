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
function Read-FileText {
  param([string]$RelPath)
  $p = Join-Path -Path $repoRoot -ChildPath $RelPath
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $RelPath) }
  return $utf8NoBom.GetString([IO.File]::ReadAllBytes($p))
}
function Write-FileText {
  param([string]$RelPath,[string]$Text,[string]$BackupTag)
  $p = Join-Path -Path $repoRoot -ChildPath $RelPath
  $bak = $p + '.' + $BackupTag
  if (-not (Test-Path -LiteralPath $bak)) { if (Test-Path -LiteralPath $p) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) } }
  $parent = Split-Path -Parent $p
  if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

# TODO(v2-47): implement deterministic edits here (anchored rewrites, exact-line ensures, dedupe).
Write-Host ("Apply: " + ([bool]$Apply))
Write-Host "v2-47 patch scaffold created. Add edits next."
