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

# Guards: ensure we are patching the expected local-dev block
if ($txt -notmatch [regex]::Escape("const isDev = process.env.NODE_ENV !== ""production"";")) {
  throw "Refusing to patch: expected isDev line not found (middleware.ts changed, or already patched differently)."
}
if ($txt -notmatch [regex]::Escape("const allowHttpLocalDev = isDev && isLocalHost;")) {
  throw "Refusing to patch: expected allowHttpLocalDev line not found (middleware.ts changed)."
}
if ($txt -notmatch [regex]::Escape("if (proto === ""http"" && !allowHttpLocalDev) {")) {
  throw "Refusing to patch: expected HTTPS if condition not found (middleware.ts changed)."
}

# 1) Remove dev-only gate so localhost/loopback stays HTTP even under production standalone
$txt = [regex]::Replace($txt, [regex]::Escape("const isDev = process.env.NODE_ENV !== ""production"";"), "const isDev = process.env.NODE_ENV !== ""production""; // retained (unused) for clarity", 1)
$txt = [regex]::Replace($txt, [regex]::Escape("const allowHttpLocalDev = isDev && isLocalHost;"), "const allowHttpLocal = isLocalHost;", 1)
$txt = [regex]::Replace($txt, [regex]::Escape("if (proto === ""http"" && !allowHttpLocalDev) {"), "if (proto === ""http"" && !allowHttpLocal) {", 1)

# Sanity
if ($txt -notmatch [regex]::Escape("const allowHttpLocal = isLocalHost;")) { throw "Sanity failed: allowHttpLocal not present." }
if ($txt -match [regex]::Escape("allowHttpLocalDev")) { throw "Sanity failed: allowHttpLocalDev still present." }
if ($txt -notmatch [regex]::Escape("if (proto === ""http"" && !allowHttpLocal) {")) { throw "Sanity failed: HTTPS condition not updated." }

Write-AllTextUtf8NoBom $mwPath $txt
Write-Host "Patched: middleware.ts (allow HTTP for localhost/loopback even in production standalone)"
Write-Host "DONE: patch-fix-localhost-http-even-prod"
