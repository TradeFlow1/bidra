#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

# 1) Remove Bidra Pay contradiction by replacing the exact visible line with ASCII-safe text
$msgPath = Join-Path $repoRoot 'app\messages\[id]\page.tsx'
$msgRows = Get-Content -LiteralPath $msgPath
for ($i = 0; $i -lt $msgRows.Count; $i++) {
    if ($msgRows[$i] -like '*When Bidra Pay is live*') {
        $msgRows[$i] = '  Tip: Keep chats about the listing. Use Messages for clarification only. Never share passwords or verification codes, and follow the order and pickup flow shown in-app.'
    }
}
[System.IO.File]::WriteAllLines($msgPath, $msgRows, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $msgPath"

# 2) Strengthen feedback-page navigation affordances
$fbPath = Join-Path $repoRoot 'app\orders\[id]\feedback\page.tsx'
$fb = Get-Content -LiteralPath $fbPath -Raw
$fb = $fb.Replace('className="underline font-semibold"', 'className="bd-btn bd-btn-ghost text-center"')
[System.IO.File]::WriteAllText($fbPath, $fb, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $fbPath"
