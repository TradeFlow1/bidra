#Requires -Version 5.1
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }

  $p = Split-Path -Parent $PSCommandPath
  while ($p -and -not (Test-Path -LiteralPath (Join-Path $p 'package.json'))) {
    $parent = Split-Path -Parent $p
    if ($parent -eq $p) { break }
    $p = $parent
  }
  if ($p -and (Test-Path -LiteralPath (Join-Path $p 'package.json'))) { return $p }
  throw 'Cannot locate repo root (package.json). Refusing to run.' 
}

$root = Find-RepoRoot
Set-Location $root

$fp = Join-Path $root 'lib\auth.ts'
if (-not (Test-Path -LiteralPath $fp)) { throw 'Missing file: ' + $fp }

$src = [System.IO.File]::ReadAllLines($fp)

$target = 'useSecureCookies: process.env.NODE_ENV === "production",'
$replacement = 'useSecureCookies: process.env.NODE_ENV === "production" && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i.test(String(process.env.NEXTAUTH_URL || "")),'

$idx = -1
for ($i = 0; $i -lt $src.Length; $i++) {
  if ($src[$i].Trim() -eq $target) { $idx = $i; break }
}
if ($idx -lt 0) {
  throw ('Did not find exact target line in lib/auth.ts: ' + $target)
}

$bak = $fp + '.bak.' + (Get-Date -Format 'yyyyMMdd-HHmmss')
[System.IO.File]::Copy($fp, $bak, $true)

$src[$idx] = ($src[$idx] -replace [Regex]::Escape($target), $replacement)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$out = ($src -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText($fp, $out, $utf8NoBom)

"Patched: {0}" -f $fp
"Backup:  {0}" -f $bak
