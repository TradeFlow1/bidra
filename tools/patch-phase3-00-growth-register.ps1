$ErrorActionPreference = "Stop"
$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$CurrentRoot = (Resolve-Path ".").Path
$ExpectedResolved = (Resolve-Path $ExpectedRoot).Path
if ($CurrentRoot -ine $ExpectedResolved) { throw "Refusing to run outside $ExpectedRoot. Current path: $CurrentRoot" }
if (-not (Test-Path ".\package.json")) { throw "package.json not found at repo root." }
$Branch = (git branch --show-current).Trim()
if ($Branch -ne "chore/PHASE3-00-growth-register") { throw "Wrong branch. Expected chore/PHASE3-00-growth-register but found $Branch" }
node .\tools\phase3-00-growth-register-check.cjs
