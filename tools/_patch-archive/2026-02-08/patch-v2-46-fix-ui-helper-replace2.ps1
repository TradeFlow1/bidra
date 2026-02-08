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

# Build regex strings safely (no nested quoting problems)
$sq = [char]39

# Match the broken UI Replace-Exact block (spans lines because -OldText is wrapped)
$find = '(?s)\$results\.Add\(\(Replace-Exact\s+-RelPath\s+\$uiRel\s+-OldText\s+' + $sq + '[\s\S]*?Use 8\+ characters\.</p>' + $sq + '\s+-NewText\s+' + $sq + '[\s\S]*?\{passwordGuidanceText\(\)\}</p>' + $sq + '\s+-MinReplacements\s+1\s+-BackupTag\s+' + $sq + 'bak_v2_46' + $sq + '\)\)\s+\|\s+Out-Null'

# Replace it with an indentation-preserving Replace-Regex against the TSX line
$replace = '$results.Add((Replace-Regex -RelPath $uiRel -Pattern ' + $sq + '(?m)^(\s*)<p className=\{helper\}>Use 8\+ characters\.</p>' + $sq + ' -Replacement ' + $sq + '$1<p className={helper}>{passwordGuidanceText()}</p>' + $sq + ' -MinReplacements 1 -BackupTag ' + $sq + 'bak_v2_46' + $sq + ')) | Out-Null'

$m = [regex]::Match($text, $find)
if (-not $m.Success) { throw "Could not locate the broken UI Replace-Exact block inside tools\patch-v2-46-weak-password-guidance.ps1" }
$updated = [regex]::Replace($text, $find, $replace, 1)
if ($updated -eq $text) { throw "No change made (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Replace broken UI Replace-Exact with indentation-tolerant Replace-Regex")) {
    $bak = $patchPath + '.bak_v2_46_uifix2'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($updated))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host "Dry-run: would update UI helper replacement inside tools\patch-v2-46-weak-password-guidance.ps1"
}
