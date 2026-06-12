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
| P1 | Auth and account readiness | Complete | Registration, login, password reset, verification, account profile updates, 18+ checks, terms acceptance, and protected-route redirects are present. Verified by typecheck, launch gate, and public smoke coverage. |
| P2 | Listing creation/editing/deletion/sold state | Complete | Listing creation and image upload paths were already present. Added seller manual sold-state support in edit UI and update API. Delete remains a soft-delete. Guard checks cover create, update, delete, sold-state, and ownership boundaries. |
| P3 | Listing discovery/search/filtering | Complete | Added server-side keyword search for `/listings?q=` and search inputs on desktop/mobile filters. Existing category, price, location, radius, condition, and sort filters remain covered. |
| P4 | Listing detail and seller contact | Complete | Connected the existing multi-image gallery to listing detail pages. Detail pages include seller profile links, seller messaging, reporting, saved-listing controls, and offer/login gates. |
| P5 | Saved listings/watchlist | Complete | Watchlist page, authenticated toggles, status API, saved-listing state, and logged-out prompts are present and covered by smoke and hard-scan routes. |
| P6 | Dashboard and profile pages | Complete | Account dashboard, listing summaries, profile editing, avatar management, activity, restrictions, and public-profile links are present. |
| P7 | Seller profile pages | Complete | Public seller profiles include active seller listings, profile signals, feedback summaries, share actions, unavailable seller handling, and listing watch-state support. |
| P8 | Reports, moderation, and admin tools | Complete | Report submission, report queues, report detail triage, listing moderation controls, admin user controls, audit logs, and role guards are present. |
| P9 | Safety/help/legal/support pages | Complete | Required public pages are present and smoke-tested. Launch-model language is covered by the production readiness gate and redacted name sweep. |
| P10 | SEO, metadata, sitemap, robots | Complete | Added dynamic listing detail metadata with canonical URLs, robots behavior, and social preview data. Sitemap and robots routes are present and build cleanly. |
| P11 | Mobile/responsive polish | Complete | Mobile marketplace browsing, filters, listing detail, saved listings, and account flows are covered by the Playwright hard scan with horizontal overflow checks. |
| P12 | Deployment, env docs, and launch checklist | Complete | Required env vars are documented in `.env.example`, production readiness docs exist, health and admin ops checks are present, and launch gate now clears stale generated build output before its build phase. |

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
- 2026-06-13: Completed P2 by adding seller manual sold-state support in the edit UI and update API, with marketplace UI/API guard coverage.
- 2026-06-13: Completed P3 by wiring `/listings?q=` into server-side keyword search and adding keyword inputs to desktop and mobile filter forms.
- 2026-06-13: Completed P4 by connecting the multi-image listing gallery to listing detail pages.
- 2026-06-13: Completed P10 by adding dynamic listing detail metadata, canonical URLs, social preview metadata, and active/unavailable robots behavior.
- 2026-06-13: Removed prohibited brand-name references from tracked source/docs and removed a tracked temporary generated inventory file. Redacted sweep passed.
- 2026-06-13: Updated the launch gate to clear stale generated build output before its build phase. `npm.cmd run launch:gate` passed.
- 2026-06-13: Final verification passed: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run test:smoke`, `npm.cmd run test:marketplace-ui-flows`, `npm.cmd run test:marketplace-api-guards`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run launch:gate`, and the local production Playwright hard scan.
