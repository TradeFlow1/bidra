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

function Replace-OnceByAnchors {
  param(
    [string]$RelPath,
    [string]$StartAnchorRegex,
    [string]$EndAnchorRegex,
    [string]$NewMiddle,
    [string]$BackupTag
  )
  $text = Read-FileText -RelPath $RelPath
  $opts = [Text.RegularExpressions.RegexOptions]::Multiline
  $m1 = [regex]::Match($text, $StartAnchorRegex, $opts)
  if (-not $m1.Success) { throw ("Start anchor not found in " + $RelPath) }
  $m2 = [regex]::Match($text, $EndAnchorRegex, $opts)
  if (-not $m2.Success) { throw ("End anchor not found in " + $RelPath) }
  if ($m2.Index -le $m1.Index) { throw ("Anchors out of order in " + $RelPath) }
  $head = $text.Substring(0, $m1.Index + $m1.Length)
  $tail = $text.Substring($m2.Index)
  $updated = $head + $NewMiddle + $tail
  if ($updated -eq $text) { return 0 }
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Rewrite anchored block")) {
      Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag
    }
  }
  return 1
}

function Normalize-ImportsAndEscapes {
  param([string]$RelPath,[string]$BackupTag)
  $text = Read-FileText -RelPath $RelPath
  $orig = $text

  # Convert any literal "\r\n" sequences to real CRLF (only if present).
  if ($text.IndexOf('\r\n', [StringComparison]::Ordinal) -ge 0) {
    $text = $text.Replace('\r\n', "`r`n")
  }

  if ($text -ne $orig) {
    if ($Apply) {
      if ($PSCmdlet.ShouldProcess($RelPath, "Normalize literal escapes")) {
        Write-FileText -RelPath $RelPath -Text $text -BackupTag $BackupTag
      }
    }
    return 1
  }
  return 0
}

function Ensure-Import-After {
  param(
    [string]$RelPath,
    [string]$AfterLineRegex,
    [string]$ExactImportLine,
    [string]$BackupTag
  )
  $text = Read-FileText -RelPath $RelPath
  $opts = [Text.RegularExpressions.RegexOptions]::Multiline
  if ([regex]::IsMatch($text, '(?m)^' + [regex]::Escape($ExactImportLine) + '\s*$', $opts)) { return 0 }

  $m = [regex]::Match($text, $AfterLineRegex, $opts)
  if (-not $m.Success) { throw ("AfterLine not found in " + $RelPath) }
  $insertAt = $m.Index + $m.Length
  $nl = "`r`n"
  $updated = $text.Substring(0, $insertAt) + $nl + $ExactImportLine + $nl + $text.Substring($insertAt)

  if ($updated -eq $text) { return 0 }
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Ensure import")) {
      Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag
    }
  }
  return 1
}

function Dedup-Exact-Lines {
  param([string]$RelPath,[string]$LineText,[string]$BackupTag)
  $text = Read-FileText -RelPath $RelPath
  $lines = $text -split "\r?\n",-1
  $kept = New-Object System.Collections.Generic.List[string]
  $seen = $false
  foreach ($ln in $lines) {
    if ($ln -eq $LineText) {
      if (-not $seen) { $kept.Add($ln) | Out-Null; $seen = $true }
      continue
    }
    $kept.Add($ln) | Out-Null
  }
  $nl = "`r`n"
  $updated = ($kept.ToArray() -join $nl)
  if ($updated -eq $text) { return 0 }
  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($RelPath, "Dedup exact lines")) {
      Write-FileText -RelPath $RelPath -Text $updated -BackupTag $BackupTag
    }
  }
  return 1
}

$tag = 'bak_v2_46_det'
$changes = 0

$regRel   = 'app\api\auth\register\route.ts'
$resetRel = 'app\api\auth\password-reset\confirm\route.ts'
$uiRel    = 'app\auth\register\page.tsx'
$fixRel   = 'tools\bidra-launch-fixes.json'

$changes += (Normalize-ImportsAndEscapes -RelPath $regRel -BackupTag $tag)
$changes += (Ensure-Import-After -RelPath $regRel -AfterLineRegex '(?m)^import bcrypt from "bcryptjs";\s*$' -ExactImportLine 'import { checkPasswordPolicy } from "@/lib/password-policy";' -BackupTag $tag)
$regText = Read-FileText -RelPath $regRel
if ($regText -notmatch 'checkPasswordPolicy\(\s*passwordStr\s*\)') {
  $newMid = "`r`n  if (passwordStr.length < 8) {`r`n    return NextResponse.json({ error: ""Password must be at least 8 characters."" }, { status: 400 });`r`n  }`r`n`r`n  const pw = checkPasswordPolicy(passwordStr);`r`n  if (!pw.ok) {`r`n    return NextResponse.json({ error: pw.reason || ""Password is too weak."" }, { status: 400 });`r`n  }`r`n`r`n"
  $changes += (Replace-OnceByAnchors -RelPath $regRel -StartAnchorRegex '(?s)(?m)^\s*const passwordStr\s*=\s*String\(body\?\.\s*password\s*\?\?\s*""\s*\);\s*$' -EndAnchorRegex '(?m)^\s*if\s*\(\s*username\.length' -NewMiddle $newMid -BackupTag $tag)
}

