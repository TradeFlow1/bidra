param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path (Join-Path $fixed "package.json")) { return $fixed }

  $p = Split-Path -Parent $PSCommandPath
  while ($p -and $p.Length -gt 3) {
    if (Test-Path (Join-Path $p "package.json")) { return $p }
    $p = Split-Path -Parent $p
  }

  throw "Could not find repo root (package.json). Refusing to run."
}

$root = Find-RepoRoot
Set-Location $root

$bidra = Join-Path $root "tools\bidra.ps1"
function Invoke-Tool {
  param(
    [Parameter(Mandatory=$true)][string[]]$Args
  )

  # If the local wrapper exists, use it.
  if (Test-Path $bidra) {
    & $bidra @Args
    return
  }

  # Otherwise run the real tools directly (CI-safe).
  $exe = $Args[0]
  $rest = @()
  if ($Args.Length -gt 1) { $rest = $Args[1..($Args.Length-1)] }

  if ($exe -ieq "powershell") { & powershell.exe @rest; return }
  if ($exe -ieq "npm")       { & npm.cmd @rest;       return }

  & $exe @rest
}
$patch = Join-Path $root "tools\patch-eslint-relax-v2d.ps1"
if (!(Test-Path $patch)) { throw "Missing patch script at: $patch" }

try {
Invoke-Tool @("powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",$patch)
  if ($LASTEXITCODE -ne 0) { throw "Patch script failed (exit $LASTEXITCODE)" }
Invoke-Tool @("npm","run","lint")
  if ($LASTEXITCODE -ne 0) { throw "Lint failed (exit $LASTEXITCODE)" }

  Write-Host "OK: patch + lint passed." -ForegroundColor Green
  exit 0
}
catch {
  Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}