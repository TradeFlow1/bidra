param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path -LiteralPath (Join-Path $fixed "package.json")) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($true) {
    if ([string]::IsNullOrWhiteSpace($p)) { break }
    if (Test-Path -LiteralPath (Join-Path $p "package.json")) { return $p }
    $parent = Split-Path -Parent $p
    if ($parent -eq $p) { break }
    $p = $parent
  }
  throw "Not at repo root. Expected package.json at repo root."
}

function Read-AllTextUtf8NoBom([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { throw "Missing file: $p" }
  [System.IO.File]::ReadAllText($p, (New-Object System.Text.UTF8Encoding($false)))
}
function Write-AllTextUtf8NoBom([string]$p, [string]$t) {
  [System.IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($false)))
}
function Write-AllLinesUtf8NoBom([string]$p, [string[]]$lines) {
  [System.IO.File]::WriteAllLines($p, $lines, (New-Object System.Text.UTF8Encoding($false)))
}

$repo = Find-RepoRoot
Set-Location $repo
$repoPath = (Get-Location).Path

# 1) Write prisma\seed.cjs (plain Node/CommonJS; no TS loader)
$seedCjsPath = Join-Path $repoPath "prisma\seed.cjs"
$seedLines = @()
$seedLines += 'const { PrismaClient } = require("@prisma/client");'
$seedLines += ''
$seedLines += 'const prisma = new PrismaClient();'
$seedLines += ''
$seedLines += 'async function main() {'
$seedLines += '  // Keep seed minimal and safe (no assumptions).'
$seedLines += '  console.log("Seed: OK (no actions)");'
$seedLines += '}'
$seedLines += ''
$seedLines += 'main()'
$seedLines += '  .then(async () => {'
$seedLines += '    await prisma.$disconnect();'
$seedLines += '  })'
$seedLines += '  .catch(async (e) => {'
$seedLines += '    console.error(e);'
$seedLines += '    await prisma.$disconnect();'
$seedLines += '    process.exit(1);'
$seedLines += '  });'

Write-AllLinesUtf8NoBom $seedCjsPath $seedLines
Write-Host ("Wrote: " + $seedCjsPath)

# 2) Update package.json prisma.seed to node prisma/seed.cjs
$pkgPath = Join-Path $repoPath "package.json"
$txt = Read-AllTextUtf8NoBom $pkgPath

# Accept either of the recent broken seeds and replace to CJS
$old1 = '"seed"\s*:\s*"ts-node\s+prisma/seed\.ts"'
$old2 = '"seed"\s*:\s*"node\s+\-r\s+ts-node/register/transpile-only\s+prisma/seed\.ts"'
$old3 = '"seed"\s*:\s*"node\s+--loader\s+ts-node/esm\s+prisma/seed\.ts"'
$new  = '"seed": "node prisma/seed.cjs"'

$txt2 = $txt
$replaced = $false
if ([regex]::IsMatch($txt2, $old1)) { $txt2 = [regex]::Replace($txt2, $old1, $new, 1); $replaced = $true }
elseif ([regex]::IsMatch($txt2, $old2)) { $txt2 = [regex]::Replace($txt2, $old2, $new, 1); $replaced = $true }
elseif ([regex]::IsMatch($txt2, $old3)) { $txt2 = [regex]::Replace($txt2, $old3, $new, 1); $replaced = $true }

if (-not $replaced) {
  throw "Refusing to patch: could not find an expected prisma.seed value to replace."
}
if ($txt2 -notmatch [regex]::Escape($new)) { throw "Sanity failed: replacement not present after rewrite." }

Write-AllTextUtf8NoBom $pkgPath $txt2
Write-Host "Patched: package.json prisma.seed -> node prisma/seed.cjs"
Write-Host "DONE: patch-fix-prisma-seed-to-cjs"
