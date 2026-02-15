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

$fp = Join-Path $root "lib\require-adult.ts"
$txt = Read-AllTextUtf8NoBom $fp

# Guard: ensure this is the file we expect
if ($txt -notmatch 'export async function requireAdult') { throw "Refusing to patch: requireAdult export not found." }
if ($txt -notmatch [regex]::Escape('redirect("/auth/login")')) { throw "Refusing to patch: expected login redirect not found." }

# Rewrite the file content to make redirect conditional on *param not provided*, not falsy
$new = @(
  'import { redirect } from "next/navigation";'
  'import { auth } from "@/lib/auth";'
  ''
  'type AnySession = any;'
  'type AnyDbUser = any;'
  'export type RequireAdultResult = { ok: boolean; reason?: string; status?: number; session?: AnySession; dbUser?: AnyDbUser };'
  ''
  'export async function requireAdult(session?: AnySession): Promise<RequireAdultResult> {'
  '  // Key rule: redirect only when session param was NOT provided.'
  '  // API routes pass session (even null) and must never throw NEXT_REDIRECT.'
  '  const paramProvided = arguments.length > 0;'
  '  const s = paramProvided ? session : await auth();'
  '  const dbUser = (s as any)?.user;'
  ''
  '  if (!s?.user) {'
  '    if (!paramProvided) { redirect("/auth/login"); }'
  '    return { ok: false, reason: "Not authenticated", status: 401, session: s, dbUser: dbUser };'
  '  }'
  ''
  '  const age = (s as any).user?.age;'
  '  if (!age || age < 18) {'
  '    if (!paramProvided) { redirect("/account/restrictions"); }'
  '    return { ok: false, reason: "18+ restriction", status: 403, session: s, dbUser: dbUser };'
  '  }'
  ''
  '  return { ok: true, session: s, dbUser: dbUser };'
  '}'
) -join "`n"

Write-AllTextUtf8NoBom $fp ($new + "`n")
Write-Host ("Patched: " + $fp)
Write-Host "DONE: patch-fix-requireadult-null-session-no-redirect"
