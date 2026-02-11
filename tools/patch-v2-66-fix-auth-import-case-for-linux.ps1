#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $MyInvocation.MyCommand.Path
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

function Write-Utf8NoBomLines {
  param([string]$File,[string[]]$Lines)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $full = [System.IO.Path]::GetFullPath($File)
  [System.IO.File]::WriteAllLines($full, $Lines, $utf8NoBom)
}

function Rename-CaseSafe {
  param([string]$From,[string]$To)
  if (-not (Test-Path -LiteralPath $From)) { throw ("Missing path: {0}" -f $From) }
  $fromFull = [System.IO.Path]::GetFullPath($From)
  $toFull = [System.IO.Path]::GetFullPath($To)
  if ($fromFull -eq $toFull) { return }

  $dir = Split-Path -Parent $fromFull
  $leafTemp = ('.__case_tmp_{0}' -f ([Guid]::NewGuid().ToString('N')))
  $tmp = Join-Path $dir $leafTemp

  # Case-only renames on Windows need a hop via a temp name
  Move-Item -LiteralPath $fromFull -Destination $tmp -Force
  Move-Item -LiteralPath $tmp -Destination $toFull -Force
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

# 1) Find any lib/auth.* OR lib/Auth.* OR lib/auth/index.* etc (case-insensitive)
$libDir = Join-Path $repoRoot 'lib'
if (-not (Test-Path -LiteralPath $libDir)) { throw ("Missing lib directory: {0}" -f $libDir) }

$all = Get-ChildItem -LiteralPath $libDir -Recurse -Force -File
$candidates = @()
foreach ($f in $all) {
  $rel = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
  $relLower = $rel.ToLowerInvariant()
  if ($relLower -eq 'lib\auth.ts' -or $relLower -eq 'lib\auth.tsx' -or $relLower -eq 'lib\auth.js' -or $relLower -eq 'lib\auth.jsx') { $candidates += $f }
  if ($relLower -eq 'lib\auth\index.ts' -or $relLower -eq 'lib\auth\index.tsx' -or $relLower -eq 'lib\auth\index.js' -or $relLower -eq 'lib\auth\index.jsx') { $candidates += $f }
  if ($relLower -eq 'lib\auth\index.mjs' -or $relLower -eq 'lib\auth.mjs') { $candidates += $f }
  # also catch common case-mismatch variants like lib\Auth.ts
  if ($relLower -match '^lib\\auth(\.|\\index\.)') { if (-not ($candidates -contains $f)) { $candidates += $f } }
}

if (-not $candidates -or $candidates.Count -eq 0) {
  Write-Host 'Did not find any lib/auth module files. Listing files containing "auth" under lib/ for diagnosis:' 
  Get-ChildItem -LiteralPath $libDir -Recurse -Force -File | Where-Object { $_.Name.ToLowerInvariant().Contains('auth') } | Select-Object FullName | Format-Table -AutoSize | Out-Host
  throw 'No lib/auth module found to normalize. Create lib/auth.ts or adjust imports to match existing file.'
}

# Prefer a single-file module if present; otherwise keep index.ts/tsx
$pick = $null
foreach ($f in $candidates) {
  $rel = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
  $relLower = $rel.ToLowerInvariant()
  if ($relLower -eq 'lib\auth.ts' -or $relLower -eq 'lib\auth.tsx' -or $relLower -eq 'lib\auth.js' -or $relLower -eq 'lib\auth.jsx') { $pick = $f; break }
}
if (-not $pick) {
  foreach ($f in $candidates) {
    $rel = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
    $relLower = $rel.ToLowerInvariant()
    if ($relLower -match '^lib\\auth\\index\.(ts|tsx|js|jsx|mjs)$') { $pick = $f; break }
  }
}
if (-not $pick) { $pick = $candidates[0] }

# 2) Normalize casing to lib/auth.(ext) OR lib/auth/index.(ext)
$pickedRel = $pick.FullName.Substring($repoRoot.Length).TrimStart('\','/')
$pickedLower = $pickedRel.ToLowerInvariant()

if ($pickedLower -match '^lib\\auth\\index\.(ts|tsx|js|jsx|mjs)$') {
  $ext = [System.IO.Path]::GetExtension($pick.Name)
  $authDir = Join-Path $libDir 'auth'
  if (-not (Test-Path -LiteralPath $authDir)) { New-Item -ItemType Directory -Force -Path $authDir | Out-Null }
  $target = Join-Path $authDir ("index{0}" -f $ext)
  if ($pick.FullName -ne $target) {
    Write-Host ("Renaming module to: {0}" -f $target)
    Rename-CaseSafe -From $pick.FullName -To $target
  }
} else {
  $ext = [System.IO.Path]::GetExtension($pick.Name)
  $target = Join-Path $libDir ("auth{0}" -f $ext)
  if ($pick.FullName -ne $target) {
    Write-Host ("Renaming module to: {0}" -f $target)
    Rename-CaseSafe -From $pick.FullName -To $target
  }
}

# 3) Rewrite imports across repo to "@/lib/auth" (stable, lowercase)
$exclude = @('\node_modules\','\.next\','\.git\','\.vercel\')
$files = Get-ChildItem -LiteralPath $repoRoot -Recurse -Force -File | Where-Object {
  $p = $_.FullName
  foreach ($x in $exclude) { if ($p -like "*$x*") { return $false } }
  return $true
}

$changed = 0
foreach ($f in $files) {
  $ext = $f.Extension.ToLowerInvariant()
  if (@('.ts','.tsx','.js','.jsx','.mjs','.cjs') -notcontains $ext) { continue }
  $txt = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
  $before = $txt

  # normalize common variants
  $txt = $txt -replace '@/lib/Auth','@/lib/auth'
  $txt = $txt -replace '@/lib/auth/index','@/lib/auth'
  $txt = $txt -replace '@/lib/Auth/index','@/lib/auth'

  if ($txt -ne $before) {
    Set-Content -LiteralPath $f.FullName -Value $txt -Encoding UTF8
    $changed++
  }
}

Write-Host ("Updated imports in {0} file(s)." -f $changed)
Write-Host '== git status =='
git status | Out-Host
Write-Host '== git diff --name-only =='
git diff --name-only | Out-Host
Write-Host 'Done.'
