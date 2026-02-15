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

$files = @(
  (Join-Path $root "app\api\listings\route.ts"),
  (Join-Path $root "app\api\orders\route.ts")
)

foreach ($fp in $files) {
  if (-not (Test-Path -LiteralPath $fp)) { throw "Missing target: $fp" }
  $txt = Read-AllTextUtf8NoBom $fp

  # 1) Ensure auth import exists
  $needAuth = "import { auth } from `"@/lib/auth`";"
  if ($txt -notmatch [regex]::Escape($needAuth)) {
    $needle = "import { requireAdult } from `"@/lib/require-adult`";"
    if ($txt -notmatch [regex]::Escape($needle)) { throw "Refusing to patch: requireAdult import not found in $fp" }
    $insert = ($needle + "`n" + $needAuth)
    $txt2 = [regex]::Replace($txt, [regex]::Escape($needle), $insert, 1)
    if ($txt2 -eq $txt) { throw "Insert failed in $fp (auth import)." }
    $txt = $txt2
  }

  # 2) Replace requireAdult() calls inside API routes with session-based call to prevent NEXT_REDIRECT
  if ($fp.ToLowerInvariant().EndsWith("app\api\listings\route.ts")) {
    $old = "      const gate = await requireAdult();"
    $new = @(
      "      const session = await auth();",
      "      const gate = await requireAdult(session);"
    ) -join "`n"
    if ($txt -match [regex]::Escape($old)) {
      $txt = [regex]::Replace($txt, [regex]::Escape($old), $new, 1)
    } else {
      # If already patched, accept it
      if ($txt -notmatch [regex]::Escape("const gate = await requireAdult(session);")) {
        throw "Refusing to patch: expected requireAdult() call not found (listings route changed): $fp"
      }
    }
  }

  if ($fp.ToLowerInvariant().EndsWith("app\api\orders\route.ts")) {
    $old = "    const gate = await requireAdult();"
    $new = @(
      "    const session = await auth();",
      "    const gate = await requireAdult(session);"
    ) -join "`n"
    if ($txt -match [regex]::Escape($old)) {
      $txt = [regex]::Replace($txt, [regex]::Escape($old), $new, 1)
    } else {
      if ($txt -notmatch [regex]::Escape("const gate = await requireAdult(session);")) {
        throw "Refusing to patch: expected requireAdult() call not found (orders route changed): $fp"
      }
    }
  }

  # Sanity: ensure no bare requireAdult() remains in these two files
  if ($txt -match "requireAdult\(\)\s*;") { throw "Sanity failed: bare requireAdult() still present in $fp" }

  Write-AllTextUtf8NoBom $fp $txt
  Write-Host ("Patched: " + $fp)
}

Write-Host "DONE: patch-fix-api-requireadult-no-redirect"
