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

$repoRoot = Find-RepoRoot
Set-Location $repoRoot

$libDir = Join-Path $repoRoot 'lib'
if (-not (Test-Path -LiteralPath $libDir)) {
  New-Item -ItemType Directory -Force -Path $libDir | Out-Null
}

$target = Join-Path $libDir 'require-adult.ts'

$content = @(
  'import { redirect } from "next/navigation";'
  'import { auth } from "@/lib/auth";'
  ''
  'export async function requireAdult() {'
  '  const session = await auth();'
  ''
  '  if (!session?.user) {'
  '    redirect("/auth/login");'
  '  }'
  ''
  '  const age = session.user.age;'
  '  if (!age || age < 18) {'
  '    redirect("/");'
  '  }'
  '}'
)

Write-Utf8NoBomLines -File $target -Lines $content
Write-Host ("Created: {0}" -f $target)

Write-Host '== git status =='
git status | Out-Host

Write-Host 'Done.'
