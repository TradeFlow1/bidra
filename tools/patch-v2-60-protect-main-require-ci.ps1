#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
  $fixed = 'C:\dev\bidra-main'
  if (Test-Path -LiteralPath (Join-Path $fixed 'package.json')) { return $fixed }
  $p = Split-Path -Parent $MyInvocation.MyCommand.Path
  while ($p -and $p -ne (Split-Path $p -Parent)) {
    if (Test-Path -LiteralPath (Join-Path $p 'package.json')) { return $p }
    $p = Split-Path $p -Parent
  }
  throw 'Not at Bidra repo root (package.json not found)'
}

function Require-Command {
  param([string]$Name)
  $c = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $c) { throw "Missing required command: $Name" }
}

function Get-OwnerRepoFromOrigin {
  $u = (git remote get-url origin 2>$null)
  if (-not $u) { throw 'Unable to read git origin remote URL.' }
  $u = $u.Trim()

  # https://github.com/OWNER/REPO(.git)
  $m = [regex]::Match($u, 'github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$')
  if (-not $m.Success) { throw ("Could not parse owner/repo from origin: {0}" -f $u) }
  return ("{0}/{1}" -f $m.Groups['owner'].Value, $m.Groups['repo'].Value)
}

function Get-LatestSuccessfulCiHeadSha {
  param([string]$OwnerRepo)

  # Find latest successful run of workflow "ci.yml" on main, then return head_sha
  $runs = gh api ("repos/{0}/actions/workflows/ci.yml/runs?branch=main&per_page=20" -f $OwnerRepo) | ConvertFrom-Json
  if (-not $runs -or -not $runs.workflow_runs) { throw 'No workflow runs found for ci.yml.' }

  $ok = $null
  foreach ($r in $runs.workflow_runs) {
    if ($r.conclusion -eq 'success' -and $r.head_sha) { $ok = $r; break }
  }
  if (-not $ok) { throw 'No successful ci.yml runs found to derive required check name.' }
  return [string]$ok.head_sha
}

function Get-CheckRunNameFromSha {
  param([string]$OwnerRepo,[string]$Sha)

  $checks = gh api ("repos/{0}/commits/{1}/check-runs?per_page=100" -f $OwnerRepo, $Sha) | ConvertFrom-Json
  if (-not $checks -or -not $checks.check_runs) { throw 'No check-runs found for derived SHA.' }

  # Prefer GitHub Actions check run named "build" if present, otherwise first Actions check-run
  $pick = $null
  foreach ($cr in $checks.check_runs) {
    if ($cr.app -and $cr.app.slug -eq 'github-actions' -and $cr.name -eq 'build') { $pick = $cr; break }
  }
  if (-not $pick) {
    foreach ($cr in $checks.check_runs) {
      if ($cr.app -and $cr.app.slug -eq 'github-actions') { $pick = $cr; break }
    }
  }
  if (-not $pick) {
    $pick = $checks.check_runs[0]
  }
  return [string]$pick.name
}

$repoRoot = Find-RepoRoot
Set-Location $repoRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) { throw "Guard failed: $repoRoot" }

Require-Command -Name git
Require-Command -Name gh

$ownerRepo = Get-OwnerRepoFromOrigin
Write-Host ("Repo: {0}" -f $ownerRepo)

$sha = Get-LatestSuccessfulCiHeadSha -OwnerRepo $ownerRepo
Write-Host ("Derive checks from SHA: {0}" -f $sha)

$checkName = Get-CheckRunNameFromSha -OwnerRepo $ownerRepo -Sha $sha
Write-Host ("Required check: {0}" -f $checkName)

$body = @{
  required_status_checks = @{ strict = $true; contexts = @($checkName) }
  enforce_admins = $false
  required_pull_request_reviews = $null
  restrictions = $null
} | ConvertTo-Json -Depth 6

Write-Host 'Applying branch protection to main...'
gh api -X PUT ("repos/{0}/branches/main/protection" -f $ownerRepo) -H "Accept: application/vnd.github+json" -f body="$body" | Out-Null

Write-Host 'Verifying protection...'
$p = gh api ("repos/{0}/branches/main/protection" -f $ownerRepo) | ConvertFrom-Json
Write-Host ("Protection enabled. Required contexts: {0}" -f (($p.required_status_checks.contexts) -join ', '))
Write-Host 'Done.'
