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

if ($Branch -ne "fix/TRUST-02-empty-state-trust-copy") {
    throw "Wrong branch. Expected fix/TRUST-02-empty-state-trust-copy but found $Branch"
}

if (-not (Test-Path ".\tools\trust-02-empty-state-trust-copy-check.cjs")) {
    throw "Missing TRUST-02 check file."
}

node .\tools\trust-02-empty-state-trust-copy-check.cjs
