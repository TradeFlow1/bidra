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

if ($Branch -ne "fix/AUTH-02-age-phone-gate-consistency") {
    throw "Wrong branch. Expected fix/AUTH-02-age-phone-gate-consistency but found $Branch"
}

if (-not (Test-Path ".\tools\auth-02-age-phone-gate-consistency-check.cjs")) {
    throw "Missing AUTH-02 check file."
}

node .\tools\auth-02-age-phone-gate-consistency-check.cjs