$changes += (Normalize-ImportsAndEscapes -RelPath $resetRel -BackupTag $tag)
$changes += (Ensure-Import-After -RelPath $resetRel -AfterLineRegex '(?m)^import bcrypt from "bcryptjs";\s*$' -ExactImportLine 'import { checkPasswordPolicy } from "@/lib/password-policy";' -BackupTag $tag)
$resetText = Read-FileText -RelPath $resetRel
if ($resetText -notmatch 'checkPasswordPolicy\(\s*newPassword\s*\)') {
  $newMid2 = "`r`n  if (!token || newPassword.length < 8) {`r`n    return bad(""Invalid token or password too short."");`r`n  }`r`n`r`n  const pw = checkPasswordPolicy(newPassword);`r`n  if (!pw.ok) {`r`n    return bad(pw.reason || ""Password is too weak."");`r`n  }`r`n`r`n"
  $changes += (Replace-OnceByAnchors -RelPath $resetRel -StartAnchorRegex '(?m)^\s*if\s*\(\s*!token\s*\|\|\s*newPassword\.length\s*<\s*8\s*\)\s*\{\s*$' -EndAnchorRegex '(?m)^\s*const\s+tokenHash\s*=\s*' -NewMiddle $newMid2 -BackupTag $tag)
}

$changes += (Normalize-ImportsAndEscapes -RelPath $uiRel -BackupTag $tag)
$importLine = 'import { checkPasswordPolicy, passwordGuidanceText } from "@/lib/password-policy";'
$changes += (Dedup-Exact-Lines -RelPath $uiRel -LineText $importLine -BackupTag $tag)
$uiText = Read-FileText -RelPath $uiRel
if ($uiText -notmatch '\bconst\s+pwPolicy\s*=\s*useMemo\(') {
  # Insert immediately after pwTooShort line
  $pat = '(?m)^(?<ind>\s*)const pwTooShort = useMemo\(\(\) => form\.password\.length > 0 && form\.password\.length < 8, \[form\.password\]\);\s*$'
  $m = [regex]::Match($uiText, $pat, [Text.RegularExpressions.RegexOptions]::Multiline)
  if (-not $m.Success) { throw "UI pwTooShort line not found (anchor drift). Refusing to guess." }
  $ins = $m.Index + $m.Length
  $nl = "`r`n"
  $line2 = ($m.Groups["ind"].Value + 'const pwPolicy = useMemo(() => checkPasswordPolicy(form.password), [form.password]);')
  $updatedUi = $uiText.Substring(0, $ins) + $nl + $line2 + $uiText.Substring($ins)
  if ($updatedUi -ne $uiText) {
    if ($Apply) { if ($PSCmdlet.ShouldProcess($uiRel, "Insert pwPolicy")) { Write-FileText -RelPath $uiRel -Text $updatedUi -BackupTag $tag } }
    $changes += 1
    $uiText = $updatedUi
  }
}

if ($uiText -notmatch 'passwordGuidanceText\(\)' ) {
  # Replace the old helper copy if it exists
  $updatedUi2 = [regex]::Replace($uiText, '(?m)^(\s*)<p className=\{helper\}>Use 8\+ characters\.</p>\s*$', '$1<p className={helper}>{passwordGuidanceText()}</p>')
  if ($updatedUi2 -ne $uiText) {
    if ($Apply) { if ($PSCmdlet.ShouldProcess($uiRel, "Update helper guidance")) { Write-FileText -RelPath $uiRel -Text $updatedUi2 -BackupTag $tag } }
    $changes += 1
    $uiText = $updatedUi2
  }
}

if (Test-Path -LiteralPath (Join-Path $repoRoot $fixRel)) {
  $fixText = Read-FileText -RelPath $fixRel
  $rx = '("Id"\s*:\s*46[\s\S]*?"Done"\s*:\s*)false'
  if ([regex]::IsMatch($fixText, $rx)) {
    $fixUpdated = [regex]::Replace($fixText, $rx, '$1true')
    if ($fixUpdated -ne $fixText) {
      if ($Apply) { if ($PSCmdlet.ShouldProcess($fixRel, "Mark Id 46 Done")) { Write-FileText -RelPath $fixRel -Text $fixUpdated -BackupTag $tag } }
      $changes += 1
    }
  }
}

Write-Host ("Apply: " + ([bool]$Apply))
Write-Host ("Changes: " + $changes)
if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply:"
  Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\patch-v2-46-weak-password-guidance-deterministic.ps1 -Apply"
}
