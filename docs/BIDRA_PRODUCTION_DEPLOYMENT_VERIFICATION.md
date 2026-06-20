# Bidra Production Deployment Verification

Fix ID: PROD-02

This is the operational verification runbook for confirming Bidra is ready online after the repository-level launch gate passes.

## Required local release gate

Run on the exact branch or commit intended for release:

```powershell
npm.cmd run launch:gate
```

Do not deploy production traffic unless the command ends with:

```text
LAUNCH_READINESS_LOCAL_GATE_PASSED
```

## Required production environment

Confirm the production host has these required variables configured:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

Optional integrations can be absent for the current platform-only launch model, but must be reviewed before enabling related features:

- `DATABASE_URL_UNPOOLED`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `BLOB_READ_WRITE_TOKEN`
- `FT_ENABLED`
- `PHONE_GATE_ENABLED`

## Deployment checks

Before marking the deployment live-ready, confirm:

- Production deployment is built from the current release commit on `main`.
- Production database migrations have been applied with `npm.cmd run db:deploy` or the host equivalent.
- A production admin account exists.
- The production admin account can access `/admin/ops`.
- Public legal, fees, support, and how-it-works pages match the platform-only launch model.

## Runtime checks

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
- Payment model is `external_handover`.
- `inAppPaymentsEnabled` is false.

For `/api/stripe/webhook`, confirm it still returns `PAYMENTS_DISABLED` for the current launch model.

## Go-live decision

Do not mark Bidra production-ready until all of these are true:

- `npm.cmd run launch:gate` passes on the release commit.
- Required production environment variables are present.
- Production deployment is built from current `main`.
- `/api/health` returns `ok: true` on the production domain.
- Production database migrations are applied.
- Production admin can access `/admin/ops`.
- Current launch model remains platform-only.
- In-app marketplace payment capture remains disabled.
- No escrow, wallet, payout, refund decision, shipping, pickup scheduling, or forced completion workflow is active.

## Rollback

If any production check fails after deployment:

- Roll back to the last known-good production deployment in the host dashboard.
- Re-check `/api/health`.
- Preserve failing URL, response body, deployment URL, commit SHA, and timestamp.
- Open a scoped fix issue before attempting another production launch.
