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

if ($Branch -ne "fix/MESSAGE-01-safe-messaging-boundaries") {
    throw "Wrong branch. Expected fix/MESSAGE-01-safe-messaging-boundaries but found $Branch"
}

if (-not (Test-Path ".\tools\message-01-safe-messaging-boundaries-check.cjs")) {
    throw "Missing MESSAGE-01 check file."
}

node .\tools\message-01-safe-messaging-boundaries-check.cjs
