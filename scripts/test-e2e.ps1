param(
    [string]$BaseUrl = ''
)

$RepoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path (Join-Path $RepoRoot 'package.json'))) {
    throw 'Refusing to run. package.json not found at repo root.'
}

Set-Location $RepoRoot

$EnvPath = Join-Path $RepoRoot '.env.test'
if (Test-Path $EnvPath) {
    $EnvLines = Get-Content $EnvPath
    foreach ($Line in $EnvLines) {
        $Trimmed = $Line.Trim()
        if ($Trimmed.Length -gt 0 -and -not $Trimmed.StartsWith('#') -and $Trimmed.Contains('=')) {
            $Parts = $Trimmed.Split('=', 2)
            [Environment]::SetEnvironmentVariable($Parts[0], $Parts[1], 'Process')
        }
    }
}

if ($BaseUrl -ne '') {
    $env:BIDRA_TEST_URL = $BaseUrl
}

if (-not $env:BIDRA_TEST_URL) {
    $env:BIDRA_TEST_URL = 'http://localhost:3000'
}

$IsLocalE2eUrl = $env:BIDRA_TEST_URL -match '^https?://(localhost|127\.0\.0\.1)(:\d+)?(/|$)'
if ($IsLocalE2eUrl) {
    $env:BIDRA_TEST_AUTH_ENABLED = '1'
} else {
    Remove-Item Env:\BIDRA_TEST_AUTH_ENABLED -ErrorAction SilentlyContinue
}

& npx.cmd playwright test --grep-invert "Disposable authenticated marketplace browser flows"

if ($LASTEXITCODE -ne 0) {
    Write-Host 'Some Playwright tests failed. Opening report if available.'
}

if (Test-Path (Join-Path $RepoRoot 'playwright-report')) {
    & npx.cmd playwright show-report
} else {
    Write-Host 'No Playwright report found.'
}
