#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

# 1) Remove Bidra Pay future-payment contradiction from messages tip
$msgPath = Join-Path $repoRoot 'app\messages\[id]\page.tsx'
$msg = Get-Content -LiteralPath $msgPath -Raw
$msg = $msg.Replace(
'  Tip: Keep chats about the listing. Be careful sharing contact or payment details — never share passwords or verification codes. When Bidra Pay is live, we’ll recommend paying via your Bidra order page.',
'  Tip: Keep chats about the listing. Use Messages for clarification only. Never share passwords or verification codes, and follow the order and pickup flow shown in-app.'
)
[System.IO.File]::WriteAllText($msgPath, $msg, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $msgPath"

# 2) Strengthen feedback-page navigation affordances
$fbPath = Join-Path $repoRoot 'app\orders\[id]\feedback\page.tsx'
$fb = Get-Content -LiteralPath $fbPath -Raw
$fb = $fb.Replace('className="underline font-semibold"', 'className="bd-btn bd-btn-ghost text-center"')
[System.IO.File]::WriteAllText($fbPath, $fb, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $fbPath"
