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

if ($Branch -ne "fix/AUTH-04-role-clarity") {
    throw "Wrong branch. Expected fix/AUTH-04-role-clarity but found $Branch"
}

if (-not (Test-Path ".\tools\auth-04-role-clarity-check.cjs")) {
    throw "Missing AUTH-04 check file."
}

node .\tools\auth-04-role-clarity-check.cjs
