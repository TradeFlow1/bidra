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
function Read-FileText([string]$Rel){
  $p = Join-Path -Path $repoRoot -ChildPath $Rel
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $Rel) }
  return $utf8NoBom.GetString([IO.File]::ReadAllBytes($p))
}
function Write-FileText([string]$Rel,[string]$Text,[string]$Tag){
  $p = Join-Path -Path $repoRoot -ChildPath $Rel
  $bak = $p + '.' + $Tag
  if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

$rel = 'tools\patch-v2-46-weak-password-guidance.ps1'
$text = Read-FileText -Rel $rel

$newFnLines = @(
'  ''function Replace-Regex {''',
'  ''  param([string]$RelPath,[string]$Pattern,[string]$Replacement,[int]$MinReplacements,[string]$BackupTag,[string]$AlreadyAppliedPattern)''',
'  ''  $text = Read-FileText -RelPath $RelPath''',
'  ''  $opts = [Text.RegularExpressions.RegexOptions]::Multiline''',
'  ''''',
'  ''  # Idempotency first: if the "already applied" marker exists, do nothing and do not require the old pattern.''',
'  ''  if (-not [string]::IsNullOrWhiteSpace($AlreadyAppliedPattern)) {''',
'  ''    $am = [regex]::Match($text, $AlreadyAppliedPattern, $opts)''',
'  ''    if ($am.Success) { return @{ Path=$RelPath; Replacements=0 } }''',
'  ''  }''',
'  ''''',
'  ''  $m = [regex]::Matches($text, $Pattern, $opts)''',
'  ''  if ($m.Count -lt $MinReplacements) {''',
'  ''    throw ("Expected " + $MinReplacements + " regex matches not found in " + $RelPath)''',
'  ''  }''',
'  ''''',
'  ''  $updated = [regex]::Replace($text, $Pattern, $Replacement, $opts)''',
'  ''  if ($updated -eq $text) { return @{ Path=$RelPath; Replacements=0 } }''',
'  ''''',
'  ''  if ($Apply) {''',
'  ''    if ($PSCmdlet.ShouldProcess($RelPath, "Replace regex")) {''',
'  ''      Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag''',
'  ''    }''',
'  ''  }''',
'  ''''',
'  ''  return @{ Path=$RelPath; Replacements=$m.Count }''',
'  ''}''',
)
$newFnText = ($newFnLines -join "`r`n") + "`r`n"

$pattern = '(?s)function\s+Replace-Regex\s*\{\s*.*?\r?\n\}\r?\n'
$updated = [regex]::Replace($text, $pattern, $newFnText)
if ($updated -eq $text) { throw "Replace-Regex function block not found / not replaced. Refusing to guess." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($rel, "Patch Replace-Regex to be idempotent-first")) {
    Write-FileText -Rel $rel -Text $updated -Tag 'bak_v2_46_patchscript_idempotent_first'
    Write-Host ("PATCHED " + $rel)
  }
} else {
  Write-Host ("Dry-run: would patch " + $rel)
}
