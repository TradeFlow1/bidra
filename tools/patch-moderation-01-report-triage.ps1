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

if ($Branch -ne "fix/MODERATION-01-report-triage") {
    throw "Wrong branch. Expected fix/MODERATION-01-report-triage but found $Branch"
}

if (-not (Test-Path ".\tools\moderation-01-report-triage-check.cjs")) {
    throw "Missing MODERATION-01 check file."
}

node .\tools\moderation-01-report-triage-check.cjs
