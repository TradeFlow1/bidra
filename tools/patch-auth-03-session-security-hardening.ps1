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

if ($Branch -ne "fix/AUTH-03-session-security-hardening") {
    throw "Wrong branch. Expected fix/AUTH-03-session-security-hardening but found $Branch"
}

if (-not (Test-Path ".\tools\auth-03-session-security-hardening-check.cjs")) {
    throw "Missing AUTH-03 check file."
}

node .\tools\auth-03-session-security-hardening-check.cjs
