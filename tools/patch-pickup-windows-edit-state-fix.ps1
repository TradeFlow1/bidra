#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

$path = Join-Path $repoRoot 'app\sell\edit\[id]\edit-listing-client.tsx'
$content = Get-Content -LiteralPath $path -Raw

if ($content -notmatch 'const \[pickupDays, setPickupDays\]') {
    $old = '  const seededPickup = ((listing as any).pickupAvailability && typeof (listing as any).pickupAvailability === "object") ? (listing as any).pickupAvailability : { days: [], timeBlocks: [], notes: "" };'
    $new = $old + "`r`n" +
'  const [pickupDays, setPickupDays] = useState<string[]>(Array.isArray((seededPickup as any).days) ? (seededPickup as any).days : []);' + "`r`n" +
'  const [pickupTimeBlocks, setPickupTimeBlocks] = useState<string[]>(Array.isArray((seededPickup as any).timeBlocks) ? (seededPickup as any).timeBlocks : []);' + "`r`n" +
'  const [pickupNotes, setPickupNotes] = useState<string>(String((seededPickup as any).notes || ""));'
    $content = $content.Replace($old, $new)
}

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $path"
