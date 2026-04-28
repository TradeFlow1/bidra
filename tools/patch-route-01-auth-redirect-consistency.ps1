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

if ($Branch -ne "fix/ROUTE-01-auth-redirect-consistency") {
    throw "Wrong branch. Expected fix/ROUTE-01-auth-redirect-consistency but found $Branch"
}

if (-not (Test-Path ".\tools\route-01-auth-redirect-consistency-check.cjs")) {
    throw "Missing ROUTE-01 check file."
}

node .\tools\route-01-auth-redirect-consistency-check.cjs
