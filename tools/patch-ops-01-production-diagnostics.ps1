$ErrorActionPreference = "Stop"
$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$CurrentRoot = (Resolve-Path ".").Path
$ExpectedResolved = (Resolve-Path $ExpectedRoot).Path
if ($CurrentRoot -ine $ExpectedResolved) { throw "Refusing to run outside $ExpectedRoot. Current path: $CurrentRoot" }
if (-not (Test-Path ".\package.json")) { throw "package.json not found at repo root." }
$Branch = (git branch --show-current).Trim()
if ($Branch -ne "fix/OPS-01-production-diagnostics") { throw "Wrong branch. Expected fix/OPS-01-production-diagnostics but found $Branch" }
node .\tools\ops-01-production-diagnostics-check.cjs
