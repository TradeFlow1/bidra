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

if ($Branch -ne "fix/LEGAL-01-policy-consistency") {
    throw "Wrong branch. Expected fix/LEGAL-01-policy-consistency but found $Branch"
}

if (-not (Test-Path ".\tools\legal-01-policy-consistency-check.cjs")) {
    throw "Missing LEGAL-01 check file."
}

node .\tools\legal-01-policy-consistency-check.cjs
