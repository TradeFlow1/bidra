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

# Guard: ensure expected block exists
if ($txt -notmatch [regex]::Escape("const proto = String(req.headers.get(""x-forwarded-proto"") ?? url.protocol.replace("":"", """")).toLowerCase();")) {
  throw "Refusing to patch: expected proto line not found (middleware.ts changed)."
}
if ($txt -notmatch [regex]::Escape("const host = String(req.headers.get(""x-forwarded-host"") ?? req.headers.get(""host"") ?? """").toLowerCase();")) {
  throw "Refusing to patch: expected host line not found (middleware.ts changed)."
}
if ($txt -notmatch [regex]::Escape("const canonical = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || """").replace(/\/$/, """");")) {
  throw "Refusing to patch: expected canonical line not found (middleware.ts changed)."
}
if ($txt -notmatch [regex]::Escape("// 0) Force HTTPS (prefer canonical to avoid double redirects)")) {
  throw "Refusing to patch: expected Force HTTPS comment not found (middleware.ts changed)."
}

# 1) Insert local-dev allowlist right after canonical definition (only if not already present)
$insertAfter = "const canonical = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || """").replace(/\/$/, """");"
$marker = "const allowHttpLocalDev"
if ($txt -notmatch [regex]::Escape($marker)) {
  $insertion = @(
    $insertAfter
    ""
    "  // Local dev: allow plain HTTP on localhost/loopback (avoid https://localhost redirects)"
    "  const isDev = process.env.NODE_ENV !== ""production"";"
    "  const isLocalHost = host.startsWith(""localhost"") || host.startsWith(""127.0.0.1"") || host.startsWith(""[::1]"") || host.startsWith(""::1"");"
    "  const allowHttpLocalDev = isDev && isLocalHost;"
  ) -join "`n"

  $needle = [regex]::Escape($insertAfter)
  $txt2 = [regex]::Replace($txt, $needle, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $insertion }, 1)
  if ($txt2 -eq $txt) { throw "Insert failed: canonical line replacement produced no change." }
  $txt = $txt2
}

# 2) Change HTTPS forcing condition: if (proto === "http") -> if (proto === "http" && !allowHttpLocalDev)
$oldIf = "if (proto === ""http"") {"
$newIf = "if (proto === ""http"" && !allowHttpLocalDev) {"
if ($txt -notmatch [regex]::Escape($oldIf)) {
  if ($txt -match [regex]::Escape($newIf)) {
    Write-Host "Already patched: HTTPS force condition already includes !allowHttpLocalDev"
  } else {
    throw "Refusing to patch: expected if (proto === ""http"") block not found (middleware.ts changed)."
  }
} else {
  $txt = [regex]::Replace($txt, [regex]::Escape($oldIf), $newIf, 1)
}

# Sanity
if ($txt -notmatch [regex]::Escape($newIf)) { throw "Sanity failed: new HTTPS condition not present." }
if ($txt -notmatch [regex]::Escape($marker)) { throw "Sanity failed: allowHttpLocalDev not present." }

Write-AllTextUtf8NoBom $mwPath $txt
Write-Host "Patched: middleware.ts (allow HTTP on localhost in dev; keep HTTPS enforcement elsewhere)"
Write-Host "DONE: patch-fix-local-dev-no-https-redirect"
