#Requires -Version 5.1
[CmdletBinding(SupportsShouldProcess=$true)]
param([switch]$Apply)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  param([string]$StartDir)
  if ([string]::IsNullOrWhiteSpace($StartDir)) { throw "StartDir is empty. Refusing to run." }
  $d = Resolve-Path -LiteralPath $StartDir
  while ($true) {
    $pkg = Join-Path -Path $d -ChildPath 'package.json'
    if (Test-Path -LiteralPath $pkg) { return $d }
    $parent = Split-Path -Path $d -Parent
    if ($parent -eq $d -or [string]::IsNullOrWhiteSpace($parent)) { break }
    $d = $parent
  }
  throw "Repo root not found (package.json). Refusing to run outside repo."
}

$startDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }
$repoRoot = Get-RepoRoot -StartDir $startDir
Set-Location -LiteralPath $repoRoot

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-FileText {
  param([string]$RelPath)
  $p = Join-Path -Path $repoRoot -ChildPath $RelPath
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $RelPath) }
  $bytes = [IO.File]::ReadAllBytes($p)
  return $utf8NoBom.GetString($bytes)
}

function Write-FileText {
  param([string]$RelPath, [string]$Text, [string]$BackupTag)
  $p = Join-Path -Path $repoRoot -ChildPath $RelPath
  $bak = $p + '.' + $BackupTag
  if (-not (Test-Path -LiteralPath $bak)) {
    $origBytes = [IO.File]::ReadAllBytes($p)
    [IO.File]::WriteAllBytes($bak, $origBytes)
  }
  $bytes = $utf8NoBom.GetBytes($Text)
  [IO.File]::WriteAllBytes($p, $bytes)
}

function Replace-Exact {
  param(
    [string]$RelPath,
    [string]$OldText,
    [string]$NewText,
    [int]$MinReplacements = 1
  )
  $text = Read-FileText -RelPath $RelPath
  $count = 0
  $idx = 0
  while ($true) {
    $pos = $text.IndexOf($OldText, $idx, [StringComparison]::Ordinal)
    if ($pos -lt 0) { break }
    $count += 1
    $idx = $pos + $OldText.Length
  }
  if ($count -lt $MinReplacements) {
    throw ("Expected at least " + $MinReplacements + " occurrence(s) not found in " + $RelPath)
  }
  $updated = $text.Replace($OldText, $NewText)
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Replace exact text")) {
      Write-FileText -RelPath $RelPath -Text $updated -BackupTag 'bak_v2scan'
    }
  }
  return @{ Path=$RelPath; Replacements=$count }
}

$results = New-Object System.Collections.Generic.List[object]

# ---- Targeted fixes from v2-scan output you pasted ----

# pricing: remove checkout wording
$results.Add((Replace-Exact -RelPath 'app\(public)\pricing\page.tsx' -OldText 'Secure checkout where available.' -NewText 'Pickup scheduling is handled in-app.' -MinReplacements 1)) | Out-Null

# help: remove postage + pickup arranged via messages
$results.Add((Replace-Exact -RelPath 'app\help\page.tsx' -OldText 'After a sale, buyer & seller arrange pickup or postage directly. Bidra records outcomes and helps enforce policy if needed.' -NewText 'After a sale, pickup is scheduled in-app. Messages are for clarification only. Bidra records outcomes and enforces reliability.' -MinReplacements 1)) | Out-Null

# how-it-works: remove postage/shipping + negotiation via messages + payment-first wording
$results.Add((Replace-Exact -RelPath 'app\how-it-works\page.tsx' -OldText 'pickup/postage context.' -NewText 'pickup context.' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\how-it-works\page.tsx' -OldText '3) Messaging and arranging pickup/postage' -NewText '3) Messaging and scheduling pickup' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\how-it-works\page.tsx' -OldText 'After payment and handover/postage, mark the order complete inside Bidra.' -NewText 'After in-person handover, mark the order complete inside Bidra.' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\how-it-works\page.tsx' -OldText 'If something goes wrong, keep records (screenshots, messages, postage receipts) and contact Support.' -NewText 'If something goes wrong, keep records (screenshots, messages, photos) and contact Support.' -MinReplacements 1)) | Out-Null

