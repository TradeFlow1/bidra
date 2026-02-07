param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$CmdArgs
)

$ErrorActionPreference = "Stop"

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path (Join-Path $fixed "package.json")) { return $fixed }

  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p.Length -gt 3) {
    if (Test-Path (Join-Path $p "package.json")) { return $p }
    $p = Split-Path -Parent $p
  }

  throw "Could not find repo root (package.json)."
}

$root = Find-RepoRoot
Set-Location $root

if (!$CmdArgs -or $CmdArgs.Count -eq 0) {
  Write-Host "Usage:" -ForegroundColor Yellow
  Write-Host "  .\tools\bidra.ps1 lint"
  Write-Host "  .\tools\bidra.ps1 build"
  Write-Host "  .\tools\bidra.ps1 dev"
  Write-Host "  .\tools\bidra.ps1 npm run <script>"
  Write-Host "  .\tools\bidra.ps1 pnpm <args>"
  exit 0
}

switch ($CmdArgs[0]) {
  "lint"  { & npm run lint; exit $LASTEXITCODE }
  "build" { & npm run build; exit $LASTEXITCODE }
  "dev"   { & npm run dev; exit $LASTEXITCODE }
  default {
    $cmd = $CmdArgs[0]
    $rest = @()
    if ($CmdArgs.Count -gt 1) { $rest = $CmdArgs[1..($CmdArgs.Count-1)] }
    & $cmd @rest
    exit $LASTEXITCODE
  }
}