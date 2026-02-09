#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

function Backup-File {
  param([string]$File)
  $bak = "$File.bak_v2_52_fix_next_config_bom"
  if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
}

function Write-Utf8NoBomLines {
  param([string]$File,[string[]]$Lines)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines((Resolve-Path -LiteralPath $File), $Lines, $utf8NoBom)
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$cfg = '.\next.config.mjs'
if (-not (Test-Path -LiteralPath $cfg)) { throw "Missing: $cfg" }
Backup-File -File $cfg

$out = @(
  '/** @type {import("next").NextConfig} */'
  'const isDev = process.env.NODE_ENV !== "production";'
  ''
  'const nextConfig = {'
  '  images: {'
  '    remotePatterns: ['
  '      ...(isDev'
  '        ? ['
  '            { protocol: "http", hostname: "127.0.0.1", port: "3000" },'
  '            { protocol: "http", hostname: "localhost", port: "3000" },'
  '          ]'
  '        : []),'
  '      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },'
  '    ],'
  '  },'
  '  output: "standalone",'
  '};'
  ''
  'export default nextConfig;'
)

# Ensure trailing newline by appending an empty final line
$out2 = $out + @('')
Write-Utf8NoBomLines -File $cfg -Lines $out2
Write-Host ("Patched: {0} (UTF-8 no BOM)" -f $cfg)

Write-Host '== git diff -- next.config.mjs =='
git diff -- next.config.mjs | Out-Host
