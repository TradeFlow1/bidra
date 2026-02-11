#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $MyInvocation.MyCommand.Path
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

function Write-Utf8NoBomLines {
  param([string]$File,[string[]]$Lines)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $full = [System.IO.Path]::GetFullPath($File)
  [System.IO.File]::WriteAllLines($full, $Lines, $utf8NoBom)
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

$target = Join-Path $repoRoot 'lib\require-adult.ts'
if (-not (Test-Path -LiteralPath $target)) { throw ("Missing: {0}" -f $target) }

$out = @(
  'import { redirect } from "next/navigation";'
  'import { auth } from "@/lib/auth";'
  ''
  'type AnySession = any;'
  'type AnyDbUser = any;'
  'export type RequireAdultResult = { ok: boolean; reason?: string; status?: number; session?: AnySession; dbUser?: AnyDbUser };'
  ''
  'export async function requireAdult(session?: AnySession): Promise<RequireAdultResult> {'
  '  const s = session || (await auth());'
  '  const dbUser = (s as any)?.user;'
  ''
  '  if (!s?.user) {'
  '    if (!session) { redirect("/auth/login"); }'
  '    return { ok: false, reason: "Not authenticated", status: 401, session: s, dbUser: dbUser };'
  '  }'
  ''
  '  const age = (s as any).user?.age;'
  '  if (!age || age < 18) {'
  '    if (!session) { redirect("/account/restrictions"); }'
  '    return { ok: false, reason: "18+ restriction", status: 403, session: s, dbUser: dbUser };'
  '  }'
  ''
  '  return { ok: true, session: s, dbUser: dbUser };'
  '}'
)

$out2 = $out + @('')
Write-Utf8NoBomLines -File $target -Lines $out2
Write-Host ("Rewrote: {0}" -f $target)
Write-Host '== git diff -- lib/require-adult.ts =='
git diff -- .\lib\require-adult.ts | Out-Host
Write-Host 'Done.'
