#Requires -Version 5.1
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($p -and -not (Test-Path -LiteralPath (Join-Path $p 'package.json'))) {
    $parent = Split-Path -Parent $p
    if ($parent -eq $p) { break }
    $p = $parent
  }
  if ($p -and (Test-Path -LiteralPath (Join-Path $p 'package.json'))) { return $p }
  throw 'Cannot locate repo root (package.json). Refusing to run.'
}

$root = Find-RepoRoot
Set-Location $root

$pkgPath = Join-Path $root 'package.json'
if (-not (Test-Path -LiteralPath $pkgPath)) { throw 'Missing: ' + $pkgPath }

$raw = Get-Content -LiteralPath $pkgPath -Raw -Encoding UTF8
$pkg = $raw | ConvertFrom-Json

if (-not $pkg.PSObject.Properties.Match('dependencies')) { $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue (@{}) }
if (-not $pkg.PSObject.Properties.Match('devDependencies')) { $pkg | Add-Member -NotePropertyName devDependencies -NotePropertyValue (@{}) }

$ver = '6.19.0'

$pkg.dependencies.'@prisma/client' = $ver
$pkg.devDependencies.prisma = $ver

$bak = $pkgPath + '.bak.' + (Get-Date -Format 'yyyyMMdd-HHmmss')
[System.IO.File]::Copy($pkgPath, $bak, $true)

$json = $pkg | ConvertTo-Json -Depth 50
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$out = $json + [Environment]::NewLine
[System.IO.File]::WriteAllText($pkgPath, $out, $utf8NoBom)

"Patched: {0}" -f $pkgPath
"Backup:  {0}" -f $bak
