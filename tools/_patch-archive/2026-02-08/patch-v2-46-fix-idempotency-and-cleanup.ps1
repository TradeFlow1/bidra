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
function Read-Utf8NoBom([string]$Rel) {
  $p = Join-Path -Path $repoRoot -ChildPath $Rel
  if (-not (Test-Path -LiteralPath $p)) { throw ("Missing: " + $Rel) }
  return $utf8NoBom.GetString([IO.File]::ReadAllBytes($p))
}
function Write-Utf8NoBom([string]$Rel, [string]$Text, [string]$BackupTag) {
  $p = Join-Path -Path $repoRoot -ChildPath $Rel
  $bak = $p + "." + $BackupTag
  if (-not (Test-Path -LiteralPath $bak)) { [IO.File]::WriteAllBytes($bak, [IO.File]::ReadAllBytes($p)) }
  [IO.File]::WriteAllBytes($p, $utf8NoBom.GetBytes($Text))
}

function Apply-Edit([string]$Rel, [string]$What, [string]$NewText, [string]$OldText) {
  if ($NewText -eq $OldText) { Write-Host ("OK   " + $Rel + " (no change)"); return }
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($Rel, $What)) {
      Write-Utf8NoBom -Rel $Rel -Text $NewText -BackupTag 'bak_v2_46_cleanup'
      Write-Host ("EDIT " + $Rel + " (" + $What + ")")
    }
  } else {
    Write-Host ("DRY  " + $Rel + " (" + $What + ")")
  }
}

$regRel = 'app\api\auth\register\route.ts'
$resetRel = 'app\api\auth\password-reset\confirm\route.ts'
$uiRel = 'app\auth\register\page.tsx'

$t = Read-Utf8NoBom $regRel
$old = $t
# Fix literal `r`n + duplicate imports
$t = [regex]::Replace($t, 'import bcrypt from "bcryptjs";`r`nimport \{ checkPasswordPolicy \} from\s+"@/lib/password-policy";`r`nimport \{ checkPasswordPolicy \} from "@/lib/password-policy";', 'import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";')
$t = [regex]::Replace($t, '(?m)^(import \{ checkPasswordPolicy \} from "@/lib/password-policy";)\s*$', '')
$t = [regex]::Replace($t, '(?m)^(import \{ checkPasswordPolicy \} from "@/lib/password-policy";)\s*(\r?\n\1)+$', '$1')
Apply-Edit -Rel $regRel -What 'dedupe imports + remove literal `r`n' -NewText $t -OldText $old

$t = Read-Utf8NoBom $resetRel
$old = $t
$t = [regex]::Replace($t, 'import bcrypt from "bcryptjs";`r`nimport \{ checkPasswordPolicy \} from\s+"@/lib/password-policy";`r`nimport \{ checkPasswordPolicy \} from "@/lib/password-policy";', 'import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";')
$t = [regex]::Replace($t, '(?m)^(import \{ checkPasswordPolicy \} from "@/lib/password-policy";)\s*$', '')
$t = [regex]::Replace($t, '(?m)^(import \{ checkPasswordPolicy \} from "@/lib/password-policy";)\s*(\r?\n\1)+$', '$1')
Apply-Edit -Rel $resetRel -What 'dedupe imports + remove literal `r`n' -NewText $t -OldText $old

$t = Read-Utf8NoBom $uiRel
$old = $t
# Fix literal `r`n + duplicate imports in UI file
$t = [regex]::Replace($t, 'import \{ useEffect, useMemo, useState \} from "react";`r`nimport \{ checkPasswordPolicy,\s*passwordGuidanceText \} from "@/lib/password-policy";`r`nimport \{ checkPasswordPolicy, passwordGuidanceText \} from\s+"@/lib/password-policy";', 'import { useEffect, useMemo, useState } from "react";`r`nimport { checkPasswordPolicy, passwordGuidanceText } from "@/lib/password-policy";')
$t = [regex]::Replace($t, '(?m)^(import \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";)\s*$', '')
$t = [regex]::Replace($t, '(?m)^(import \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";)\s*(\r?\n\1)+$', '$1')

# Fix duplicated pwPolicy line and literal `r`n chunk
$t = [regex]::Replace($t, 'const pwTooShort = useMemo\(\(\) => form\.password\.length > 0 && form\.password\.length < 8,\s*\[form\.password\]\);`r`n\s*const pwPolicy = useMemo\(\(\) => checkPasswordPolicy\(form\.password\), \[form\.password\]\);`r`n\s*const pwPolicy = useMemo\(\(\) => checkPasswordPolicy\(form\.password\), \[form\.password\]\);', 'const pwTooShort = useMemo(() => form.password.length > 0 && form.password.length < 8, [form.password]);`r`n  const pwPolicy = useMemo(() => checkPasswordPolicy(form.password), [form.password]);')
Apply-Edit -Rel $uiRel -What 'dedupe imports + dedupe pwPolicy + remove literal `r`n' -NewText $t -OldText $old

$patchRel = 'tools\patch-v2-46-weak-password-guidance.ps1'
$ptext = Read-Utf8NoBom $patchRel
$pold = $ptext

