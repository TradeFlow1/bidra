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

if ($Branch -ne "fix/TRUST-01-public-trust-pages") {
    throw "Wrong branch. Expected fix/TRUST-01-public-trust-pages but found $Branch"
}

if (-not (Test-Path ".\tools\trust-01-public-trust-pages-check.cjs")) {
    throw "Missing TRUST-01 check file."
}

node .\tools\trust-01-public-trust-pages-check.cjs
