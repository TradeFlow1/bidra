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
    $p = Split-Path -Path $d -Parent
    if ($p -eq $d -or [string]::IsNullOrWhiteSpace($p)) { break }
    $d = $p
  }
  throw "Repo root not found (package.json). Refusing to run outside repo."
}

$startDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }
$repoRoot = Get-RepoRoot -StartDir $startDir
Set-Location -LiteralPath $repoRoot

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Read-FileText([string]$Rel){
  $p = Join-Path -Path $repoRoot -ChildPath $Rel
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $Rel) }
  return $utf8NoBom.GetString([IO.File]::ReadAllBytes($p))
}
function Write-FileText([string]$Rel,[string]$Text,[string]$Tag){
  $p = Join-Path -Path $repoRoot -ChildPath $Rel
  $bak = $p + '.' + $Tag
  if (-not (Test-Path -LiteralPath $bak)) {
    if (Test-Path -LiteralPath $p) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) }
  }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

$rel = 'app\messages\components\inbox-auto-refresh.tsx'
$tag = 'bak_v2_47_disable_inbox_refresh'
$old = Read-FileText -Rel $rel

# Build replacement content without @(...)/commas to avoid PS parser edge-cases.
$nl = "`r`n"
$newLines = New-Object System.Collections.Generic.List[string]
$newLines.Add('"use client"') | Out-Null
$newLines.Add('') | Out-Null
$newLines.Add('export default function InboxAutoRefresh() {') | Out-Null
$newLines.Add('  // Intentionally no-op. The inbox route is already dynamic;') | Out-Null
$newLines.Add('  // a mount-time router.refresh() can cause back/navigation glitches.') | Out-Null
$newLines.Add('  return null') | Out-Null
$newLines.Add('}') | Out-Null
$newLines.Add('') | Out-Null
$newText = ($newLines.ToArray() -join $nl) + $nl

if ($old -eq $newText) { Write-Host "No changes needed (already no-op)."; return }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($rel, "Disable mount-time refresh (make InboxAutoRefresh no-op)")) {
    Write-FileText -Rel $rel -Text $newText -Tag $tag
    Write-Host ("PATCHED " + $rel)
  }
} else {
  Write-Host ("Dry-run: would patch " + $rel)
  Write-Host "Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-47-disable-inbox-auto-refresh.ps1 -Apply"
}
