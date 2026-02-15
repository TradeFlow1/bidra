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

function Import-DotEnv([string]$filePath) {
  if (-not (Test-Path -LiteralPath $filePath)) { return }
  $lines = [System.IO.File]::ReadAllLines((Resolve-Path -LiteralPath $filePath).Path)
  foreach ($raw in $lines) {
    $line = $raw
    if ($null -eq $line) { continue }
    $line = $line.Trim()
    if (-not $line) { continue }
    if ($line.StartsWith("#")) { continue }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { continue }
    $k = $line.Substring(0, $eq).Trim()
    $v = $line.Substring($eq + 1).Trim()
    if (-not $k) { continue }
    # strip surrounding quotes
    if ($v.Length -ge 2) {
      if (($v.StartsWith("`"") -and $v.EndsWith("`"")) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
        $v = $v.Substring(1, $v.Length - 2)
      }
    }
    Set-Item -Path ("Env:\" + $k) -Value $v
  }
}

$repo = Find-RepoRoot
Set-Location $repo
$root = (Get-Location).Path

# Load env for standalone runtime (Next standalone will not reliably load .env.local by itself)
Import-DotEnv (Join-Path $root ".env")
Import-DotEnv (Join-Path $root ".env.local")

Write-Host "=== Preflight: env keys ==="
Write-Host ("NODE_ENV=" + ($env:NODE_ENV))
Write-Host ("NEXTAUTH_URL=" + ($env:NEXTAUTH_URL))
Write-Host ("NEXT_PUBLIC_SITE_URL=" + ($env:NEXT_PUBLIC_SITE_URL))
Write-Host ("DATABASE_URL set: " + ([bool]$env:DATABASE_URL))

Write-Host "=== Preflight: DB listener (5432) ==="
$dbL = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($dbL) { Write-Host ("DB is listening on 5432 (PID " + $dbL.OwningProcess + ")") } else { Write-Host "No listener on 5432 (DB may be down or remote)." }

Write-Host "=== Preflight: logo file ==="
$logo = Join-Path $root "public\brand\bidra-kangaroo-logo.png"
if (-not (Test-Path -LiteralPath $logo)) {
  Write-Host ("MISSING: " + $logo)
} else {
  $fi = Get-Item -LiteralPath $logo
  Write-Host ("OK: " + $logo + " (" + $fi.Length + " bytes)")
  if ($fi.Length -lt 16) { Write-Host "WARNING: logo file is tiny; may be invalid/empty." }
}

Write-Host "=== Kill anything on 3000 (best-effort) ==="
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) { try { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop | Out-Null; Write-Host ("Stopped PID " + $listener.OwningProcess) } catch { } }

Write-Host "=== Start standalone prod server (blocks) ==="
$standalone = Join-Path $root ".next\standalone\server.js"
if (-not (Test-Path -LiteralPath $standalone)) { throw ("Missing " + $standalone + ". Run npm run build first.") }
node $standalone
