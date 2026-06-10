$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path (Join-Path $RepoRoot 'package.json'))) {
    throw 'Refusing to run. package.json not found at repo root.'
}

Set-Location $RepoRoot

$Commands = @(
    @{ Name = 'Production readiness gate'; Command = @('node', '.\tools\prod-01-production-readiness-gate-check.cjs') },
    @{ Name = 'Typecheck'; Command = @('npm.cmd', 'run', 'typecheck') },
    @{ Name = 'Regression tests'; Command = @('npm.cmd', 'run', 'test') },
    @{ Name = 'Public smoke tests'; Command = @('npm.cmd', 'run', 'test:smoke') },
    @{ Name = 'Lint'; Command = @('npm.cmd', 'run', 'lint') },
    @{ Name = 'Build'; Command = @('npm.cmd', 'run', 'build') }
)

foreach ($Item in $Commands) {
    Write-Host ''
    Write-Host ('===== ' + $Item.Name + ' =====')

    $Program = $Item.Command[0]
    $Args = @()
    if ($Item.Command.Count -gt 1) {
        $Args = $Item.Command[1..($Item.Command.Count - 1)]
    }

    & $Program @Args

    if ($LASTEXITCODE -ne 0) {
        throw ($Item.Name + ' failed.')
    }
}

Write-Host ''
Write-Host 'LAUNCH_READINESS_LOCAL_GATE_PASSED'
