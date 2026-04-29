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

if ($Branch -ne "fix/SEO-01-marketplace-discovery") {
    throw "Wrong branch. Expected fix/SEO-01-marketplace-discovery but found $Branch"
}

if (-not (Test-Path ".\tools\seo-01-marketplace-discovery-check.cjs")) {
    throw "Missing SEO-01 check file."
}

node .\tools\seo-01-marketplace-discovery-check.cjs
