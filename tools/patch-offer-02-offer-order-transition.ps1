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

if ($Branch -ne "fix/OFFER-02-offer-order-transition") {
    throw "Wrong branch. Expected fix/OFFER-02-offer-order-transition but found $Branch"
}

if (-not (Test-Path ".\tools\offer-02-offer-order-transition-check.cjs")) {
    throw "Missing OFFER-02 check file."
}

node .\tools\offer-02-offer-order-transition-check.cjs
