$ErrorActionPreference = "Stop"

$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ResolvedRepoRoot = (Resolve-Path $RepoRoot).Path
$ResolvedExpectedRoot = (Resolve-Path $ExpectedRoot).Path

if ($ResolvedRepoRoot -ine $ResolvedExpectedRoot) {
    throw "Refusing to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git. Script resolved repo root as: $ResolvedRepoRoot"
}

Set-Location -Path $ResolvedRepoRoot

if (-not (Test-Path ".\package.json")) {
    throw "package.json not found at repo root."
}

$Branch = (git branch --show-current).Trim()

if ($Branch -ne "fix/CONTROL-02-test-harness") {
    throw "Wrong branch. Expected fix/CONTROL-02-test-harness but found $Branch"
}

$PackagePath = ".\package.json"
$PackageJson = Get-Content -Path $PackagePath -Raw | ConvertFrom-Json

if ($null -eq $PackageJson.scripts) {
    throw "package.json has no scripts object."
}

function Set-PackageScript {
    param(
        [object]$Scripts,
        [string]$Name,
        [string]$Value
    )

    $Existing = $Scripts.PSObject.Properties[$Name]

    if ($null -eq $Existing) {
        $Scripts | Add-Member -MemberType NoteProperty -Name $Name -Value $Value
    }
    else {
        $Existing.Value = $Value
    }
}

Set-PackageScript -Scripts $PackageJson.scripts -Name "typecheck" -Value "tsc --noEmit"
Set-PackageScript -Scripts $PackageJson.scripts -Name "test" -Value "node tools/control-02-regression-check.cjs"
Set-PackageScript -Scripts $PackageJson.scripts -Name "test:smoke" -Value "node tools/control-02-public-route-smoke.cjs"

$PackageOutput = $PackageJson | ConvertTo-Json -Depth 20
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $ResolvedRepoRoot "package.json"), $PackageOutput + [Environment]::NewLine, $Utf8NoBom)

$RegressionPath = ".\tools\control-02-regression-check.cjs"
$RegressionLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    '',
    'function fail(message) {',
    '  console.error("[CONTROL-02] FAIL: " + message);',
    '  process.exitCode = 1;',
    '}',
    '',
    'function pass(message) {',
    '  console.log("[CONTROL-02] PASS: " + message);',
    '}',
    '',
    'function readJson(relativePath) {',
    '  const fullPath = path.join(repoRoot, relativePath);',
    '  return JSON.parse(fs.readFileSync(fullPath, "utf8"));',
    '}',
    '',
    'function assertFile(relativePath) {',
    '  const fullPath = path.join(repoRoot, relativePath);',
    '  if (!fs.existsSync(fullPath)) {',
    '    fail("Missing required file: " + relativePath);',
    '    return false;',
    '  }',
    '  pass("Found " + relativePath);',
    '  return true;',
    '}',
    '',
    'const packageJson = readJson("package.json");',
    'const scripts = packageJson.scripts || {};',
    '',
    'const requiredScripts = {',
    '  "prisma:generate": "prisma generate",',
    '  "build": "next build",',
    '  "lint": "eslint",',
    '  "typecheck": "tsc --noEmit",',
    '  "test": "node tools/control-02-regression-check.cjs",',
    '  "test:smoke": "node tools/control-02-public-route-smoke.cjs"',
    '};',
    '',
    'for (const [name, expected] of Object.entries(requiredScripts)) {',
    '  if (!scripts[name]) {',
    '    fail("Missing package script: " + name);',
    '    continue;',
    '  }',
    '',
    '  if (!String(scripts[name]).includes(expected)) {',
    '    fail("Package script " + name + " does not include expected command: " + expected);',
    '    continue;',
    '  }',
    '',
    '  pass("Package script exists: " + name);',
    '}',
    '',
    'const requiredFiles = [',
    '  "docs/BIDRA_FIX_REGISTER.csv",',
    '  "docs/BIDRA_MILLION_DOLLAR_FIX_PLAN.md",',
    '  "docs/github-issue-bodies/CONTROL-01.md",',
    '  "docs/github-issue-bodies/CONTROL-02.md",',
    '  "tools/create-bidra-fix-register.ps1",',
    '  "tools/seed-bidra-github-issues.ps1"',
    '];',
    '',
    'for (const file of requiredFiles) {',
    '  assertFile(file);',
    '}',
    '',
    'const fixRegisterPath = path.join(repoRoot, "docs", "BIDRA_FIX_REGISTER.csv");',
    'const fixRegister = fs.readFileSync(fixRegisterPath, "utf8");',
    '',
    'const requiredIssueIds = [',
    '  "CONTROL-01",',
    '  "CONTROL-02",',
    '  "CONTROL-03",',
    '  "CONTROL-04",',
    '  "PRODUCT-01",',
    '  "TRUST-01",',
    '  "TRUST-02",',
    '  "ROUTE-01",',
    '  "AUTH-01",',
    '  "AUTH-02",',
    '  "AUTH-03",',
    '  "SEARCH-01",',
    '  "LISTING-01",',
    '  "MESSAGE-01",',
    '  "OFFER-01",',
    '  "OFFER-02",',
    '  "ADMIN-01",',
    '  "SEO-01",',
    '  "GROWTH-01"',
    '];',
    '',
    'for (const issueId of requiredIssueIds) {',
    '  if (!fixRegister.includes(issueId)) {',
    '    fail("Fix register is missing " + issueId);',
    '  } else {',
    '    pass("Fix register contains " + issueId);',
    '  }',
    '}',
    '',
    'if (process.exitCode) {',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'console.log("[CONTROL-02] Regression harness checks completed.");'
)

