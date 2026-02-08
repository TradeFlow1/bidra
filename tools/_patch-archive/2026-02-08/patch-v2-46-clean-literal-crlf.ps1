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

$targets = @(
  'app\api\auth\register\route.ts',
  'app\api\auth\password-reset\confirm\route.ts',
  'app\auth\register\page.tsx'
)

$needle = '`r`n'  # literal backtick-r backtick-n text
$nl = "`r`n"        # real CRLF newline
$tag = 'bak_v2_46_literal_crlf_fix'

foreach ($rel in $targets) {
  $text = Read-FileText -Rel $rel
  $count = ([regex]::Matches($text, [regex]::Escape($needle))).Count
  if ($count -eq 0) { Write-Host ("SKIP " + $rel + " (no literal `r`n)"); continue }
  $updated = $text.Replace($needle, $nl)
  if ($updated -eq $text) { Write-Host ("SKIP " + $rel + " (no net change)"); continue }
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($rel, "Convert literal `r`n to real CRLF (" + $count + " hits)")) {
      Write-FileText -Rel $rel -Text $updated -Tag $tag
    }
  }
  Write-Host ("FIX  " + $rel + " (hits=" + $count + ")")
}

if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-46-clean-literal-crlf.ps1 -Apply"
}
