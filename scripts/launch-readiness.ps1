$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path (Join-Path $RepoRoot 'package.json'))) {
    throw 'Refusing to run. package.json not found at repo root.'
}

Set-Location $RepoRoot

$Commands = @(
    @{ Name = 'Production readiness gate'; Command = @('node', '.\tools\prod-01-production-readiness-gate-check.cjs') },
    @{ Name = 'Production deployment verification'; Command = @('npm.cmd', 'run', 'test:production-deployment') },
    @{ Name = 'Marketplace API guards'; Command = @('npm.cmd', 'run', 'test:marketplace-api-guards') },
    @{ Name = 'Marketplace UI flows'; Command = @('npm.cmd', 'run', 'test:marketplace-ui-flows') },
    @{ Name = 'Suburb landing pages'; Command = @('npm.cmd', 'run', 'test:suburb-landing-pages') },
    @{ Name = 'Wanted ads foundation'; Command = @('npm.cmd', 'run', 'test:wanted-ads') },
    @{ Name = 'Seller storefronts'; Command = @('npm.cmd', 'run', 'test:seller-storefronts') },
    @{ Name = 'Map/list browsing'; Command = @('npm.cmd', 'run', 'test:map-list-browsing') },
    @{ Name = 'Promoted listing foundation'; Command = @('npm.cmd', 'run', 'test:promoted-listings') },
    @{ Name = 'Bulk listing/photo improvements'; Command = @('npm.cmd', 'run', 'test:bulk-listing-photos') },
    @{ Name = 'Sell-new validation alignment'; Command = @('npm.cmd', 'run', 'test:sell-new-validation-alignment') },
    @{ Name = 'Persisted search alerts'; Command = @('npm.cmd', 'run', 'test:persisted-search-alerts') },
    @{ Name = 'Watchlist price history'; Command = @('npm.cmd', 'run', 'test:watchlist-price-history') },
    @{ Name = 'Notification preferences'; Command = @('npm.cmd', 'run', 'test:notification-preferences') },
    @{ Name = 'Marketplace originality'; Command = @('npm.cmd', 'run', 'test:marketplace-originality') },
    @{ Name = 'Prisma generate'; Command = @('npm.cmd', 'run', 'prisma:generate') },
    @{ Name = 'Typecheck'; Command = @('npm.cmd', 'run', 'typecheck') },
    @{ Name = 'Regression tests'; Command = @('npm.cmd', 'run', 'test') },
    @{ Name = 'Public smoke tests'; Command = @('npm.cmd', 'run', 'test:smoke') },
    @{ Name = 'Lint'; Command = @('npm.cmd', 'run', 'lint') },
    @{ Name = 'Build'; Command = @('npm.cmd', 'run', 'build') }
)

foreach ($Item in $Commands) {
    Write-Host ''
    Write-Host ('===== ' + $Item.Name + ' =====')

    if ($Item.Name -eq 'Build') {
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    }

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
