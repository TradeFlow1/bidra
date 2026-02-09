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
  $bak = "$File.bak_v2_58_pin_node_exact_nvmrc_and_ci"
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

function Set-NodePinIfMissing {
  param([string]$RepoRoot,[string]$Pinned)
  $nvmrc = Join-Path $RepoRoot '.nvmrc'
  if (Test-Path -LiteralPath $nvmrc) {
    $existing = (Get-Content -LiteralPath $nvmrc -Raw -Encoding UTF8).Trim()
    if ($existing) { return $existing }
  }
  $lines = @($Pinned, '') # trailing newline
  Write-Utf8NoBomLines -File $nvmrc -Lines $lines
  return $Pinned
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

# Choose a stable exact Node 20 version (avoid drift from 20.x)
$pin = '20.11.1'
$pinUsed = Set-NodePinIfMissing -RepoRoot $repoRoot -Pinned $pin
Write-Host ("Node pin (from .nvmrc): {0}" -f $pinUsed)

$wf = Join-Path $repoRoot '.github\workflows\ci.yml'
if (-not (Test-Path -LiteralPath $wf)) { throw "Missing workflow: $wf" }
Backup-File -File $wf

# Rewrite CI workflow with pinned node version
$yaml = @(
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
  '          node-version: "' + $pinUsed + '"'
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

$yaml2 = $yaml + @('')
Write-Utf8NoBomLines -File $wf -Lines $yaml2
Write-Host ("Wrote: {0}" -f $wf)

Write-Host '== git diff -- .nvmrc =='
git diff -- .nvmrc | Out-Host
Write-Host '== git diff -- .github/workflows/ci.yml =='
git diff -- .github/workflows/ci.yml | Out-Host

Write-Host 'Done.'
