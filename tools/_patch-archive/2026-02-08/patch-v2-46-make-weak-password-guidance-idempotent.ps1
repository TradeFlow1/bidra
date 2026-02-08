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

# 1) Replace Replace-Regex function with an idempotent version (supports -AlreadyAppliedPattern)
$funcFind = '(?s)function\s+Replace-Regex\s*\{\s*param\(\[string\]\$RelPath,\[string\]\$Pattern,\[string\]\$Replacement,\[int\]\$MinReplacements,\[string\]\$BackupTag\)\s*[\s\S]*?\n\}'
$m1 = [regex]::Match($text, $funcFind)
if (-not $m1.Success) { throw "Could not find Replace-Regex function block to patch." }

$funcLines = New-Object System.Collections.Generic.List[string]
$funcLines.Add("function Replace-Regex {") | Out-Null
$funcLines.Add("") | Out-Null
$funcLines.Add("param([string]`$RelPath,[string]`$Pattern,[string]`$Replacement,[int]`$MinReplacements,[string]`$BackupTag,[string]`$AlreadyAppliedPattern)") | Out-Null
$funcLines.Add("  `$text = Read-FileText -RelPath `$RelPath") | Out-Null
$funcLines.Add("  `$m = [regex]::Matches(`$text, `$Pattern, [Text.RegularExpressions.RegexOptions]::Multiline)") | Out-Null
$funcLines.Add("  if (`$m.Count -lt `$MinReplacements) {") | Out-Null
$funcLines.Add("    if (-not [string]::IsNullOrWhiteSpace(`$AlreadyAppliedPattern)) {") | Out-Null
$funcLines.Add("      `$am = [regex]::Match(`$text, `$AlreadyAppliedPattern, [Text.RegularExpressions.RegexOptions]::Multiline)") | Out-Null
$funcLines.Add("      if (`$am.Success) { return @{ Path=`$RelPath; Replacements=0 } }") | Out-Null
$funcLines.Add("    }") | Out-Null
$funcLines.Add("    throw (""Expected "" + `$MinReplacements + "" regex matches not found in "" + `$RelPath)") | Out-Null
$funcLines.Add("  }") | Out-Null
$funcLines.Add("  `$updated = [regex]::Replace(`$text, `$Pattern, `$Replacement, [Text.RegularExpressions.RegexOptions]::Multiline)") | Out-Null
$funcLines.Add("  if (`$Apply) {") | Out-Null
$funcLines.Add("    if (`$updated -ne `$text) {") | Out-Null
$funcLines.Add("      if (`$PSCmdlet.ShouldProcess(`$RelPath, ""Replace regex"")) { Write-FileText -RelPath `$RelPath -Text `$updated -BackupTag `$BackupTag }") | Out-Null
$funcLines.Add("    }") | Out-Null
$funcLines.Add("  }") | Out-Null
$funcLines.Add("  return @{ Path=`$RelPath; Replacements=`$m.Count }") | Out-Null
$funcLines.Add("}") | Out-Null
$funcBlock = ($funcLines.ToArray() -join ""`r`n"")

$text2 = [regex]::Replace($text, $funcFind, [System.Text.RegularExpressions.MatchEvaluator]{ param($mm) $funcBlock }, 1)
if ($text2 -eq $text) { throw "No change made updating Replace-Regex (unexpected)." }
$text = $text2

# 2) Add -AlreadyAppliedPattern to the non-idempotent Replace-Regex callsites
$changes = 0

# register route.ts: detect already-applied by presence of checkPasswordPolicy(passwordStr)
$p1 = '(Replace-Regex\s+-RelPath\s+\$regRel\s+-Pattern\s+'[^']+'\s+-Replacement\s+'[^']+'\s+)(-MinReplacements\s+1\s+-BackupTag\s+'bak_v2_46')'
if ([regex]::IsMatch($text, $p1)) {
  $text = [regex]::Replace($text, $p1, '$1-AlreadyAppliedPattern ''checkPasswordPolicy\(\s*passwordStr\s*\)'' $2', 1)
  $changes++
}

# reset confirm route.ts: detect already-applied by presence of checkPasswordPolicy(newPassword)
$p2 = '(Replace-Regex\s+-RelPath\s+\$resetRel\s+-Pattern\s+'[^']+'\s+-Replacement\s+'[^']+'\s+)(-MinReplacements\s+1\s+-BackupTag\s+'bak_v2_46')'
if ([regex]::IsMatch($text, $p2)) {
  $text = [regex]::Replace($text, $p2, '$1-AlreadyAppliedPattern ''checkPasswordPolicy\(\s*newPassword\s*\)'' $2', 1)
  $changes++
}

# launch fixes json: detect already-applied by Done:true for Id 46
$p3 = '(Replace-Regex\s+-RelPath\s+\$fixRel\s+-Pattern\s+'[^']+'\s+-Replacement\s+'[^']+'\s+)(-MinReplacements\s+1\s+-BackupTag\s+'bak_v2_46')'
if ([regex]::IsMatch($text, $p3)) {
  $text = [regex]::Replace($text, $p3, '$1-AlreadyAppliedPattern ''"Id"\\s*:\\s*46[\\s\\S]*?"Done"\\s*:\\s*true'' $2', 1)
  $changes++
}

if ($changes -lt 1) { throw "Did not find any Replace-Regex callsites to update (unexpected)." }

if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Make patch idempotent for re-runs")) {
    $bak = $patchPath + '.bak_v2_46_idempotent'
    if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    [IO.File]::WriteAllBytes($patchPath, $utf8NoBom.GetBytes($text))
    Write-Host ("UPDATED " + $patchRel)
  }
} else {
  Write-Host ("Dry-run: would make " + $patchRel + " idempotent for re-runs")
}
