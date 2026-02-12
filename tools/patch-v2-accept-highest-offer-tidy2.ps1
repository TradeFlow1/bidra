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

# Guard: must have our injected V2 marker and a prisma.$transaction in TS
$marker = "V2: acceptance converts to SOLD and MUST create an Order"
$hasMarker = $false
for ($i=0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like ("*" + $marker + "*")) { $hasMarker = $true; break } }
if (-not $hasMarker) { throw "Expected V2 marker not found. Refusing." }

$textNow = ($lines -join "`r`n")
if ($textNow.IndexOf('prisma.$transaction') -lt 0) { throw "Expected prisma.$transaction not present in TS file. Refusing." }

# Find catch index
$catchIdx = -1
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "^\s*\}\s*catch\s*\(e\)\s*\{") { $catchIdx = $i; break }
}
if ($catchIdx -lt 0) { throw "catch block not found; refusing." }

# Find startRemove: a standalone "}" whose next non-empty line is the OfferDecision comment
$startRemove = -1
$offerComment = "Record seller acceptance via OfferDecision"
for ($i=0; $i -lt $catchIdx; $i++) {
  if ($lines[$i].Trim() -ne "}") { continue }
  $j = $i + 1
  while ($j -lt $catchIdx -and $lines[$j].Trim() -eq "") { $j++ }
  if ($j -lt $catchIdx) {
    if ($lines[$j] -like ("*// " + $offerComment + "*")) { $startRemove = $i; break }
  }
}
if ($startRemove -lt 0) { throw "Could not locate stray brace + duplicate block anchor. Refusing." }

if ($startRemove -ge $catchIdx) { throw "Computed removal range invalid. Refusing." }

# Build new content (remove from startRemove up to catchIdx)
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

# Safety: ensure we have exactly one OfferDecision comment left
$countOffer = 0
for ($i=0; $i -lt $out.Count; $i++) {
  if ($out[$i] -like ("*// " + $offerComment + "*")) { $countOffer++ }
}
if ($countOffer -ne 1) { throw "Expected exactly one OfferDecision block after cleanup; found $countOffer. Refusing." }

$outText = ($out -join "`r`n")
if ($outText.IndexOf("tx.order.create") -lt 0) { throw "Expected tx.order.create not present after patch. Refusing." }
if ($outText.IndexOf('prisma.$transaction') -lt 0) { throw "Expected prisma.$transaction not present after patch. Refusing." }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $outText, $enc)
Write-Host ("Patched: " + $file)
