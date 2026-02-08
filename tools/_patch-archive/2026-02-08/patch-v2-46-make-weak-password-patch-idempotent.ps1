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

$pattern = '(?s)\$updated\s*=\s*\[regex\]::Replace\(\$text,\s*\$Pattern,\s*\$Replacement,\s*\$opts\)\s*if\s*\(\$Apply\)\s*\{\s*if\s*\(\$updated\s*-ne\s*\$text\)\s*\{\s*if\s*\(\$PSCmdlet\.ShouldProcess\(\$RelPath,\s*"Replace regex"\)\)\s*\{\s*Write-FileText\s*-RelPath\s*\$RelPath\s*-Text\s*\$updated\s*-BackupTag\s*\$BackupTag\s*\}\s*\}\s*\}\s*return\s*@\{\s*Path=\$RelPath;\s*Replacements=\$m\.Count\s*\}'
$replacement = '$updated = [regex]::Replace($text, $Pattern, $Replacement, $opts)
  if ($updated -eq $text) { return @{ Path=$RelPath; Replacements=0 } }
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Replace regex")) { Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag }
  }
  return @{ Path=$RelPath; Replacements=$m.Count }'
$updatedText = [regex]::Replace($text, $pattern, $replacement)
if ($updatedText -eq $text) { throw "Did not find expected Replace-Regex write block to patch. Refusing to guess." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($rel, "Make Replace-Regex idempotent")) {
    Write-FileText -Rel $rel -Text $updatedText -Tag 'bak_v2_46_patchscript_idempotent'
    Write-Host ("PATCHED " + $rel)
  }
} else {
  Write-Host ("Dry-run: would patch " + $rel)
}
