#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $MyInvocation.MyCommand.Path
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

function Ensure-Dir {
  param([string]$Dir)
  if (-not (Test-Path -LiteralPath $Dir)) { New-Item -ItemType Directory -Force -Path $Dir | Out-Null }
}

function Backup-File {
  param([string]$File)
  $bak = "$File.bak_v2_65_dependabot_ignore_nodemailer_major"
  if (Test-Path -LiteralPath $File) {
    if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
  }
}

function Write-Utf8NoBomLines {
  param([string]$File,[string[]]$Lines)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $full = [System.IO.Path]::GetFullPath($File)
  [System.IO.File]::WriteAllLines($full, $Lines, $utf8NoBom)
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

Ensure-Dir -Dir (Join-Path $repoRoot '.github')

$cfg = Join-Path $repoRoot '.github\dependabot.yml'
if (-not (Test-Path -LiteralPath $cfg)) { throw "Missing: $cfg" }
Backup-File -File $cfg

# Rewrite dependabot config with an ignore rule for nodemailer major bumps
$out = @(
  'version: 2'
  'updates:'
  '  - package-ecosystem: "npm"'
  '    directory: "/"'
  '    schedule:'
  '      interval: "weekly"'
  '    open-pull-requests-limit: 10'
  '    labels: ["deps"]'
  '    ignore:'
  '      - dependency-name: "nodemailer"'
  '        update-types: ["version-update:semver-major"]'
  '  - package-ecosystem: "github-actions"'
  '    directory: "/"'
  '    schedule:'
  '      interval: "weekly"'
  '    open-pull-requests-limit: 10'
  '    labels: ["deps"]'
)

$out2 = $out + @('')
Write-Utf8NoBomLines -File $cfg -Lines $out2
Write-Host ("Wrote: {0}" -f $cfg)
Write-Host '== git diff -- .github/dependabot.yml =='
git diff -- .github/dependabot.yml | Out-Host
Write-Host 'Done.'
