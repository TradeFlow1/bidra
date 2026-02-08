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
$patchRel = 'tools\patch-v2-46-weak-password-guidance.ps1'
$patchPath = Join-Path -Path $repoRoot -ChildPath $patchRel
if (-not (Test-Path -LiteralPath $patchPath)) { throw ("Missing: " + $patchRel) }
$text = $utf8NoBom.GetString([IO.File]::ReadAllBytes($patchPath))

$old = 'if \\(passwordStr\\.length < 8\\)\\s*\\{\\s*\\r?\\n\\s*return NextResponse\\.json\\(\\{ error: "Password must be at least 8 characters\\." \\}, \\{ status: 400 \\} \\);\\s*\\r?\\n\\s*\\}\\s*\\r?\\n'
$new = 'if \\(passwordStr\\.length < 8\\)\\s*\\{\\s*\\r?\\n\\s*return\\s+NextResponse\\.json\\(\\s*\\{\\s*error:\\s*"Password must be at least 8 characters\\."\\s*\\}\\s*,\\s*\\{\\s*status\\s*:\\s*400\\s*\\}\\s*\\)\\s*;?\\s*\\r?\\n\\s*\\}\\s*\\r?\\n'

$idx = $text.IndexOf($old, [StringComparison]::Ordinal)
if ($idx -lt 0) {
  throw "Could not find the exact old register-route regex in patch-v2-46. (It may already be updated or differs.)"
}

$updated = $text.Replace($old, $new)
if ($updated -eq $text) { throw "No change made (unexpected)."}

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Update register-route regex to allow whitespace/newlines in status 400")) {
    $bak = $patchPath + '.bak_v2_46_regex'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host "Dry-run: would update register-route regex inside tools\patch-v2-46-weak-password-guidance.ps1"
}
