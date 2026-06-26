$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
if (!(Test-Path -LiteralPath ".\package.json") -or !(Test-Path -LiteralPath ".\.git")) { throw "Refusing to run: not repo root." }

$Path = ".\components\marketplace-redesign.tsx"
$Content = Get-Content -LiteralPath $Path -Raw

if ($Content -notmatch "export function AppPanel") {
  $Append = @(
'export function AppPanel({ children, className }: { children: React.ReactNode; className?: string }) {'
'  return <section className={cn("rounded-[28px] border border-[#EDE9FE] bg-white p-5 shadow-[0_18px_50px_rgba(43,16,85,0.07)] sm:p-7", className)}>{children}</section>;'
'}'
' '
)
  Add-Content -LiteralPath $Path -Value $Append -Encoding UTF8
}

if (Test-Path -LiteralPath ".\.next") { Remove-Item -LiteralPath ".\.next" -Recurse -Force }

npm.cmd run build

git add components/marketplace-redesign.tsx
git commit -m "Restore marketplace redesign shared exports"
git push origin premium-purple-visual-overhaul

Write-Host "Marketplace exports repaired, build green, pushed."
