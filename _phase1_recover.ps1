$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
if (!(Test-Path -LiteralPath ".\package.json") -or !(Test-Path -LiteralPath ".\.git")) { throw "Refusing to run: not repo root." }

$globalsPath = ".\app\globals.css"
$globals = Get-Content -LiteralPath $globalsPath -Raw
$needle = '@import "../styles/bidra-theme.css";'
$insert = '@import "../styles/bidra-theme.css";' + [Environment]::NewLine + '@import "../styles/premium-purple.css";'
if ($globals -notmatch "premium-purple.css") {
  $globals = $globals.Replace($needle, $insert)
  Set-Content -LiteralPath $globalsPath -Value $globals -Encoding UTF8
}

if (Test-Path -LiteralPath ".\.next") {
  Remove-Item -LiteralPath ".\.next" -Recurse -Force
}

Write-Host "Recovered Phase 1 patch and removed .next."
