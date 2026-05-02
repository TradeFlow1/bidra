$ErrorActionPreference = "Stop"
$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$CurrentRoot = (Resolve-Path ".").Path
$ExpectedResolved = (Resolve-Path $ExpectedRoot).Path
if ($CurrentRoot -ine $ExpectedResolved) { throw "Refusing to run outside $ExpectedRoot. Current path: $CurrentRoot" }
if (-not (Test-Path ".\package.json")) { throw "package.json not found at repo root." }
$Branch = (git branch --show-current).Trim()
if ($Branch -ne "fix/PERF-02-mobile-premium-audit") { throw "Wrong branch. Expected fix/PERF-02-mobile-premium-audit but found $Branch" }
node .\tools\perf-02-mobile-premium-check.cjs
