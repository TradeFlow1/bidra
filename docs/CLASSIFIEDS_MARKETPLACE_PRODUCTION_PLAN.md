# Classifieds Marketplace Production Plan

This file is the persistent production checklist for the current autonomous build pass. It keeps the work focused on a professional Australian peer-to-peer classifieds MVP with account access, listing management, discovery, seller contact, saved listings, moderation, public trust pages, SEO, responsive polish, and deployment readiness.

Guardrails:
- Use neutral marketplace language only.
- Keep checkout, money custody, protected-payment, delivery orchestration, handover scheduling, refund handling, and forced-completion workflows out of scope.
- Do not print or commit secrets.
- Do not commit generated reports, build output, local uploads, or local environment files.
- Keep production checks repeatable with PowerShell 5.1-compatible commands.

## Execution Status

| Phase | Scope | Status | Notes |
| --- | --- | --- | --- |
| P0 | Production safety and test harness | Complete | Fixed the local Playwright baseURL false positive. Clean production build passed after clearing stale generated output. Local hard scan passed across all configured browsers. Generated scan artifacts were removed. |
| P1 | Auth and account readiness | In progress | Confirm registration, login, verification, password reset, account profile, and protected-route behavior. |
| P2 | Listing creation/editing/deletion/sold state | Pending | Confirm users can create listings with multiple images, edit, delete, and mark sold without adding out-of-scope transaction flows. |
| P3 | Listing discovery/search/filtering | Pending | Confirm browse, category, search, location, type, and filter behavior on desktop and mobile. |
| P4 | Listing detail and seller contact | Pending | Confirm detail pages, image galleries, seller context, questions, reports, and message-seller entry points. |
| P5 | Saved listings/watchlist | Pending | Confirm saved-state APIs, authenticated toggles, watchlist page, and empty states. |
| P6 | Dashboard and profile pages | Pending | Confirm dashboards, account pages, listing management, and user-facing profile data. |
| P7 | Seller profile pages | Pending | Confirm public seller pages, seller listings, profile trust context, and unavailable seller handling. |
| P8 | Reports, moderation, and admin tools | Pending | Confirm report submission, admin queues, admin listing/user controls, audit history, and role guards. |
| P9 | Safety/help/legal/support pages | Pending | Confirm public information pages align with the classifieds launch model and avoid unsupported claims. |
| P10 | SEO, metadata, sitemap, robots | Pending | Confirm route metadata, canonical URLs, sitemap, robots, and environment-driven site URL behavior. |
| P11 | Mobile/responsive polish | Pending | Confirm key public and authenticated flows avoid horizontal overflow and remain usable on small screens. |
| P12 | Deployment, env docs, and launch checklist | Pending | Confirm required env vars, database setup, deployment notes, health checks, and launch gate outputs. |

## Verification Commands

Run these before final sign-off when local dependencies and environment variables are available:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:smoke
npm.cmd run test:marketplace-ui-flows
npm.cmd run test:marketplace-api-guards
npm.cmd run lint
npm.cmd run build
npm.cmd run launch:gate
```

Local production hard scan:

```powershell
Remove-Item -Recurse -Force playwright-report, test-results -ErrorAction SilentlyContinue
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw "Build failed." }
$Server = Start-Process npm.cmd -ArgumentList "run","start" -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 12
try {
    $Ready = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
    Write-Host "Local status:" $Ready.StatusCode
    npm.cmd run qa:hard
    if ($LASTEXITCODE -ne 0) { throw "Playwright hard scan failed." }
}
finally {
    Stop-Process -Id $Server.Id -Force -ErrorAction SilentlyContinue
}
Remove-Item -Recurse -Force playwright-report, test-results -ErrorAction SilentlyContinue
git status --short
```

## Work Log

- 2026-06-13: Created the production plan and fixed the local hard-scan URL leak false positive by allowing links that resolve to the configured Playwright baseURL origin.
- 2026-06-13: Verified P0 with `npm.cmd run build` and the local production Playwright hard scan. The hard scan passed 8 tests across desktop and mobile browser projects.
