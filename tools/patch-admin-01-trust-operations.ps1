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

if ($Branch -ne "fix/ADMIN-01-trust-operations") {
    throw "Wrong branch. Expected fix/ADMIN-01-trust-operations but found $Branch"
}

if (-not (Test-Path ".\tools\admin-01-trust-operations-check.cjs")) {
    throw "Missing ADMIN-01 check file."
}

node .\tools\admin-01-trust-operations-check.cjs
