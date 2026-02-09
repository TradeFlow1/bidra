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
  $bak = "$File.bak_v2_54_add_github_actions_ci"
  if (Test-Path -LiteralPath $File) {
    if (-not (Test-Path -LiteralPath $bak)) { Copy-Item -LiteralPath $File -Destination $bak }
  }
}

function Ensure-Dir {
  param([string]$Dir)
  if (-not (Test-Path -LiteralPath $Dir)) { New-Item -ItemType Directory -Path $Dir | Out-Null }
}

function Write-Utf8NoBomLines {
  param([string]$File,[string[]]$Lines)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $full = [System.IO.Path]::GetFullPath($File)
  [System.IO.File]::WriteAllLines($full, $Lines, $utf8NoBom)
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$wfDir = '.\.github\workflows'
Ensure-Dir -Dir '.\.github'
Ensure-Dir -Dir $wfDir

$wf = Join-Path $wfDir 'ci.yml'
Backup-File -File $wf

# Keep this workflow minimal + deterministic: npm ci -> build -> lint
$out = @(
  'name: CI'
  'on:'
  '  push:'
  '    branches: [ "main" ]'
  '  pull_request:'
  '    branches: [ "main" ]'
  '  workflow_dispatch: {}'
  ''
  'jobs:'
  '  build:'
  '    runs-on: ubuntu-latest'
  '    steps:'
  '      - name: Checkout'
  '        uses: actions/checkout@v4'
  ''
  '      - name: Setup Node'
  '        uses: actions/setup-node@v4'
  '        with:'
  '          node-version: "20.x"'
  '          cache: "npm"'
  ''
  '      - name: Install'
  '        run: npm ci'
  ''
  '      - name: Prisma generate'
  '        run: npm run prisma:generate'
  ''
  '      - name: Build'
  '        run: npm run build'
  ''
  '      - name: Lint'
  '        run: npm run lint'
)

# Ensure trailing newline by appending a final empty line
$out2 = $out + @('')
Write-Utf8NoBomLines -File $wf -Lines $out2
Write-Host ("Wrote: {0}" -f $wf)

Write-Host 'Done.'

