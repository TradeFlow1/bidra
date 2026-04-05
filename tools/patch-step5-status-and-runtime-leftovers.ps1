#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

# 1) Fix contradictory seller status allowlist
$dashboardPath = Join-Path $repoRoot 'app\dashboard\listings\page.tsx'
$dashboard = Get-Content -LiteralPath $dashboardPath -Raw
$dashboard = $dashboard.Replace(
'const allowed: Record<string, boolean> = { ACTIVE: true, SUSPENDED: true, DELETED: true };',
'const allowed: Record<string, boolean> = { DRAFT: true, ACTIVE: true, ENDED: true };'
)
[System.IO.File]::WriteAllText($dashboardPath, $dashboard, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $dashboardPath"

# 2) Neutralize Stripe webhook harder for V2
$stripePath = Join-Path $repoRoot 'app\api\stripe\webhook\route.ts'
$stripeLines = @(
'import { NextResponse } from "next/server";',
'',
'export const runtime = "nodejs";',
'export const dynamic = "force-dynamic";',
'',
'export async function POST() {',
'  return NextResponse.json(',
'    { ok: false, error: "In-app payments are not part of Bidra V2." },',
'    { status: 410 }',
'  );',
'}'
)
[System.IO.File]::WriteAllLines($stripePath, $stripeLines, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $stripePath"

# 3) Neutralize watchlist status API
$watchStatusPath = Join-Path $repoRoot 'app\api\watchlist\status\route.ts'
$watchStatusLines = @(
'import { NextResponse } from "next/server";',
'',
'export const dynamic = "force-dynamic";',
'',
'export async function GET() {',
'  return NextResponse.json({ watched: false, disabled: true }, { status: 410 });',
'}'
)
[System.IO.File]::WriteAllLines($watchStatusPath, $watchStatusLines, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $watchStatusPath"

# 4) Neutralize watchlist toggle API
$watchTogglePath = Join-Path $repoRoot 'app\api\watchlist\toggle\route.ts'
$watchToggleLines = @(
'import { NextResponse } from "next/server";',
'',
'export async function POST() {',
'  return NextResponse.json({ error: "Watchlist is not part of this Bidra launch." }, { status: 410 });',
'}'
)
[System.IO.File]::WriteAllLines($watchTogglePath, $watchToggleLines, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $watchTogglePath"
