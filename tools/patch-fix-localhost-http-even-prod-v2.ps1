param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

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

$repo = Find-RepoRoot
Set-Location $repo
$root = (Get-Location).Path

$mwPath = Join-Path $root "middleware.ts"
$txt = Read-AllTextUtf8NoBom $mwPath

# Guards: expected v1 prod-localhost patch exists
if ($txt -notmatch [regex]::Escape("const allowHttpLocal = isLocalHost;")) {
  throw "Refusing to patch: expected allowHttpLocal line not found (middleware.ts not in expected state)."
}
$oldIsLocal = "const isLocalHost = host.startsWith(""localhost"") || host.startsWith(""127.0.0.1"") || host.startsWith(""[::1]"") || host.startsWith(""::1"");"
if ($txt -notmatch [regex]::Escape($oldIsLocal)) {
  throw "Refusing to patch: expected isLocalHost line not found (middleware.ts changed)."
}

# Replace isLocalHost to also consider req.nextUrl host/hostname (standalone sometimes normalizes to localhost)
$newBlock = @(
  "const reqHost = String((url as any).host ?? """").toLowerCase();",
  "const reqHostname = String((url as any).hostname ?? """").toLowerCase();",
  "const isLocalHost = host.startsWith(""localhost"") || host.startsWith(""127.0.0.1"") || host.startsWith(""[::1]"") || host.startsWith(""::1"") || reqHost.startsWith(""localhost"") || reqHost.startsWith(""127.0.0.1"") || reqHostname === ""localhost"" || reqHostname === ""127.0.0.1"" || reqHostname === ""::1"";"
) -join "`n"

$txt2 = [regex]::Replace($txt, [regex]::Escape($oldIsLocal), [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $newBlock }, 1)
if ($txt2 -eq $txt) { throw "Patch failed: replacement produced no change." }
$txt = $txt2

# Sanity
if ($txt -match [regex]::Escape($oldIsLocal)) { throw "Sanity failed: old isLocalHost line still present." }
if ($txt -notmatch [regex]::Escape("const reqHostname = String((url as any).hostname ?? """").toLowerCase();")) { throw "Sanity failed: reqHostname line missing." }
if ($txt -notmatch [regex]::Escape("const allowHttpLocal = isLocalHost;")) { throw "Sanity failed: allowHttpLocal line missing." }

Write-AllTextUtf8NoBom $mwPath $txt
Write-Host "Patched: middleware.ts (local HTTP allowlist now includes req.nextUrl host/hostname)"
Write-Host "DONE: patch-fix-localhost-http-even-prod-v2"
