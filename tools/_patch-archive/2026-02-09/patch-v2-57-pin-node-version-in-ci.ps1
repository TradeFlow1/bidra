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
  $bak = "$File.bak_v2_57_pin_node_version_in_ci"
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

function Get-PinnedNodeVersion {
  param([string]$RepoRoot)

  # 1) package.json engines.node
  $pkg = Join-Path $RepoRoot 'package.json'
  if (Test-Path -LiteralPath $pkg) {
    try {
      $json = Get-Content -LiteralPath $pkg -Raw -Encoding UTF8 | ConvertFrom-Json
      if ($json -and $json.engines -and $json.engines.node) {
        $v = [string]$json.engines.node
        $v = $v.Trim()
        if ($v) { return $v }
      }
    } catch { }
  }

  # 2) .nvmrc
  $nvm = Join-Path $RepoRoot '.nvmrc'
  if (Test-Path -LiteralPath $nvm) {
    $v = (Get-Content -LiteralPath $nvm -Raw -Encoding UTF8).Trim()
    if ($v) { return $v }
  }

  # 3) .node-version
  $nv = Join-Path $RepoRoot '.node-version'
  if (Test-Path -LiteralPath $nv) {
    $v = (Get-Content -LiteralPath $nv -Raw -Encoding UTF8).Trim()
    if ($v) { return $v }
  }

  # Fallback: stable Node 20 line (pin exact to avoid drift)
  return '20.11.1'
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

$wf = Join-Path $repoRoot '.github\workflows\ci.yml'
if (-not (Test-Path -LiteralPath $wf)) { throw "Missing workflow: $wf" }
Backup-File -File $wf

$nodeVersion = Get-PinnedNodeVersion -RepoRoot $repoRoot

# Rewrite workflow with pinned node version
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
  '          node-version: "' + $nodeVersion + '"'
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

# trailing newline
$yaml2 = $yaml + @('')
Write-Utf8NoBomLines -File $wf -Lines $yaml2
Write-Host ("Pinned CI Node version to: {0}" -f $nodeVersion)
Write-Host ("Wrote: {0}" -f $wf)

Write-Host '== git diff -- .github/workflows/ci.yml =='
git diff -- .github/workflows/ci.yml | Out-Host

Write-Host 'Done.'
