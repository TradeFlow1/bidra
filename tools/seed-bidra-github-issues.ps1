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

if (-not (Test-Path ".\docs\BIDRA_FIX_REGISTER.csv")) {
    throw "Missing .\docs\BIDRA_FIX_REGISTER.csv. Run .\tools\create-bidra-fix-register.ps1 first."
}

$GhCommand = Get-Command gh -ErrorAction SilentlyContinue

if ($null -eq $GhCommand) {
    throw "GitHub CLI gh is not installed or not available on PATH."
}

$AuthOutput = gh auth status 2>&1

if ($LASTEXITCODE -ne 0) {
    $AuthOutput | ForEach-Object { Write-Host $_ }
    throw "GitHub CLI is not authenticated. Run gh auth login first."
}

$Repo = "TradeFlow1/bidra"
$Items = Import-Csv ".\docs\BIDRA_FIX_REGISTER.csv"

$Labels = @()
$Labels += [pscustomobject]([ordered]@{ Name = "P0"; Color = "B60205"; Description = "Launch blocking" })
$Labels += [pscustomobject]([ordered]@{ Name = "P1"; Color = "D93F0B"; Description = "Core flow" })
$Labels += [pscustomobject]([ordered]@{ Name = "P2"; Color = "FBCA04"; Description = "Premium UX" })
$Labels += [pscustomobject]([ordered]@{ Name = "P3"; Color = "0E8A16"; Description = "Growth and polish" })
$Labels += [pscustomobject]([ordered]@{ Name = "process"; Color = "5319E7"; Description = "Process control" })
$Labels += [pscustomobject]([ordered]@{ Name = "github"; Color = "1D76DB"; Description = "GitHub tracking" })
$Labels += [pscustomobject]([ordered]@{ Name = "ci"; Color = "0052CC"; Description = "Continuous integration" })
$Labels += [pscustomobject]([ordered]@{ Name = "testing"; Color = "0052CC"; Description = "Regression tests" })
$Labels += [pscustomobject]([ordered]@{ Name = "trust"; Color = "0E8A16"; Description = "Trust and safety" })
$Labels += [pscustomobject]([ordered]@{ Name = "routing"; Color = "1D76DB"; Description = "Routing" })
$Labels += [pscustomobject]([ordered]@{ Name = "auth"; Color = "D93F0B"; Description = "Authentication" })
$Labels += [pscustomobject]([ordered]@{ Name = "security"; Color = "B60205"; Description = "Security" })
$Labels += [pscustomobject]([ordered]@{ Name = "ux"; Color = "C5DEF5"; Description = "User experience" })
$Labels += [pscustomobject]([ordered]@{ Name = "copy"; Color = "C2E0C6"; Description = "Product copy" })
$Labels += [pscustomobject]([ordered]@{ Name = "search"; Color = "1D76DB"; Description = "Search" })
$Labels += [pscustomobject]([ordered]@{ Name = "listings"; Color = "1D76DB"; Description = "Listings" })
$Labels += [pscustomobject]([ordered]@{ Name = "seller"; Color = "0E8A16"; Description = "Seller flow" })
$Labels += [pscustomobject]([ordered]@{ Name = "watchlist"; Color = "0E8A16"; Description = "Watchlist" })
$Labels += [pscustomobject]([ordered]@{ Name = "messages"; Color = "D93F0B"; Description = "Messaging" })
$Labels += [pscustomobject]([ordered]@{ Name = "safety"; Color = "B60205"; Description = "Marketplace safety" })
$Labels += [pscustomobject]([ordered]@{ Name = "offers"; Color = "D93F0B"; Description = "Offers" })
$Labels += [pscustomobject]([ordered]@{ Name = "api"; Color = "0052CC"; Description = "API" })
$Labels += [pscustomobject]([ordered]@{ Name = "orders"; Color = "D93F0B"; Description = "Orders" })
$Labels += [pscustomobject]([ordered]@{ Name = "feedback"; Color = "D93F0B"; Description = "Feedback" })
$Labels += [pscustomobject]([ordered]@{ Name = "admin"; Color = "5319E7"; Description = "Admin" })
$Labels += [pscustomobject]([ordered]@{ Name = "moderation"; Color = "B60205"; Description = "Moderation" })
$Labels += [pscustomobject]([ordered]@{ Name = "design-system"; Color = "C5DEF5"; Description = "Design system" })
$Labels += [pscustomobject]([ordered]@{ Name = "seo"; Color = "0E8A16"; Description = "SEO" })
$Labels += [pscustomobject]([ordered]@{ Name = "growth"; Color = "0E8A16"; Description = "Growth" })
$Labels += [pscustomobject]([ordered]@{ Name = "performance"; Color = "FBCA04"; Description = "Performance" })
$Labels += [pscustomobject]([ordered]@{ Name = "accessibility"; Color = "FBCA04"; Description = "Accessibility" })

