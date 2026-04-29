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

if ($Branch -ne "fix/GROWTH-01-acquisition-activation") {
    throw "Wrong branch. Expected fix/GROWTH-01-acquisition-activation but found $Branch"
}

if (-not (Test-Path ".\tools\growth-01-acquisition-activation-check.cjs")) {
    throw "Missing GROWTH-01 check file."
}

node .\tools\growth-01-acquisition-activation-check.cjs
