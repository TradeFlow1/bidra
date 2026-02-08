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
function Read-FileText {
  param([string]$RelPath)
  $p = Join-Path -Path $repoRoot -ChildPath $RelPath
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $RelPath) }
  return $utf8NoBom.GetString([IO.File]::ReadAllBytes($p))
}
function Write-FileText {
  param([string]$RelPath,[string]$Text,[string]$BackupTag)
  $p = Join-Path -Path $repoRoot -ChildPath $RelPath
  $bak = $p + '.' + $BackupTag
  if (-not (Test-Path -LiteralPath $bak)) {
    if (Test-Path -LiteralPath $p) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) }
  }
  $parent = Split-Path -Parent $p
  if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}
function Replace-Regex {
  param([string]$RelPath,[string]$Pattern,[string]$Replacement,[int]$MinReplacements,[string]$BackupTag,[string]$AlreadyAppliedPattern)
  $text = Read-FileText -RelPath $RelPath
  $opts = [Text.RegularExpressions.RegexOptions]::Multiline
  $m = [regex]::Matches($text, $Pattern, $opts)
  if ($m.Count -lt $MinReplacements) {
    if (-not [string]::IsNullOrWhiteSpace($AlreadyAppliedPattern)) {
      $am = [regex]::Match($text, $AlreadyAppliedPattern, $opts)
      if ($am.Success) { return @{ Path=$RelPath; Replacements=0 } }
    }
    throw ("Expected " + $MinReplacements + " regex matches not found in " + $RelPath)
  }
  $updated = [regex]::Replace($text, $Pattern, $Replacement, $opts)
  if ($Apply -and $updated -ne $text) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Replace regex")) { Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag }
  }
  return @{ Path=$RelPath; Replacements=$m.Count }
}

$results = New-Object System.Collections.Generic.List[object]

$regRel   = 'app\api\auth\register\route.ts'
$resetRel = 'app\api\auth\password-reset\confirm\route.ts'
$uiRel    = 'app\auth\register\page.tsx'
$fixRel   = 'tools\bidra-launch-fixes.json'

$results.Add((Replace-Regex -RelPath $regRel -Pattern '(?m)^import bcrypt from "bcryptjs";.*$' -Replacement 'import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";' -MinReplacements 1 -AlreadyAppliedPattern '(?m)^import \{ checkPasswordPolicy \} from "@/lib/password-policy";\s*$' -BackupTag 'bak_v2_46')) | Out-Null
$results.Add((Replace-Regex -RelPath $regRel -Pattern '(?s)if\s*\(\s*passwordStr\.length\s*<\s*8\s*\)[\s\S]*?(?=\s*if\s*\(\s*username\.length)' -Replacement 'if (passwordStr.length < 8) {`r`n    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });`r`n  }`r`n`r`n  const pw = checkPasswordPolicy(passwordStr);`r`n  if (!pw.ok) {`r`n    return NextResponse.json({ error: pw.reason || "Password is too weak." }, { status: 400 });`r`n  }`r`n`r`n' -MinReplacements 1 -AlreadyAppliedPattern 'checkPasswordPolicy\(\s*passwordStr\s*\)' -BackupTag 'bak_v2_46')) | Out-Null

$results.Add((Replace-Regex -RelPath $resetRel -Pattern '(?m)^import bcrypt from "bcryptjs";.*$' -Replacement 'import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";' -MinReplacements 1 -AlreadyAppliedPattern '(?m)^import \{ checkPasswordPolicy \} from "@/lib/password-policy";\s*$' -BackupTag 'bak_v2_46')) | Out-Null
$results.Add((Replace-Regex -RelPath $resetRel -Pattern '(?s)if\s*\(\s*!token\s*\|\|\s*newPassword\.length\s*<\s*8\s*\)[\s\S]*?(?=\s*const\s+tokenHash\s*=)' -Replacement 'if (!token || newPassword.length < 8) {`r`n    return bad("Invalid token or password too short.");`r`n  }`r`n`r`n  const pw = checkPasswordPolicy(newPassword);`r`n  if (!pw.ok) {`r`n    return bad(pw.reason || "Password is too weak.");`r`n  }`r`n`r`n' -MinReplacements 1 -AlreadyAppliedPattern 'checkPasswordPolicy\(\s*newPassword\s*\)' -BackupTag 'bak_v2_46')) | Out-Null

$results.Add((Replace-Regex -RelPath $uiRel -Pattern '(?s)import \{ useEffect, useMemo, useState \} from "react";(?!\r?\nimport \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";)' -Replacement 'import { useEffect, useMemo, useState } from "react";`r`nimport { checkPasswordPolicy, passwordGuidanceText } from "@/lib/password-policy";' -MinReplacements 1 -AlreadyAppliedPattern '(?m)^import \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";\s*$' -BackupTag 'bak_v2_46')) | Out-Null
$results.Add((Replace-Regex -RelPath $uiRel -Pattern '(?m)^(\s*)<p className=\{helper\}>Use 8\+ characters\.</p>\s*$' -Replacement '$1<p className={helper}>{passwordGuidanceText()}</p>' -MinReplacements 1 -AlreadyAppliedPattern 'passwordGuidanceText\(\)' -BackupTag 'bak_v2_46')) | Out-Null
$results.Add((Replace-Regex -RelPath $uiRel -Pattern '(?m)^\s*const pwTooShort = useMemo\(\(\) => form\.password\.length > 0 && form\.password\.length < 8, \[form\.password\]\);\s*$' -Replacement '  const pwTooShort = useMemo(() => form.password.length > 0 && form.password.length < 8, [form.password]);`r`n  const pwPolicy = useMemo(() => checkPasswordPolicy(form.password), [form.password]);' -MinReplacements 1 -AlreadyAppliedPattern '\bpwPolicy\b' -BackupTag 'bak_v2_46')) | Out-Null

$results.Add((Replace-Regex -RelPath $fixRel -Pattern '("Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*)false' -Replacement '$1true' -MinReplacements 1 -AlreadyAppliedPattern '(?s)"Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*true' -BackupTag 'bak_v2_46')) | Out-Null

$total = 0
foreach ($r in $results) { $total += [int]$r.Replacements }
Write-Host ("Apply: " + ([bool]$Apply))
Write-Host ("Edits: " + $results.Count)
Write-Host ("Total replacements: " + $total)
foreach ($r in $results) { Write-Host (("EDIT {0} (repl={1})" -f $r.Path, $r.Replacements)) }
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-46-weak-password-guidance.ps1 -Apply"
}