foreach ($Label in $Labels) {
    $ArgsList = @(
        "label",
        "create",
        $Label.Name,
        "-R",
        $Repo,
        "--description",
        $Label.Description,
        "--color",
        $Label.Color,
        "--force"
    )

    & gh @ArgsList | Out-Null
    Write-Host "Ensured label:" $Label.Name
}

$Milestones = $Items | Select-Object -ExpandProperty Milestone -Unique
$CurrentMilestonesJson = gh api "repos/$Repo/milestones?state=all&per_page=100"
$CurrentMilestones = @()

if (-not [string]::IsNullOrWhiteSpace($CurrentMilestonesJson)) {
    $CurrentMilestones = @($CurrentMilestonesJson | ConvertFrom-Json)
}

foreach ($Milestone in $Milestones) {
    if ([string]::IsNullOrWhiteSpace($Milestone)) {
        continue
    }

    $Exists = $false

    foreach ($ExistingMilestone in $CurrentMilestones) {
        if ($ExistingMilestone.title -eq $Milestone) {
            $Exists = $true
        }
    }

    if (-not $Exists) {
        $MilestoneArgs = @(
            "api",
            "repos/$Repo/milestones",
            "-f",
            "title=$Milestone",
            "-f",
            "description=Bidra fix milestone: $Milestone"
        )

        & gh @MilestoneArgs | Out-Null
        Write-Host "Created milestone:" $Milestone

        $CurrentMilestonesJson = gh api "repos/$Repo/milestones?state=all&per_page=100"
        $CurrentMilestones = @($CurrentMilestonesJson | ConvertFrom-Json)
    }
    else {
        Write-Host "Milestone exists:" $Milestone
    }
}

$IssueBodyDir = ".\docs\github-issue-bodies"

if (-not (Test-Path $IssueBodyDir)) {
    New-Item -ItemType Directory -Path $IssueBodyDir | Out-Null
}

foreach ($Item in $Items) {
    $IssueTitle = "[" + $Item.ID + "] " + $Item.Title
    $Search = "in:title " + $Item.ID

    $ExistingJson = gh issue list -R $Repo --state all --search $Search --json number,title --limit 20
    $ExistingIssues = @()

    if (-not [string]::IsNullOrWhiteSpace($ExistingJson)) {
        $ParsedExistingIssues = $ExistingJson | ConvertFrom-Json

        if ($null -ne $ParsedExistingIssues) {
            $ExistingIssues = @($ParsedExistingIssues)
        }
    }

    $AlreadyExists = $false

    foreach ($ExistingIssue in $ExistingIssues) {
        if ($null -eq $ExistingIssue) {
            continue
        }

        $ExistingTitle = [string]$ExistingIssue.title

        if ([string]::IsNullOrWhiteSpace($ExistingTitle)) {
            continue
        }

        if ($ExistingTitle.Contains("[" + $Item.ID + "]")) {
            $AlreadyExists = $true
        }
    }

    if ($AlreadyExists) {
        Write-Host "Issue already exists:" $Item.ID
        continue
    }

    $BodyPath = Join-Path $IssueBodyDir ($Item.ID + ".md")

    $BodyLines = @()
    $BodyLines += "# " + $Item.ID + " - " + $Item.Title
    $BodyLines += ""
    $BodyLines += "**Priority:** " + $Item.Priority
    $BodyLines += ""
    $BodyLines += "**Area:** " + $Item.Area
    $BodyLines += ""
    $BodyLines += "**Milestone:** " + $Item.Milestone
    $BodyLines += ""
    $BodyLines += "## Problem"
    $BodyLines += ""
    $BodyLines += $Item.Description
    $BodyLines += ""
    $BodyLines += "## Acceptance criteria"
    $BodyLines += ""
    $BodyLines += $Item.Acceptance
    $BodyLines += ""
    $BodyLines += "## Regression requirement"
    $BodyLines += ""
    $BodyLines += $Item.Regression
    $BodyLines += ""
    $BodyLines += "## Definition of Done"
    $BodyLines += ""
    $BodyLines += "- Patch is applied by PowerShell script from repo root."
    $BodyLines += "- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git."
    $BodyLines += "- Regression test, smoke test, or explicit route check is added."
    $BodyLines += "- npm run lint passes."
    $BodyLines += "- npm run build passes."
    $BodyLines += "- PR body includes command output and acceptance proof."

    Set-Content -Path $BodyPath -Value $BodyLines -Encoding UTF8

    $CreateArgs = @(
        "issue",
        "create",
        "-R",
        $Repo,
        "--title",
        $IssueTitle,
        "--body-file",
        $BodyPath
    )

    $IssueLabels = $Item.Labels -split ";"

    foreach ($IssueLabel in $IssueLabels) {
        $CleanLabel = $IssueLabel.Trim()

        if ($CleanLabel.Length -gt 0) {
            $CreateArgs += "--label"
            $CreateArgs += $CleanLabel
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($Item.Milestone)) {
        $CreateArgs += "--milestone"
        $CreateArgs += $Item.Milestone
    }

    & gh @CreateArgs
}

Write-Host ""
Write-Host "GitHub issue seeding complete."