# legal privacy: remove "email delivery" phrasing (not shipping)
$results.Add((Replace-Exact -RelPath 'app\legal\privacy\page.tsx' -OldText 'email delivery' -NewText 'email sending' -MinReplacements 1)) | Out-Null

# legal terms: remove postage/tracking language
$results.Add((Replace-Exact -RelPath 'app\legal\terms\page.tsx' -OldText 'handover/postage carefully and keep records (receipts, tracking, photos).' -NewText 'handover carefully and keep records (messages, photos).' -MinReplacements 1)) | Out-Null

# orders UI: remove postage/shipping + message-negotiation + payment-first copy
$results.Add((Replace-Exact -RelPath 'app\orders\[id]\page.tsx' -OldText 'Confirm item details and pickup/postage plan before you pay.' -NewText 'Confirm item details and schedule pickup in-app before you confirm payment.' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\orders\[id]\page.tsx' -OldText 'Once verified, arrange pickup/shipping in ' -NewText 'Once verified, schedule pickup in ' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\orders\[id]\page.tsx' -OldText 'coordinate pickup/shipping in ' -NewText 'keep pickup scheduled in ' -MinReplacements 1)) | Out-Null

# seller flow: remove delivery suggestion
$results.Add((Replace-Exact -RelPath 'app\sell\new\sell-new-client.tsx' -OldText 'Pickup preferred. If you need delivery, message me to discuss.' -NewText 'Pickup only. Please choose a pickup time in the app.' -MinReplacements 1)) | Out-Null

# support page: remove postage/shipping advice (pickup-only)
$results.Add((Replace-Exact -RelPath 'app\support\page.tsx' -OldText 'For postage, use tracked shipping and keep receipts.' -NewText 'Pickup is scheduled in-app. No-shows and repeat reschedules affect reliability.' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\support\page.tsx' -OldText 'For postage, pack carefully, use tracking, and keep lodgement receipts.' -NewText 'If something changes, request a reschedule in-app. Messages are for clarification only.' -MinReplacements 1)) | Out-Null

# platform language: remove delivery word in disclaimer
$results.Add((Replace-Exact -RelPath 'lib\platform-language.ts' -OldText 'Bidra does not guarantee authenticity, quality, or delivery. Users are responsible for their own decisions and arrangements.' -NewText 'Bidra does not guarantee authenticity, quality, or completion. Users are responsible for their own decisions and arrangements.' -MinReplacements 1)) | Out-Null

# app/api: remove "PENDING" literal outcomes in routes (status is PICKUP_REQUIRED)
$results.Add((Replace-Exact -RelPath 'app\api\listings\[id]\accept-highest-offer\route.ts' -OldText 'outcome: "PENDING",' -NewText 'outcome: "PICKUP_REQUIRED",' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'app\api\listings\[id]\buy-now\route.ts' -OldText 'outcome: "PENDING",' -NewText 'outcome: "PICKUP_REQUIRED",' -MinReplacements 1)) | Out-Null

# tmp scripts: remove PENDING literals
$results.Add((Replace-Exact -RelPath 'tmp-create-overdue-order.js' -OldText 'outcome: "PENDING",' -NewText 'outcome: "PICKUP_REQUIRED",' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'tmp-create-test-order.js' -OldText 'status: "PENDING",' -NewText 'status: "PICKUP_REQUIRED",' -MinReplacements 1)) | Out-Null
$results.Add((Replace-Exact -RelPath 'tmp-create-test-order.js' -OldText 'outcome: "PENDING",' -NewText 'outcome: "PICKUP_REQUIRED",' -MinReplacements 1)) | Out-Null

# ---- Summary ----
$total = 0
foreach ($r in $results) { $total += [int]$r.Replacements }
Write-Host ("Apply: " + ([bool]$Apply))
Write-Host ("Files touched: " + $results.Count)
Write-Host ("Total replacements: " + $total)
foreach ($r in $results) { Write-Host (("EDIT {0} (repl={1})" -f $r.Path, $r.Replacements)) }
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-fix-scan-hits.ps1 -Apply"
}
