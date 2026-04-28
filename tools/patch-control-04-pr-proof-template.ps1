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

if ($Branch -ne "fix/CONTROL-04-pr-proof-template") {
    throw "Wrong branch. Expected fix/CONTROL-04-pr-proof-template but found $Branch"
}

$GithubDir = ".github"

if (-not (Test-Path $GithubDir)) {
    New-Item -ItemType Directory -Path $GithubDir | Out-Null
}

$TemplatePath = ".github\pull_request_template.md"
$TemplateLines = @(
    "## Summary",
    "",
    "<!-- What changed? Keep it specific. -->",
    "",
    "## Issue",
    "",
    "Closes #",
    "",
    "## Fix ID",
    "",
    "<!-- Example: CONTROL-04, TRUST-01, AUTH-02 -->",
    "",
    "## Change type",
    "",
    "- [ ] P0 launch blocker",
    "- [ ] P1 core flow",
    "- [ ] P2 polish",
    "- [ ] Process / CI / test only",
    "",
    "## Acceptance proof",
    "",
    "<!-- Paste or summarize proof that the issue acceptance criteria are met. -->",
    "",
    "## Verification commands run",
    "",
    "- [ ] npm.cmd run typecheck",
    "- [ ] npm.cmd run test",
    "- [ ] npm.cmd run test:smoke",
    "- [ ] npm.cmd run lint",
    "- [ ] npm.cmd run build",
    "",
    "## Regression protection",
    "",
    "- [ ] Added or updated regression test",
    "- [ ] Added or updated smoke test",
    "- [ ] Existing test coverage is sufficient because:",
    "",
    "## Screenshots or evidence",
    "",
    "<!-- Required for UI changes. Paste screenshots, Vercel preview links, or before/after notes. -->",
    "",
    "## Risk and rollback",
    "",
    "- Risk level: Low / Medium / High",
    "- Rollback plan:",
    "",
    "## No drift checklist",
    "",
    "- [ ] One issue only",
    "- [ ] No unrelated cleanup",
    "- [ ] Patch was applied by script from repo root",
    "- [ ] No raw errors, permanent loading states, browser prompts, or silent failures introduced"
)

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
$TemplateFullPath = [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $TemplatePath))
[System.IO.File]::WriteAllText($TemplateFullPath, ($TemplateLines -join [Environment]::NewLine) + [Environment]::NewLine, $Utf8NoBom)

$CheckPath = ".\tools\control-04-pr-template-check.cjs"
$CheckLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const templatePath = path.join(repoRoot, ".github", "pull_request_template.md");',
    '',
    'function fail(message) {',
    '  console.error("[CONTROL-04] FAIL: " + message);',
    '  process.exitCode = 1;',
    '}',
    '',
    'function pass(message) {',
    '  console.log("[CONTROL-04] PASS: " + message);',
    '}',
    '',
    'if (!fs.existsSync(templatePath)) {',
    '  fail("Missing .github/pull_request_template.md");',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'const template = fs.readFileSync(templatePath, "utf8");',
    '',
    'const requiredSections = [',
    '  "## Summary",',
    '  "## Issue",',
    '  "## Fix ID",',
    '  "## Change type",',
    '  "## Acceptance proof",',
    '  "## Verification commands run",',
    '  "## Regression protection",',
    '  "## Screenshots or evidence",',
    '  "## Risk and rollback",',
    '  "## No drift checklist"',
    '];',
    '',
    'for (const section of requiredSections) {',
    '  if (!template.includes(section)) {',
    '    fail("Missing PR template section: " + section);',
    '  } else {',
    '    pass("Found PR template section: " + section);',
    '  }',
    '}',
    '',
    'const requiredChecks = [',
    '  "npm.cmd run typecheck",',
    '  "npm.cmd run test",',
    '  "npm.cmd run test:smoke",',
    '  "npm.cmd run lint",',
    '  "npm.cmd run build",',
    '  "One issue only",',
    '  "No unrelated cleanup",',
    '  "Patch was applied by script from repo root"',
    '];',
    '',
    'for (const check of requiredChecks) {',
    '  if (!template.includes(check)) {',
    '    fail("Missing PR template proof item: " + check);',
    '  } else {',
    '    pass("Found PR template proof item: " + check);',
    '  }',
    '}',
    '',
    'if (process.exitCode) {',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'console.log("[CONTROL-04] PR template check completed.");'
)

$CheckFullPath = [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $CheckPath))
[System.IO.File]::WriteAllText($CheckFullPath, ($CheckLines -join [Environment]::NewLine) + [Environment]::NewLine, $Utf8NoBom)

Write-Host "CONTROL-04 patch applied."
Write-Host "Updated:"
Write-Host $TemplatePath
Write-Host $CheckPath

git diff --stat
node .\tools\control-04-pr-template-check.cjs
