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

function Patch-File {
  param([Parameter(Mandatory=$true)][string]$Path)

  if (!(Test-Path $Path)) { throw "Missing file: $Path" }
  $t = Get-Content $Path -Raw -Encoding utf8
  $t2 = $t

  # 1) Remove the hard throw on missing tools\bidra.ps1 (leave $bidra assignment in place)
  $t2 = [regex]::Replace(
    $t2,
    '(?m)^\s*if\s*\(\s*!\(Test-Path\s+\$bidra\)\s*\)\s*\{\s*throw\s*".*?tools\\bidra\.ps1.*?"\s*\}\s*\r?\n',
    ''
  )

  # 2) Ensure Invoke-Tool exists (insert right after: $bidra = Join-Path $root "tools\bidra.ps1")
  if ($t2 -notmatch '(?m)^\s*function\s+Invoke-Tool\b') {

    $insertLines = @(
      'function Invoke-Tool {'
      '  param('
      '    [Parameter(Mandatory=$true)][string[]]$Args'
      '  )'
      ''
      '  # If the local wrapper exists, use it.'
      '  if (Test-Path $bidra) {'
      '    & $bidra @Args'
      '    return'
      '  }'
      ''
      '  # Otherwise run the real tools directly (CI-safe).'
      '  $exe = $Args[0]'
      '  $rest = @()'
      '  if ($Args.Length -gt 1) { $rest = $Args[1..($Args.Length-1)] }'
      ''
      '  if ($exe -ieq "powershell") { & powershell.exe @rest; return }'
      '  if ($exe -ieq "npm")       { & npm.cmd @rest;       return }'
      ''
      '  & $exe @rest'
      '}'
      ''
    )
    $insert = ($insertLines -join "`r`n")

    $pattern = '(?m)^\s*\$bidra\s*=\s*Join-Path\s+\$root\s+"tools\\bidra\.ps1"\s*\r?\n'
    $m = [regex]::Match($t2, $pattern)
    if (-not $m.Success) {
      throw "Could not find the `$bidra = Join-Path $root `"tools\bidra.ps1`" line in $Path. Refusing to guess."
    }

    $t2 = $t2.Substring(0, $m.Index + $m.Length) + $insert + $t2.Substring($m.Index + $m.Length)
  }

  # 3) Rewrite known invocations to go via Invoke-Tool
  $t2 = [regex]::Replace($t2, '(?m)^\s*&\s*\$bidra\s+npm\s+run\s+lint\s*$',  'Invoke-Tool @("npm","run","lint")')
  $t2 = [regex]::Replace($t2, '(?m)^\s*&\s*\$bidra\s+npm\s+run\s+build\s*$', 'Invoke-Tool @("npm","run","build")')

  # Replace: & $bidra powershell -NoProfile -ExecutionPolicy Bypass -File <something>
  $t2 = [regex]::Replace(
    $t2,
    '(?m)^\s*&\s*\$bidra\s+powershell\s+-NoProfile\s+-ExecutionPolicy\s+Bypass\s+-File\s+(.+?)\s*$',
    'Invoke-Tool @("powershell","-NoProfile","-ExecutionPolicy","Bypass","-File",$1)'
  )

  if ($t2 -eq $t) {
    Write-Host "OK: no changes needed in $([IO.Path]::GetFileName($Path))" -ForegroundColor Green
    return
  }

  Set-Content -Path $Path -Value $t2 -NoNewline -Encoding utf8
  Write-Host "OK: patched $([IO.Path]::GetFileName($Path))" -ForegroundColor Green
}

$root = Find-RepoRoot
Set-Location $root

Patch-File -Path (Join-Path $root "tools\matchbox.ps1")
Patch-File -Path (Join-Path $root "tools\lint-ps51.ps1")

Write-Host "Done." -ForegroundColor Green