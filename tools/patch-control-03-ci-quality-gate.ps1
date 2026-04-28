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

if ($Branch -ne "fix/CONTROL-03-ci-quality-gate") {
    throw "Wrong branch. Expected fix/CONTROL-03-ci-quality-gate but found $Branch"
}

$WorkflowPath = ".github\workflows\ci.yml"

if (-not (Test-Path $WorkflowPath)) {
    throw "Missing CI workflow: $WorkflowPath"
}

$WorkflowLines = @(
    "name: CI",
    "",
    "on:",
    "  pull_request:",
    "  push:",
    "    branches:",
    "      - main",
    "",
    "jobs:",
    "  build:",
    "    runs-on: ubuntu-latest",
    "",
    "    steps:",
    "      - name: Checkout",
    "        uses: actions/checkout@v4",
    "",
    "      - name: Setup Node",
    "        uses: actions/setup-node@v4",
    "        with:",
    "          node-version: 20",
    "          cache: npm",
    "",
    "      - name: Install dependencies",
    "        run: npm ci",
    "",
    "      - name: Generate Prisma client",
    "        run: npm run prisma:generate",
    "",
    "      - name: Typecheck",
    "        run: npm run typecheck",
    "",
    "      - name: Regression tests",
    "        run: npm run test",
    "",
    "      - name: Smoke tests",
    "        run: npm run test:smoke",
    "",
    "      - name: Lint",
    "        run: npm run lint",
    "",
    "      - name: Build",
    "        run: npm run build"
)

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
$WorkflowFullPath = [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $WorkflowPath))
[System.IO.File]::WriteAllText($WorkflowFullPath, ($WorkflowLines -join [Environment]::NewLine) + [Environment]::NewLine, $Utf8NoBom)

$CiCheckPath = ".\tools\control-03-ci-quality-gate-check.cjs"
$CiCheckLines = @(
    'const fs = require("fs");',
    'const path = require("path");',
    '',
    'const repoRoot = path.resolve(__dirname, "..");',
    'const workflowPath = path.join(repoRoot, ".github", "workflows", "ci.yml");',
    '',
    'function fail(message) {',
    '  console.error("[CONTROL-03] FAIL: " + message);',
    '  process.exitCode = 1;',
    '}',
    '',
    'function pass(message) {',
    '  console.log("[CONTROL-03] PASS: " + message);',
    '}',
    '',
    'if (!fs.existsSync(workflowPath)) {',
    '  fail("Missing workflow file: .github/workflows/ci.yml");',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'const workflow = fs.readFileSync(workflowPath, "utf8");',
    '',
    'const requiredSnippets = [',
    '  "actions/checkout@v4",',
    '  "actions/setup-node@v4",',
    '  "node-version: 20",',
    '  "cache: npm",',
    '  "npm ci",',
    '  "npm run prisma:generate",',
    '  "npm run typecheck",',
    '  "npm run test",',
    '  "npm run test:smoke",',
    '  "npm run lint",',
    '  "npm run build"',
    '];',
    '',
    'for (const snippet of requiredSnippets) {',
    '  if (!workflow.includes(snippet)) {',
    '    fail("CI workflow is missing: " + snippet);',
    '  } else {',
    '    pass("CI workflow contains: " + snippet);',
    '  }',
    '}',
    '',
    'const order = [',
    '  "npm ci",',
    '  "npm run prisma:generate",',
    '  "npm run typecheck",',
    '  "npm run test",',
    '  "npm run test:smoke",',
    '  "npm run lint",',
    '  "npm run build"',
    '];',
    '',
    'let previousIndex = -1;',
    '',
    'for (const command of order) {',
    '  const index = workflow.indexOf(command);',
    '',
    '  if (index === -1) {',
    '    continue;',
    '  }',
    '',
    '  if (index <= previousIndex) {',
    '    fail("CI command is out of order: " + command);',
    '  } else {',
    '    pass("CI command order is valid: " + command);',
    '  }',
    '',
    '  previousIndex = index;',
    '}',
    '',
    'if (process.exitCode) {',
    '  process.exit(process.exitCode);',
    '}',
    '',
    'console.log("[CONTROL-03] CI quality gate check completed.");'
)

$CiCheckFullPath = [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $CiCheckPath))
[System.IO.File]::WriteAllText($CiCheckFullPath, ($CiCheckLines -join [Environment]::NewLine) + [Environment]::NewLine, $Utf8NoBom)

Write-Host "CONTROL-03 patch applied."
Write-Host "Updated:"
Write-Host $WorkflowPath
Write-Host $CiCheckPath

git diff --stat
node .\tools\control-03-ci-quality-gate-check.cjs
