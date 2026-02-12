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

# Guards: must contain marker + transaction + order.create
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

# Anchor: find the return JSON line that includes result.orderId
$anchorNeedle = "orderId: (result as any).orderId || null,"
$anchorIdx = -1
for ($i=0; $i -lt $catchIdx; $i++) {
  if ($lines[$i].IndexOf($anchorNeedle) -ge 0) { $anchorIdx = $i; break }
}
if ($anchorIdx -lt 0) { throw "Anchor line not found before catch; refusing." }

# Find the first standalone "}" after the anchor (this is the stray brace that starts the junk block)
$startRemove = -1
for ($i=$anchorIdx; $i -lt $catchIdx; $i++) {
  if ($lines[$i].Trim() -eq "}") { $startRemove = $i; break }
}
if ($startRemove -lt 0) { throw "Could not locate stray '}' after anchor; refusing." }

# Build new content: remove from startRemove up to catchIdx (exclusive)
$out = New-Object System.Collections.Generic.List[string]
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($i -ge $startRemove -and $i -lt $catchIdx) { continue }
  $out.Add($lines[$i])
}

# Fix indentation: the V2 marker line should be 4 spaces (not 8)
for ($i=0; $i -lt $out.Count; $i++) {
  if ($out[$i] -like "        // V2: acceptance converts to SOLD and MUST create an Order*") {
    $out[$i] = $out[$i].Replace("        // V2:", "    // V2:")
  }
}

# Post-guards
$outText = ($out -join "`r`n")
if ($outText.IndexOf('prisma.$transaction') -lt 0) { throw "Expected prisma.$transaction missing after cleanup; refusing." }
if ($outText.IndexOf("tx.order.create") -lt 0) { throw "Expected tx.order.create missing after cleanup; refusing." }

# Ensure the old non-transaction path is gone (OfferDecision via prisma. not tx.)
if ($outText -match "await\s+prisma\.offerDecision\.upsert") { throw "Found leftover prisma.offerDecision.upsert outside transaction; cleanup incomplete. Refusing." }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $outText, $enc)
Write-Host ("Patched: " + $file)
