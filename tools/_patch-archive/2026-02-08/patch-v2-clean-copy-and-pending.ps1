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

$logPath = Join-Path -Path $repoRoot -ChildPath 'tools\patch-v2-clean-copy-and-pending.log'
$changes = New-Object System.Collections.Generic.List[string]

$scanDirs = @('app','components','public','styles','docs')
$exts = @('.tsx','.ts','.jsx','.js','.md','.txt','.json')
$excludeDirNames = @('node_modules','.next','.git','prisma','archives','_fix_refs')

function Is-Excluded {
  param([string]$FullPath)
  $norm = $FullPath.ToLowerInvariant()
  if ($norm -match ([regex]::Escape([IO.Path]::DirectorySeparatorChar + 'app' + [IO.Path]::DirectorySeparatorChar + 'api' + [IO.Path]::DirectorySeparatorChar))) { return $true }
  foreach ($x in $excludeDirNames) {
    $needle = [IO.Path]::DirectorySeparatorChar + $x.ToLowerInvariant() + [IO.Path]::DirectorySeparatorChar
    if ($norm -match ([regex]::Escape($needle))) { return $true }
    if ($norm.EndsWith([IO.Path]::DirectorySeparatorChar + $x.ToLowerInvariant())) { return $true }
  }
  return $false
}

function Get-TextFiles {
  $files = New-Object System.Collections.Generic.List[IO.FileInfo]
  foreach ($d in $scanDirs) {
    $p = Join-Path -Path $repoRoot -ChildPath $d
    if (-not (Test-Path -LiteralPath $p)) { continue }
    Get-ChildItem -LiteralPath $p -Recurse -File | ForEach-Object {
      if (Is-Excluded -FullPath $_.FullName) { return }
      if ($exts -contains $_.Extension.ToLowerInvariant()) { $files.Add($_) }
    }
  }
  return $files
}

$replacements = @(
  @{ Name='OrderState:PENDING'; Pattern='(["''])PENDING\1'; Replace='$1PICKUP_REQUIRED$1' },
  @{ Name='OrderState:Pending'; Pattern='(["''])Pending\1'; Replace='$1Pickup required$1' },
  @{ Name='Copy:shipping'; Pattern='(["''])(?i:shipping)(\1)'; Replace='$1pickup only$2' },
  @{ Name='Copy:postage'; Pattern='(["''])(?i:postage)(\1)'; Replace='$1pickup only$2' },
  @{ Name='Copy:delivery'; Pattern='(["''])(?i:delivery)(\1)'; Replace='$1pickup only$2' },
  @{ Name='Copy:checkout'; Pattern='(["''])(?i:checkout)(\1)'; Replace='$1confirm$2' },
  @{ Name='Copy:pay now'; Pattern='(["''])(?i:pay now)(\1)'; Replace='$1confirm$2' }
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Read-FileText { param([string]$Path) $bytes = [IO.File]::ReadAllBytes($Path); return $utf8NoBom.GetString($bytes) }
function Write-FileText { param([string]$Path,[string]$Text) $bytes = $utf8NoBom.GetBytes($Text); [IO.File]::WriteAllBytes($Path,$bytes) }

$files = Get-TextFiles
if ($files.Count -eq 0) { throw ("No target files found under: " + ($scanDirs -join "", "")) }

$totalFileEdits = 0
$totalReplHits = 0

foreach ($f in $files) {
  $orig = Read-FileText -Path $f.FullName
  $text = $orig
  $fileHits = 0
  foreach ($r in $replacements) {
    $m = [regex]::Matches($text, $r.Pattern)
    if ($m.Count -gt 0) {
      $fileHits += $m.Count
      $totalReplHits += $m.Count
      $text = [regex]::Replace($text, $r.Pattern, $r.Replace)
    }
  }
  if ($text -ne $orig) {
    $totalFileEdits += 1
    $rel = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
    $changes.Add(("EDIT {0} (hits={1})" -f $rel, $fileHits)) | Out-Null
    if ($Apply) {
      if ($PSCmdlet.ShouldProcess($rel, "Write updated content")) {
        $bak = $f.FullName + '.bak_v2copy'
        if (-not (Test-Path -LiteralPath $bak)) { Write-FileText -Path $bak -Text $orig }
        Write-FileText -Path $f.FullName -Text $text
      }
    }
  }
}

$header = @(
  ("RepoRoot: {0}" -f $repoRoot),
  ("Apply: {0}" -f ([bool]$Apply)),
  ("EditedFiles: {0}" -f $totalFileEdits),
  ("ReplacementHits: {0}" -f $totalReplHits),
  ("When: {0}" -f (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")),
  ("-" * 60)
)

$outLines = New-Object System.Collections.Generic.List[string]
foreach ($h in [string[]]$header) { $outLines.Add($h) | Out-Null }
foreach ($c in $changes) { $outLines.Add([string]$c) | Out-Null }
[IO.File]::WriteAllLines($logPath, $outLines.ToArray(), $utf8NoBom)
foreach ($l in $outLines) { Write-Host $l }
if (-not $Apply) { Write-Host ""; Write-Host "Dry-run only. Re-run with -Apply:"; Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-clean-copy-and-pending.ps1 -Apply" }
