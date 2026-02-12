param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path -LiteralPath (Join-Path $fixed "package.json")) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($true) {
    if (Test-Path -LiteralPath (Join-Path $p "package.json")) { return $p }
    $parent = Split-Path -Parent $p
    if ($parent -eq $p -or [string]::IsNullOrWhiteSpace($parent)) { break }
    $p = $parent
  }
  return $null
}

$root = Find-RepoRoot
if (-not $root) { throw "Repo root not found. Refusing to run." }
Set-Location -LiteralPath $root
if (-not (Test-Path -LiteralPath (Join-Path $root "package.json"))) { throw "Not at repo root: $(Get-Location)" }

$file = Join-Path $root "app\api\listings\[id]\accept-highest-offer\route.ts"
if (-not (Test-Path -LiteralPath $file)) { throw "Missing file: $file" }

$src = Get-Content -LiteralPath $file -Raw

# Guards: make sure we are patching the intended V2 block
if ($src -notmatch "V2: acceptance converts to SOLD and MUST create an Order") { throw "V2 marker not found; refusing." }
if ($src -notmatch "await tx\.offerDecision\.upsert") { throw "tx.offerDecision.upsert not found; refusing." }

$old = "sellerId: me.id,"
$new = "sellerId: (me.id as string),"

$hits = ([regex]::Matches($src, [regex]::Escape($old))).Count
if ($hits -lt 1) { throw "Expected sellerId line not found; refusing." }

$src2 = $src.Replace($old, $new)
if ($src2 -eq $src) { throw "No changes detected; aborting." }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $src2, $enc)
Write-Host ("Patched: " + $file + " (sellerId non-null assertion)")