[System.IO.File]::WriteAllText((Join-Path $ResolvedRepoRoot "tools\control-02-regression-check.cjs"), ($RegressionLines -join [Environment]::NewLine) + [Environment]::NewLine, $Utf8NoBom)

$SmokePath = ".\tools\control-02-public-route-smoke.cjs"
$SmokeLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const appRoot = path.join(repoRoot, "app");',
    '',
    'function fail(message) {',
    '  console.error("[CONTROL-02:SMOKE] FAIL: " + message);',
    '  process.exitCode = 1;',
    '}',
    '',
    'function pass(message) {',
    '  console.log("[CONTROL-02:SMOKE] PASS: " + message);',
    '}',
    '',
    'function isRouteGroup(name) {',
    '  return name.startsWith("(") && name.endsWith(")");',
    '}',
    '',
    'function hasPageForSegments(currentDir, segments, index) {',
    '  if (!fs.existsSync(currentDir)) {',
    '    return false;',
    '  }',
    '',
    '  if (index >= segments.length) {',
    '    return fs.existsSync(path.join(currentDir, "page.tsx")) || fs.existsSync(path.join(currentDir, "page.ts")) || fs.existsSync(path.join(currentDir, "route.ts"));',
    '  }',
    '',
    '  const entries = fs.readdirSync(currentDir, { withFileTypes: true });',
    '  const target = segments[index];',
    '',
    '  const direct = path.join(currentDir, target);',
    '  if (fs.existsSync(direct) && hasPageForSegments(direct, segments, index + 1)) {',
    '    return true;',
    '  }',
    '',
    '  for (const entry of entries) {',
    '    if (!entry.isDirectory()) {',
    '      continue;',
    '    }',
    '',
    '    if (isRouteGroup(entry.name)) {',
    '      if (hasPageForSegments(path.join(currentDir, entry.name), segments, index)) {',
    '        return true;',
    '      }',
    '    }',
    '  }',
    '',
    '  return false;',
    '}',
    '',
    'function assertRoute(route) {',
    '  const segments = route.split("/").filter(Boolean);',
    '  const ok = hasPageForSegments(appRoot, segments, 0);',
    '',
    '  if (!ok) {',
    '    fail("Missing page source for route: " + route);',
    '    return;',
    '  }',
    '',
    '  pass("Route source exists: " + route);',
    '}',
    '',
    'const publicRoutes = [',
    '  "/",',
    '  "/about",',
    '  "/contact",',
    '  "/feedback",',
    '  "/forgot-password",',
    '  "/help",',
    '  "/how-it-works",',
    '  "/legal",',
    '  "/legal/fees",',
    '  "/legal/privacy",',
    '  "/legal/prohibited-items",',
    '  "/legal/terms",',
    '  "/listings",',
    '  "/privacy",',
    '  "/prohibited-items",',
    '  "/support",',
    '  "/terms",',
    '  "/watchlist"',
    '];',
    '',
    'for (const route of publicRoutes) {',
    '  assertRoute(route);',
    '}',
    '',
    'if (process.exitCode) {',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'console.log("[CONTROL-02:SMOKE] Public route smoke checks completed.");'
)

[System.IO.File]::WriteAllText((Join-Path $ResolvedRepoRoot "tools\control-02-public-route-smoke.cjs"), ($SmokeLines -join [Environment]::NewLine) + [Environment]::NewLine, $Utf8NoBom)

Write-Host "CONTROL-02 patch applied."
Write-Host "Updated package scripts and created:"
Write-Host $RegressionPath
Write-Host $SmokePath

git diff --stat
