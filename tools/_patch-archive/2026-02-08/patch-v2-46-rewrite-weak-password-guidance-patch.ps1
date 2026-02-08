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

$patchRel = 'tools\patch-v2-46-weak-password-guidance.ps1'
$patchPath = Join-Path -Path $repoRoot -ChildPath $patchRel

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Write-Utf8NoBom([string]$Path, [string]$Text) {
  [IO.File]::WriteAllBytes($Path, $utf8NoBom.GetBytes($Text))
}

# Build a clean, PS5.1-safe patch script (idempotent)
$P = New-Object System.Collections.Generic.List[string]
$P.Add('#Requires -Version 5.1') | Out-Null
$P.Add('[CmdletBinding(SupportsShouldProcess=$true)]') | Out-Null
$P.Add('param([switch]$Apply)') | Out-Null
$P.Add('') | Out-Null
$P.Add('Set-StrictMode -Version Latest') | Out-Null
$P.Add('$ErrorActionPreference = ''Stop''' ) | Out-Null
$P.Add('') | Out-Null
$patchText = ($P.ToArray() -join "`r`n") + "`r`n"
if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Rewrite patch script cleanly")) {
    if (Test-Path -LiteralPath $patchPath) {
      $bak = $patchPath + '.bak_v2_46_rewrite'
      if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    }
    Write-Utf8NoBom -Path $patchPath -Text $patchText
    Write-Host ("REWROTE " + $patchRel)
  }
} else {
  Write-Host ("Dry-run: would rewrite " + $patchRel + " cleanly")
}
