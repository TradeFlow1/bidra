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

$rel = 'tools\bidra-launch-fixes.json'
$path = Join-Path -Path $repoRoot -ChildPath $rel
$dir2 = Split-Path -Parent $path
if (-not (Test-Path -LiteralPath $dir2)) { New-Item -ItemType Directory -Path $dir2 | Out-Null }

$lines = @(
  '[',
  '  {',
  '    "Id": 46,',
  '    "Done": false',
  '  }',
  ']'
)

if (Test-Path -LiteralPath $path) {
  Write-Host ("Exists: " + $rel + " (leaving as-is)")
  return
}

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($rel, "Create minimal launch fixes json")) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllLines($path, $lines, $utf8NoBom)
    Write-Host ("CREATED " + $rel)
  }
} else {
  Write-Host ("Dry-run: would create " + $rel)
}
