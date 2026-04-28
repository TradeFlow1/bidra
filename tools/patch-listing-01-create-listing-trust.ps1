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

if ($Branch -ne "fix/LISTING-01-create-listing-trust") {
    throw "Wrong branch. Expected fix/LISTING-01-create-listing-trust but found $Branch"
}

if (-not (Test-Path ".\tools\listing-01-create-listing-trust-check.cjs")) {
    throw "Missing LISTING-01 check file."
}

node .\tools\listing-01-create-listing-trust-check.cjs
