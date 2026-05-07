# Bidra Production Deployment Verification

Fix ID: PROD-02

This document is the operational verification runbook for confirming Bidra is actually ready online after the repo-level production readiness gate passes.

## Current verified baseline

- `main` contains PROD-01 production readiness gate.
- `node .\tools\prod-01-production-readiness-gate-check.cjs` passes locally.
- `npm.cmd run typecheck` passes locally.
- `npm.cmd run test` passes locally.
- `npm.cmd run test:smoke` passes locally.
- `npm.cmd run lint` passes locally.
- `npm.cmd run build` passes locally.
- GitHub CI on `main` is passing.

## Blocker found during PROD-02 inspection

- Vercel CLI was not installed or not available on PATH, so production project, environment, and deployment verification could not be completed from this workstation.

Install or expose the Vercel CLI before final go-live verification:

```powershell
npm.cmd install --global vercel
vercel --version
```

Then authenticate/link as needed:

```powershell
vercel login
vercel link
```

## Required Vercel checks

Run from the repository root after Vercel CLI is available:

```powershell
vercel --version
vercel project ls
vercel env ls
vercel ls
```

Confirm the production project has these required environment variables configured:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

Optional variables should be reviewed before enabling related features:

- `DATABASE_URL_UNPOOLED`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `BLOB_READ_WRITE_TOKEN`
- `FT_ENABLED`
- `PHONE_GATE_ENABLED`

## Required deployment checks

- Latest production deployment is built from current `main`.
- Latest production deployment commit matches `git rev-parse origin/main`.
- GitHub Actions CI for the `main` push is successful.
- Vercel production deployment is successful.
- Preview deployments do not block production go-live.

## Required runtime checks

After deployment, verify these URLs against the production domain:

```powershell
$baseUrl = "https://www.bidra.com.au"
Invoke-WebRequest -Uri ($baseUrl + "/api/health") -UseBasicParsing
Invoke-WebRequest -Uri ($baseUrl + "/legal/fees") -UseBasicParsing
Invoke-WebRequest -Uri ($baseUrl + "/support") -UseBasicParsing
Invoke-WebRequest -Uri ($baseUrl + "/how-it-works") -UseBasicParsing
```

For `/api/health`, confirm:

- HTTP status is 200.
- Response contains `ok: true`.
- Response contains `deployment`.
- Response contains `paymentReadiness`.
- Response contains `checks`.
- Response contains `env`.
- `Cache-Control` contains `no-store`.
- Required environment entries are present and true.
- Database check is `ok`.
- Payment model is `external_handover` and `inAppPaymentsEnabled` is false.

## Required database checks

Production migration verification requires production database credentials. Use a secure local file such as `.env.vercel.prodcheck`, which must not be committed.

```powershell
node .\tools\inspect-prod-migrations.js
node .\tools\inspect-prod-counts.js
```

Expected migration names include:

- `20251226190000_baseline`
- `20251226203000_feedback_patch`
- `20260213182735_drift_baseline_applied`
- `20260214095423_v2_offer_expires_at`
- `20260407_chunk1_direct_reschedule_flow_manual`

## Go-live decision

Do not mark Bidra production-ready until all of these are true:

- Vercel CLI verification completed.
- Required production env vars are present.
- Production deployment is built from current `main`.
- `/api/health` returns `ok: true` on the production domain.
- Production database migrations are present and not rolled back.
- Production admin can access `/admin/ops`.
- Current launch model remains platform-only with in-app payments disabled.

## Rollback

If any production check fails after deployment:

- Roll back to the last known-good production deployment in Vercel.
- Re-check `/api/health`.
- Preserve failing URL, response body, deployment URL, commit SHA, and timestamp.
- Open a scoped fix issue before attempting another production launch.
