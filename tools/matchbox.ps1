param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("patch-lint","patch-lint-build","lint","build")]
  [string]$Mode,

  [string]$Goal = "Fix Next.js build failing due to UTF-8 BOM in package.json"
)

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

function Write-ProgressStep {
  param(
    [int]$Step,
    [int]$Total,
    [string]$Name
  )
  $pct = [int][Math]::Floor((($Step - 1) * 100.0) / $Total)
  Write-Host ""
  Write-Host ("[{0}/{1}] ({2}%) {3}" -f $Step, $Total, $pct, $Name) -ForegroundColor Cyan
}

function Invoke-Step {
  param(
    [int]$Step,
    [int]$Total,
    [string]$Name,
    [scriptblock]$Run
  )
  Write-ProgressStep -Step $Step -Total $Total -Name $Name
  & $Run
  if ($LASTEXITCODE -ne 0) { throw "$Name failed (exit $LASTEXITCODE)" }
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
# Patches that must exist when patch modes run
$patchLint = Join-Path $root "tools\patch-eslint-relax-v2d.ps1"
$patchBom  = Join-Path $root "tools\patch-packagejson-bom.ps1"

Write-Host ""
Write-Host ("MATCHBOX: {0}" -f $Goal) -ForegroundColor Yellow
Write-Host ("MODE: {0}" -f $Mode) -ForegroundColor Yellow

try {
  switch ($Mode) {
    "patch-lint" {
      $total = 2
      if (!(Test-Path $patchBom))  { throw "Missing patch script: $patchBom" }
      if (!(Test-Path $patchLint)) { throw "Missing patch script: $patchLint" }

      Invoke-Step 1 $total "Patch (package.json BOM + ESLint relax + V2 copy cleanup)" {
Invoke-Tool @("powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",$patchBom)
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Invoke-Tool @("powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",$patchLint)
      }

      Invoke-Step 2 $total "Lint (truth gate)" { & $bidra npm run lint }
      Write-Host ""
      Write-Host "OK: patch-lint passed. (100%)" -ForegroundColor Green
    }

    "patch-lint-build" {
      $total = 3
      if (!(Test-Path $patchBom))  { throw "Missing patch script: $patchBom" }
      if (!(Test-Path $patchLint)) { throw "Missing patch script: $patchLint" }

      Invoke-Step 1 $total "Patch (package.json BOM + ESLint relax + V2 copy cleanup)" {
Invoke-Tool @("powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",$patchBom)
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Invoke-Tool @("powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",$patchLint)
      }

      Invoke-Step 2 $total "Lint (truth gate)"  { & $bidra npm run lint }
      Invoke-Step 3 $total "Build (truth gate)" { & $bidra npm run build }

      Write-Host ""
      Write-Host "OK: patch-lint-build passed. (100%)" -ForegroundColor Green
    }

    "lint" {
      $total = 1
      Invoke-Step 1 $total "Lint (truth gate)" { & $bidra npm run lint }
      Write-Host ""
      Write-Host "OK: lint passed. (100%)" -ForegroundColor Green
    }

    "build" {
      $total = 1
      Invoke-Step 1 $total "Build (truth gate)" { & $bidra npm run build }
      Write-Host ""
      Write-Host "OK: build passed. (100%)" -ForegroundColor Green
    }
  }

  exit 0
}
catch {
  Write-Host ""
  Write-Host "FAIL:" -ForegroundColor Red
  Write-Host $_.Exception.ToString() -ForegroundColor Red
  exit 1
}