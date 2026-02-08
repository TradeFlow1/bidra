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
  if (-not (Test-Path -LiteralPath $bak)) {
    [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p))
  }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

function Replace-Exact {
  param([string]$RelPath,[string]$OldText,[string]$NewText,[int]$MinReplacements)
  $text = Read-FileText -RelPath $RelPath
  $count = 0
  $idx = 0
  while ($true) {
    $pos = $text.IndexOf($OldText, $idx, [StringComparison]::Ordinal)
    if ($pos -lt 0) { break }
    $count += 1
    $idx = $pos + $OldText.Length
  }
  if ($count -lt $MinReplacements) { throw ("Expected " + $MinReplacements + " not found in " + $RelPath) }
  $updated = $text.Replace($OldText, $NewText)
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Replace exact text")) {
      Write-FileText -RelPath $RelPath -Text $updated -BackupTag 'bak_v2paynow'
    }
  }
  return @{ Path=$RelPath; Replacements=$count }
}

$results = New-Object System.Collections.Generic.List[object]

# --- Fix the 7 remaining contradiction hits ---

# app\how-it-works\page.tsx: Pay Now sentence -> pickup-gated payment confirmation
$results.Add((Replace-Exact -RelPath 'app\how-it-works\page.tsx' -OldText 'For Buy Now purchases, Bidra provides a Pay Now page with the current payment instructions and confirmation steps.' -NewText 'For Buy Now purchases, pickup is scheduled in-app first. After pickup is scheduled, you can confirm payment in the app.' -MinReplacements 1)) | Out-Null

# Orders list + details: Pay now label -> Confirm payment
$results.Add((Replace-Exact -RelPath 'app\orders\page.tsx' -OldText '<span className="block">Pay now</span>' -NewText '<span className="block">Confirm payment</span>' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\orders\[id]\page.tsx' -OldText '<span className="block">Pay now</span>' -NewText '<span className="block">Confirm payment</span>' -MinReplacements 1)) | Out-Null

# Order details bullet: remove Pay now wording
$results.Add((Replace-Exact -RelPath 'app\orders\[id]\page.tsx' -OldText '<li><b>Pay now</b> to continue. This order is binding.</li>' -NewText '<li><b>Confirm payment</b> to continue. This order is binding. Pickup must be scheduled first.</li>' -MinReplacements 1)) | Out-Null

# Pay page heading: Pay now -> Confirm payment
$results.Add((Replace-Exact -RelPath 'app\orders\[id]\pay\page.tsx' -OldText '<h1 className="text-3xl font-extrabold tracking-tight">Pay now</h1>' -NewText '<h1 className="text-3xl font-extrabold tracking-tight">Confirm payment</h1>' -MinReplacements 1)) | Out-Null

# Comments: remove "PENDING" token from code comments
$results.Add((Replace-Exact -RelPath 'components\order-status-timeline.tsx' -OldText 'return 0; // PENDING / default' -NewText 'return 0; // default' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'lib\notifications.ts' -OldText '// 2) Pending feedback tasks (same gate used to block listing creation)' -NewText '// 2) Feedback tasks (same gate used to block listing creation)' -MinReplacements 1)) | Out-Null

# Summary
$total = 0
foreach ($r in $results) { $total += [int]$r.Replacements }
Write-Host ("Apply: " + ([bool]$Apply))
Write-Host ("Files touched: " + $results.Count)
Write-Host ("Total replacements: " + $total)
foreach ($r in $results) { Write-Host (("EDIT {0} (repl={1})" -f $r.Path, $r.Replacements)) }
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-remove-paynow-and-pending-comments.ps1 -Apply"
}
