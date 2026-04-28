$ErrorActionPreference = "Stop"

$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$CurrentRoot = (Resolve-Path ".").Path
$ExpectedResolved = (Resolve-Path $ExpectedRoot).Path

if ($CurrentRoot -ine $ExpectedResolved) {
    throw "Refusing to run outside $ExpectedRoot. Current path: $CurrentRoot"
}

if (-not (Test-Path ".\package.json")) {
    throw "package.json not found at repo root."
}

$Branch = (git branch --show-current).Trim()

if ($Branch -ne "fix/SEARCH-01-marketplace-search-quality") {
    throw "Wrong branch. Expected fix/SEARCH-01-marketplace-search-quality but found $Branch"
}

if (-not (Test-Path ".\tools\search-01-marketplace-search-quality-check.cjs")) {
    throw "Missing SEARCH-01 check file."
}

node .\tools\search-01-marketplace-search-quality-check.cjs
