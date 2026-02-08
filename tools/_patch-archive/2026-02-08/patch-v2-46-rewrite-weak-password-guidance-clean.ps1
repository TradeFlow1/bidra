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

$patchRel = 'tools\patch-v2-46-weak-password-guidance.ps1'
$patchPath = Join-Path -Path $repoRoot -ChildPath $patchRel
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Write-Utf8NoBom([string]$Path, [string]$Text) { [IO.File]::WriteAllBytes($Path, $utf8NoBom.GetBytes($Text)) }

$P = New-Object System.Collections.Generic.List[string]
$P.Add('#Requires -Version 5.1') | Out-Null
$P.Add('[CmdletBinding(SupportsShouldProcess=$true)]') | Out-Null
$P.Add('param([switch]$Apply)') | Out-Null
$P.Add('') | Out-Null
$P.Add('Set-StrictMode -Version Latest') | Out-Null
$P.Add('$ErrorActionPreference = ''Stop''' ) | Out-Null
$P.Add('') | Out-Null
$P.Add('function Get-RepoRoot {') | Out-Null
$P.Add('  param([string]$StartDir)') | Out-Null
$P.Add('  if ([string]::IsNullOrWhiteSpace($StartDir)) { throw "StartDir is empty. Refusing to run." }') | Out-Null
$P.Add('  $d = Resolve-Path -LiteralPath $StartDir') | Out-Null
$P.Add('  while ($true) {') | Out-Null
$P.Add('    $pkg = Join-Path -Path $d -ChildPath ''package.json''') | Out-Null
$P.Add('    if (Test-Path -LiteralPath $pkg) { return $d }') | Out-Null
$P.Add('    $p = Split-Path -Path $d -Parent') | Out-Null
$P.Add('    if ($p -eq $d -or [string]::IsNullOrWhiteSpace($p)) { break }') | Out-Null
$P.Add('    $d = $p') | Out-Null
$P.Add('  }') | Out-Null
$P.Add('  throw "Repo root not found (package.json). Refusing to run outside repo."') | Out-Null
$P.Add('}') | Out-Null
$P.Add('') | Out-Null
$P.Add('$startDir = $PSScriptRoot') | Out-Null
$P.Add('if ([string]::IsNullOrWhiteSpace($startDir)) { $startDir = (Get-Location).Path }') | Out-Null
$P.Add('$repoRoot = Get-RepoRoot -StartDir $startDir') | Out-Null
$P.Add('Set-Location -LiteralPath $repoRoot') | Out-Null
$P.Add('') | Out-Null
$P.Add('$utf8NoBom = New-Object System.Text.UTF8Encoding($false)') | Out-Null
$P.Add('function Read-FileText {') | Out-Null
$P.Add('  param([string]$RelPath)') | Out-Null
$P.Add('  $p = Join-Path -Path $repoRoot -ChildPath $RelPath') | Out-Null
$P.Add('  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing file: " + $RelPath) }') | Out-Null
$P.Add('  return $utf8NoBom.GetString([IO.File]::ReadAllBytes($p))') | Out-Null
$P.Add('}') | Out-Null
$P.Add('function Write-FileText {') | Out-Null
$P.Add('  param([string]$RelPath,[string]$Text,[string]$BackupTag)') | Out-Null
$P.Add('  $p = Join-Path -Path $repoRoot -ChildPath $RelPath') | Out-Null
$P.Add('  $bak = $p + ''.'' + $BackupTag') | Out-Null
$P.Add('  if (-not (Test-Path -LiteralPath $bak)) {') | Out-Null
$P.Add('    if (Test-Path -LiteralPath $p) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) }') | Out-Null
$P.Add('  }') | Out-Null
$P.Add('  $parent = Split-Path -Parent $p') | Out-Null
$P.Add('  if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }') | Out-Null
$P.Add('  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))') | Out-Null
$P.Add('}') | Out-Null
$P.Add('function Replace-Regex {') | Out-Null
$P.Add('  param(') | Out-Null
$P.Add('    [string]$RelPath,') | Out-Null
$P.Add('    [string]$Pattern,') | Out-Null
$P.Add('    [string]$Replacement,') | Out-Null
$P.Add('    [int]$MinReplacements,') | Out-Null
$P.Add('    [string]$BackupTag,') | Out-Null
$P.Add('    [string]$AlreadyAppliedPattern') | Out-Null
$P.Add('  )') | Out-Null
$P.Add('  $text = Read-FileText -RelPath $RelPath') | Out-Null
$P.Add('  $opts = [Text.RegularExpressions.RegexOptions]::Multiline') | Out-Null
$P.Add('  $m = [regex]::Matches($text, $Pattern, $opts)') | Out-Null
$P.Add('  if ($m.Count -lt $MinReplacements) {') | Out-Null
$P.Add('    if (-not [string]::IsNullOrWhiteSpace($AlreadyAppliedPattern)) {') | Out-Null
$P.Add('      $am = [regex]::Match($text, $AlreadyAppliedPattern, $opts)') | Out-Null
$P.Add('      if ($am.Success) { return @{ Path=$RelPath; Replacements=0 } }') | Out-Null
$P.Add('    }') | Out-Null
$P.Add('    throw ("Expected " + $MinReplacements + " regex matches not found in " + $RelPath)') | Out-Null
$P.Add('  }') | Out-Null
$P.Add('  $updated = [regex]::Replace($text, $Pattern, $Replacement, $opts)') | Out-Null
$P.Add('  if ($Apply -and $updated -ne $text) {') | Out-Null
$P.Add('    if ($PSCmdlet.ShouldProcess($RelPath, "Replace regex")) { Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag }') | Out-Null
$P.Add('  }') | Out-Null
$P.Add('  return @{ Path=$RelPath; Replacements=$m.Count }') | Out-Null
$P.Add('}') | Out-Null
$P.Add('') | Out-Null
$P.Add('$results = New-Object System.Collections.Generic.List[object]') | Out-Null
$P.Add('') | Out-Null
$P.Add('$regRel = ''app\api\auth\register\route.ts''') | Out-Null
$P.Add('$resetRel = ''app\api\auth\password-reset\confirm\route.ts''') | Out-Null
$P.Add('$uiRel = ''app\auth\register\page.tsx''') | Out-Null
$P.Add('$fixRel = ''tools\bidra-launch-fixes.json''') | Out-Null
$P.Add('') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $regRel -Pattern ''(?m)^import bcrypt from "bcryptjs";\s*$'' -Replacement ''import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";'' -MinReplacements 1 -AlreadyAppliedPattern ''(?m)^import \{ checkPasswordPolicy \} from "@/lib/password-policy";\s*$'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $regRel -Pattern ''(?s)if \(passwordStr\.length < 8\)\s*\{\s*return NextResponse\.json\(\s*\{\s*error:\s*"Password must be at least 8 characters\."\s*\}\s*,\s*\{\s*status\s*:\s*400\s*\}\s*\)\s*;\s*\}'' -Replacement ''if (passwordStr.length < 8) {`r`n    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });`r`n  }`r`n`r`n  const pw = checkPasswordPolicy(passwordStr);`r`n  if (!pw.ok) {`r`n    return NextResponse.json({ error: pw.reason || "Password is too weak." }, { status: 400 });`r`n  }'' -MinReplacements 1 -AlreadyAppliedPattern ''checkPasswordPolicy\(\s*passwordStr\s*\)'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $resetRel -Pattern ''(?m)^import bcrypt from "bcryptjs";\s*$'' -Replacement ''import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";'' -MinReplacements 1 -AlreadyAppliedPattern ''(?m)^import \{ checkPasswordPolicy \} from "@/lib/password-policy";\s*$'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $resetRel -Pattern ''(?s)if \(!token \|\| newPassword\.length < 8\)\s*\{\s*return bad\("Invalid token or password too short\."\);\s*\}'' -Replacement ''if (!token || newPassword.length < 8) {`r`n    return bad("Invalid token or password too short.");`r`n  }`r`n`r`n  const pw = checkPasswordPolicy(newPassword);`r`n  if (!pw.ok) {`r`n    return bad(pw.reason || "Password is too weak.");`r`n  }'' -MinReplacements 1 -AlreadyAppliedPattern ''checkPasswordPolicy\(\s*newPassword\s*\)'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $uiRel -Pattern ''(?s)import \{ useEffect, useMemo, useState \} from "react";(?!\r?\nimport \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";)'' -Replacement ''import { useEffect, useMemo, useState } from "react";`r`nimport { checkPasswordPolicy, passwordGuidanceText } from "@/lib/password-policy";'' -MinReplacements 1 -AlreadyAppliedPattern ''(?m)^import \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";\s*$'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $uiRel -Pattern ''(?m)^(\s*)<p className=\{helper\}>Use 8\+ characters\.</p>\s*$'' -Replacement ''$1<p className={helper}>{passwordGuidanceText()}</p>'' -MinReplacements 1 -AlreadyAppliedPattern ''passwordGuidanceText\(\)'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $uiRel -Pattern ''(?m)^\s*const pwTooShort = useMemo\(\(\) => form\.password\.length > 0 && form\.password\.length < 8, \[form\.password\]\);\s*$'' -Replacement ''  const pwTooShort = useMemo(() => form.password.length > 0 && form.password.length < 8, [form.password]);`r`n  const pwPolicy = useMemo(() => checkPasswordPolicy(form.password), [form.password]);'' -MinReplacements 1 -AlreadyAppliedPattern ''\bpwPolicy\b'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('') | Out-Null
$P.Add('$results.Add((Replace-Regex -RelPath $fixRel -Pattern ''("Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*)false'' -Replacement ''$1true'' -MinReplacements 1 -AlreadyAppliedPattern ''(?s)"Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*true'' -BackupTag ''bak_v2_46'')) | Out-Null') | Out-Null
$P.Add('') | Out-Null
$P.Add('$total = 0') | Out-Null
$P.Add('foreach ($r in $results) { $total += [int]$r.Replacements }') | Out-Null
$P.Add('Write-Host ("Apply: " + ([bool]$Apply))') | Out-Null
$P.Add('Write-Host ("Edits: " + $results.Count)') | Out-Null
$P.Add('Write-Host ("Total replacements: " + $total)') | Out-Null
$P.Add('foreach ($r in $results) { Write-Host (("EDIT {0} (repl={1})" -f $r.Path, $r.Replacements)) }') | Out-Null
$P.Add('if (-not $Apply) {') | Out-Null
$P.Add('  Write-Host ""') | Out-Null
$P.Add('  Write-Host "Dry-run only. Re-run with -Apply:"') | Out-Null
$P.Add('  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-46-weak-password-guidance.ps1 -Apply"') | Out-Null
$P.Add('}') | Out-Null
$patchText = ($P.ToArray() -join "`r`n") + "`r`n"
if ($Apply) {
  if ($PSCmdlet.ShouldProcess($patchRel, "Rewrite patch script cleanly")) {
    if (Test-Path -LiteralPath $patchPath) {
      $bak = $patchPath + '.bak_v2_46_rewrite_clean'
      if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($patchPath)) }
    }
    Write-Utf8NoBom -Path $patchPath -Text $patchText
    Write-Host ("REWROTE " + $patchRel)
  }
} else {
  Write-Host ("Dry-run: would rewrite " + $patchRel + " cleanly")
}
