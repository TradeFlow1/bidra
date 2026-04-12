#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  $dir = Resolve-Path $PSScriptRoot
  while ($true) {
    $candidate = Join-Path $dir 'package.json'
    if (Test-Path -LiteralPath $candidate) { return $dir }
    $parent = Split-Path -Parent $dir
    if ($parent -eq $dir) { throw 'Repo root not found (package.json).' }
    $dir = $parent
  }
}

$repoRoot = Get-RepoRoot
if ($repoRoot -ne 'C:\dev\bidra-main') {
  throw ("Refusing to run: expected repo root C:\dev\bidra-main, got: " + $repoRoot)
}
Set-Location $repoRoot

$patterns = @(
  'pickupAvailability',
  'pickupTimezone',
  'pickupOptions',
  'pickupOptionsSentAt',
  'pickupOptionSelectedAt',
  'pickupScheduleLockedAt',
  'pickupScheduledAt',
  'rescheduleRequestedAt',
  'rescheduleRequestedByRole',
  'rescheduleReason',
  'rescheduleResolvedAt',
  'PICKUP_REQUIRED',
  'PICKUP_SCHEDULED',
  'schedule pickup',
  'pickup options'
)

$allowedExt = @('.ts', '.tsx', '.js', '.jsx', '.prisma')
$files = Get-ChildItem -Recurse -File | Where-Object { $allowedExt -contains $_.Extension }

foreach ($file in $files) {
  $path = $file.FullName
  if ($path -like '*\node_modules\*') { continue }
  if ($path -like '*\.next\*') { continue }
  if ($path -like '*\.git\*') { continue }

  $matches = Select-String -LiteralPath $path -Pattern $patterns -CaseSensitive:$false -SimpleMatch
  if ($matches) {
    Write-Host ""
    Write-Host $path -ForegroundColor Cyan
    foreach ($m in $matches) {
      Write-Host ('  L' + $m.LineNumber + ': ' + $m.Line.Trim())
    }
  }
}
