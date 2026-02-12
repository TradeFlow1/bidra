param()

#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Find-RepoRoot {
  $fixed = "C:\dev\bidra-main"
  if (Test-Path -LiteralPath (Join-Path $fixed "package.json")) { return $fixed }
  $p = Split-Path -Parent $PSCommandPath
  while ($true) {
    if (Test-Path purely -LiteralPath (Join-Path $p "package.json")) { return $p }
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

# Guards
$marker = "V2: acceptance converts to SOLD and MUST create an Order"
$markerHits = @()
for ($i=0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like ("*" + $marker + "*")) { $markerHits += $i } }
if ($markerHits.Count -lt 1) { throw "Expected marker not found. Refusing." }

$dupNeedle = "    // Record seller acceptance via OfferDecision (OfferDecision requires amount)"
$dupIdx = @()
for ($i=0; $i -lt $lines.Count; $i++) { if ($lines[$i] -eq $dupNeedle) { $dupIdx += $i } }
if ($dupIdx.Count -lt 2) { throw "Expected duplicate OfferDecision comment not found twice; refusing." }

$catchIdx = -1
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "^\s*\}\s*catch\s*\(e\)\s*\{") { $catchIdx = $i; break }
}
if ($catchIdx -lt 0) { throw "catch block not found; refusing." }

# Determine removal range: start at stray } immediately before the 2nd duplicate block (or at the duplicate itself)
$secondDup = $dupIdx[1]
$startRemove = $secondDup
$j = $secondDup - 1
while ($j -ge 0 -and $lines[$j].Trim() -eq "") { $j-- }
if ($j -ge 0 -and $lines[$j].Trim() -eq "}") { $startRemove = $j }

if ($startRemove -ge $catchIdx) { throw "Computed removal range is invalid (start >= catch). Refusing." }

# Build new content
$out = New-Object System.Collections.Generic.List[string]
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($i -ge $startRemove -and $i -lt $catchIdx) { continue }
  $out.Add($lines[$i])
}

# Fix indentation: the V2 marker line should align with surrounding code
for ($i=0; $i -lt $out.Count; $i++) {
  if ($out[$i] -like "        // V2: acceptance converts to SOLD and MUST create an Order*") {
    $out[$i] = $out[$i].Replace("        // V2:", "    // V2:")
  }
}

# Safety: ensure we still have exactly one duplicate needle and we still have transaction + order.create
$needleCount = 0
for ($i=0; $i -lt $out.Count; $i++) { if ($out[$i] -eq $dupNeedle) { $needleCount++ } }
if ($needleCount -ne 1) { throw "Expected exactly one OfferDecision block after patch, found $needleCount. Refusing." }

$outText = ($out -join "`r`n")
if ($outText -notmatch "\.\\$transaction") {
  # we just check for $transaction in the TS file; the regex string needs escaping in PowerShell
  if ($outText -notmatch "\.\$transaction") { throw "Expected prisma.$transaction not present after patch. Refusing." }
}
if ($outText -notmatch "tx\.order\.create") { throw "Expected tx.order.create not present after patch. Refusing." }

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $outText, $enc)
Write-Host ("Patched: " + $file)
