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
  $bak = "$File.bak_v2_64_add_codeowners_pr_template"
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

$ghDir = Join-Path $repoRoot '.github'
Ensure-Dir -Dir $ghDir

# CODEOWNERS: require review from the repo owner account
$codeowners = Join-Path $ghDir 'CODEOWNERS'
Backup-File -File $codeowners
$co = @(
  '# Default owners for everything in the repo'
  '* @TradeFlow1'
  ''
  '# Critical areas (explicit for clarity)'
  '/.github/ @TradeFlow1'
  '/tools/ @TradeFlow1'
  '/prisma/ @TradeFlow1'
  '/app/ @TradeFlow1'
  '/lib/ @TradeFlow1'
  '/components/ @TradeFlow1'
)
$co2 = $co + @('')
Write-Utf8NoBomLines -File $codeowners -Lines $co2
Write-Host ("Wrote: {0}" -f $codeowners)

# PR template: enforce pre-merge checks + keep launch discipline
$prTpl = Join-Path $ghDir 'pull_request_template.md'
Backup-File -File $prTpl
$pt = @(
  '## Summary'
  '- '
  ''
  '## Checks (must be green before merge)'
  '- [ ] CI is green (GitHub Actions)'
  '- [ ] Local: npm run build'
  '- [ ] Local: npm run lint'
  ''
  '## Risk'
  '- [ ] Low'
  '- [ ] Medium'
  '- [ ] High'
  ''
  '## Notes'
  '- Pre-launch checks must be completed before launch.'
)
$pt2 = $pt + @('')
Write-Utf8NoBomLines -File $prTpl -Lines $pt2
Write-Host ("Wrote: {0}" -f $prTpl)

Write-Host '== git diff -- .github/CODEOWNERS =='
git diff -- .github/CODEOWNERS | Out-Host
Write-Host '== git diff -- .github/pull_request_template.md =='
git diff -- .github/pull_request_template.md | Out-Host

Write-Host 'Done.'
