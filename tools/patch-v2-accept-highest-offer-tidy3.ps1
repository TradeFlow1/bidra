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

$lines = Get-Content -LiteralPath $file
$textNow = ($lines -join "`r`n")

# Guards: must contain the V2 marker + transaction + tx.order.create
$marker = "V2: acceptance converts to SOLD and MUST create an Order"
if ($textNow.IndexOf($marker) -lt 0) { throw "Expected V2 marker not found. Refusing." }
if ($textNow.IndexOf('prisma.$transaction') -lt 0) { throw "Expected prisma.$transaction not present in TS file. Refusing." }
if ($textNow.IndexOf("tx.order.create") -lt 0) { throw "Expected tx.order.create not present in TS file. Refusing." }

# Find catch index
$catchIdx = -1
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "^\s*\}\s*catch\s*\(e\)\s*\{") { $catchIdx = $i; break }
}
if ($catchIdx -lt 0) { throw "catch block not found; refusing." }

# Find the try-closing brace immediately before catch (skip blank lines)
$closeTryIdx = -1
for ($i=$catchIdx-1; $i -ge 0; $i--) {
  if ($lines[$i].Trim() -eq "") { continue }
  if ($lines[$i].Trim() -eq "}") { $closeTryIdx = $i; break }
  throw ("Expected try-closing '}' immediately before catch; found: " + $lines[$i])
}
if ($closeTryIdx -lt 0) { throw "Could not locate try-closing brace before catch; refusing." }

# Remove everything between closeTryIdx and catchIdx (exclusive)
$out = New-Object System.Collections.Generic.List[string]
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($i -gt $closeTryIdx -and $i -lt $catchIdx) { continue }
  $out.Add($lines[$i])
}

# Fix indentation: the V2 marker line should be aligned (4 spaces, not 8)
for ($i=0; $i -lt $out.Count; $i++) {
  if ($out[$i] -like "        // V2: acceptance converts to SOLD and MUST create an Order*") {
    $out[$i] = $out[$i].Replace("        // V2:", "    // V2:")
  }
}

# Post-guards: still have transaction + order.create, and only one return block (cheap sanity)
$outText = ($out -join "`r`n")
if ($outText.IndexOf('prisma.$transaction') -lt 0) { throw "Expected prisma.$transaction missing after cleanup; refusing." }
if ($outText.IndexOf("tx.order.create") -lt 0) { throw "Expected tx.order.create missing after cleanup; refusing." }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $outText, $enc)
Write-Host ("Patched: " + $file)