# Replace regRel import Replace-Exact with a pre-state-only Replace-Regex
$find1 = '(?s)\$results\.Add\(\(Replace-Exact\s+-RelPath\s+\$regRel[\s\S]*?-BackupTag\s+''bak_v2_46''\)\)\s*\|\s*Out-Null'
$rep1 = '$results.Add((Replace-Regex -RelPath $regRel -Pattern ' + [char]39 + '(?m)^import bcrypt from "bcryptjs";\s*$' + [char]39 + ' -Replacement ' + [char]39 + 'import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";' + [char]39 + ' -MinReplacements 1 -AlreadyAppliedPattern ' + [char]39 + '(?m)^import \{ checkPasswordPolicy \} from "@/lib/password-policy";\s*$' + [char]39 + ' -BackupTag ' + [char]39 + 'bak_v2_46' + [char]39 + ')) | Out-Null'
if ([regex]::IsMatch($ptext, $find1)) { $ptext = [regex]::Replace($ptext, $find1, $rep1, 1) }

# Replace resetRel import Replace-Exact with a pre-state-only Replace-Regex
$find2 = '(?s)\$results\.Add\(\(Replace-Exact\s+-RelPath\s+\$resetRel[\s\S]*?-BackupTag\s+''bak_v2_46''\)\)\s*\|\s*Out-Null'
$rep2 = '$results.Add((Replace-Regex -RelPath $resetRel -Pattern ' + [char]39 + '(?m)^import bcrypt from "bcryptjs";\s*$' + [char]39 + ' -Replacement ' + [char]39 + 'import bcrypt from "bcryptjs";`r`nimport { checkPasswordPolicy } from "@/lib/password-policy";' + [char]39 + ' -MinReplacements 1 -AlreadyAppliedPattern ' + [char]39 + '(?m)^import \{ checkPasswordPolicy \} from "@/lib/password-policy";\s*$' + [char]39 + ' -BackupTag ' + [char]39 + 'bak_v2_46' + [char]39 + ')) | Out-Null'
if ([regex]::IsMatch($ptext, $find2)) { $ptext = [regex]::Replace($ptext, $find2, $rep2, 1) }

# UI react import: match only when password-policy import is NOT already present directly after
$find3 = '(?s)\$results\.Add\(\(Replace-Regex\s+-RelPath\s+\$uiRel\s+-Pattern\s+''import \\\{ useEffect,[\s\S]*?-BackupTag\s+''bak_v2_46''\)\)\s*\|\s*Out-Null'
$rep3 = '$results.Add((Replace-Regex -RelPath $uiRel -Pattern ' + [char]39 + '(?s)import \{ useEffect, useMemo, useState \} from "react";(?!\r?\nimport \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";)' + [char]39 + ' -Replacement ' + [char]39 + 'import { useEffect, useMemo, useState } from "react";`r`nimport { checkPasswordPolicy, passwordGuidanceText } from "@/lib/password-policy";' + [char]39 + ' -MinReplacements 1 -AlreadyAppliedPattern ' + [char]39 + '(?m)^import \{ checkPasswordPolicy, passwordGuidanceText \} from "@/lib/password-policy";\s*$' + [char]39 + ' -BackupTag ' + [char]39 + 'bak_v2_46' + [char]39 + ')) | Out-Null'
if ([regex]::IsMatch($ptext, $find3)) { $ptext = [regex]::Replace($ptext, $find3, $rep3, 1) }

# UI pwPolicy insert: match only when pwPolicy is NOT already present
$find4 = '(?s)\$results\.Add\(\(Replace-Regex\s+-RelPath\s+\$uiRel\s+-Pattern\s+''const pwTooShort[\s\S]*?checkPasswordPolicy\(form\.password\)[\s\S]*?-BackupTag\s+''bak_v2_46''\)\)\s*\|\s*Out-Null'
$rep4 = '$results.Add((Replace-Regex -RelPath $uiRel -Pattern ' + [char]39 + '(?s)const pwTooShort =\s*useMemo\(\(\) => form\.password\.length > 0 && form\.password\.length < 8, \[form\.password\]\);\s*(?!.*\bpwPolicy\b)' + [char]39 + ' -Replacement ' + [char]39 + 'const pwTooShort = useMemo(() => form.password.length > 0 && form.password.length < 8, [form.password]);`r`n  const pwPolicy = useMemo(() => checkPasswordPolicy(form.password), [form.password]);' + [char]39 + ' -MinReplacements 1 -AlreadyAppliedPattern ' + [char]39 + '\bpwPolicy\b' + [char]39 + ' -BackupTag ' + [char]39 + 'bak_v2_46' + [char]39 + ')) | Out-Null'
if ([regex]::IsMatch($ptext, $find4)) { $ptext = [regex]::Replace($ptext, $find4, $rep4, 1) }

Apply-Edit -Rel $patchRel -What 'fix idempotency for imports + ui pwPolicy' -NewText $ptext -OldText $pold

Write-Host ("Apply: " + [bool]$Apply)
Write-Host "Done."
