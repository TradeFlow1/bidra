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
  if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

function Replace-OutcomePickupRequired {
  param([string]$RelPath)
  $text = Read-FileText -RelPath $RelPath
  $pattern = 'outcome:\s*"PICKUP_REQUIRED"'
  $m = [regex]::Matches($text, $pattern)
  if ($m.Count -lt 1) { return @{ Path=$RelPath; Replacements=0 } }
  $updated = [regex]::Replace($text, $pattern, 'outcome: "PENDING"')
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, 'Fix SaleOutcome value')) {
      Write-FileText -RelPath $RelPath -Text $updated -BackupTag 'bak_v2saleoutcome'
    }
  }
  return @{ Path=$RelPath; Replacements=$m.Count }
}

$targets = @(
  'app\api\listings\[id]\accept-highest-offer\route.ts',
  'app\api\listings\[id]\buy-now\route.ts',
  'tmp-create-overdue-order.js',
  'tmp-create-test-order.js'
)

$results = New-Object System.Collections.Generic.List[object]
foreach ($t in $targets) {
  $p = Join-Path $repoRoot $t
  if (Test-Path -LiteralPath $p) { $results.Add((Replace-OutcomePickupRequired -RelPath $t)) | Out-Null }
}

$total = 0
foreach ($r in $results) { $total += [int]$r.Replacements }
Write-Host ("Apply: " + ([bool]$Apply))
Write-Host ("Files checked: " + $results.Count)
Write-Host ("Total replacements: " + $total)
foreach ($r in $results) { Write-Host (("EDIT {0} (repl={1})" -f $r.Path, $r.Replacements)) }
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-fix-saleoutcome-pickuprequired.ps1 -Apply"
}
