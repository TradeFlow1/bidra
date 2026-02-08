#Requires -Version 5.1
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  param([string]$StartDir)
  if ([string]::IsNullOrWhiteSpace($StartDir)) { throw "StartDir empty." }
  $d = Resolve-Path -LiteralPath $StartDir
  while ($true) {
    $pkg = Join-Path $d 'package.json'
    if (Test-Path -LiteralPath $pkg) { return $d }
    $p = Split-Path -Parent $d
    if ($p -eq $d -or [string]::IsNullOrWhiteSpace($p)) { break }
    $d = $p
  }
  throw "Repo root not found (package.json)."
}

$startDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }
$repoRoot = Get-RepoRoot -StartDir $startDir
Set-Location -LiteralPath $repoRoot

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# UI/copy only. Avoid app\api, prisma, tmp scripts.
$scanDirs = @(
  'app\(public)',
  'app\help',
  'app\how-it-works',
  'app\orders',
  'app\support',
  'app\legal',
  'components',
  'lib',
  'public',
  'styles'
)

$exts = @('.ts','.tsx','.js','.jsx','.md','.txt','.json')
$excludeDirNames = @('node_modules','.next','.git','prisma','archives','_fix_refs')

function Is-ExcludedPath {
  param([string]$FullPath)
  $n = $FullPath.ToLowerInvariant()
  $apiNeedle = [IO.Path]::DirectorySeparatorChar + 'app' + [IO.Path]::DirectorySeparatorChar + 'api' + [IO.Path]::DirectorySeparatorChar
  if ($n -match ([regex]::Escape($apiNeedle))) { return $true }
  foreach ($x in $excludeDirNames) {
    $needle = [IO.Path]::DirectorySeparatorChar + $x.ToLowerInvariant() + [IO.Path]::DirectorySeparatorChar
    if ($n -match ([regex]::Escape($needle))) { return $true }
    if ($n.EndsWith([IO.Path]::DirectorySeparatorChar + $x.ToLowerInvariant())) { return $true }
  }
  $leaf = [IO.Path]::GetFileName($n)
  if ($leaf -like 'tmp-create-*.js') { return $true }
  return $false
}

function Read-FileText {
  param([string]$Path)
  $b = [IO.File]::ReadAllBytes($Path)
  return $utf8NoBom.GetString($b)
}

$patterns = @(
  @{ Name='PENDING state'; Pattern='(?i)\bPENDING\b' },
  @{ Name='shipping'; Pattern='(?i)\bshipping\b' },
  @{ Name='postage'; Pattern='(?i)\bpostage\b' },
  @{ Name='delivery'; Pattern='(?i)\bdelivery\b' },
  @{ Name='checkout'; Pattern='(?i)\bcheckout\b' },
  @{ Name='pay now'; Pattern='(?i)\bpay\s+now\b' }
)

$files = New-Object System.Collections.Generic.List[IO.FileInfo]
foreach ($d in $scanDirs) {
  $p = Join-Path $repoRoot $d
  if (-not (Test-Path -LiteralPath $p)) { continue }
  Get-ChildItem -LiteralPath $p -Recurse -File | ForEach-Object {
    if (Is-ExcludedPath -FullPath $_.FullName) { return }
    $ext = $_.Extension.ToLowerInvariant()
    if ($exts -contains $ext) { $files.Add($_) | Out-Null }
  }
}

$hits = New-Object System.Collections.Generic.List[string]
foreach ($f in $files) {
  $text = Read-FileText -Path $f.FullName
  $linesInFile = $text -split "`r?`n"
  for ($i=0; $i -lt $linesInFile.Length; $i++) {
    $line = $linesInFile[$i]
    foreach ($p in $patterns) {
      if ($line -match $p.Pattern) {
        $rel = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
        $msg = "{0}:{1}  [{2}]  {3}" -f $rel, ($i+1), $p.Name, $line.Trim()
        $hits.Add($msg) | Out-Null
      }
    }
  }
}

$reportPath = Join-Path $repoRoot 'tools\v2-scan-contradictions-report.txt'
[IO.File]::WriteAllLines($reportPath, $hits.ToArray(), $utf8NoBom)

Write-Host '== V2 contradiction scan (UI/copy only) =='
Write-Host ("Scanned files: " + $files.Count)
Write-Host ("Hits: " + $hits.Count)
Write-Host ("Report: " + $reportPath)
foreach ($h in $hits) { Write-Host $h }