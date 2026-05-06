# Bidra Production Readiness Gate

Fix ID: PROD-01

This document is the go/no-go gate for putting Bidra online. It is intentionally practical: verify runtime health, launch-model truth, rollback readiness, and no payment/escrow drift before exposing production traffic.

## Launch model that must remain true

- Bidra is a platform marketplace only.
- Bidra is not a seller, auctioneer, payment provider, escrow service, refund decision-maker, shipping provider, or pickup scheduler.
- Buyers and sellers arrange payment, pickup, postage, refunds, and handover details directly in Bidra Messages.
- Orders are sold-item records only.
- There is no forced in-app Pay now, checkout, escrow, shipping, pickup scheduling, or completion workflow in the current launch model.
- Stripe marketplace payment capture is disabled; `/api/stripe/webhook` returns `PAYMENTS_DISABLED`.
- Current launch pricing is $0 buyer fees, $0 standard listing fees, and 0% seller success fee during launch.

## Required production environment

These variables must be configured in the production host before go-live:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

Optional integrations can be absent for the current launch model, but should be reviewed before enabling related features:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `BLOB_READ_WRITE_TOKEN`
- `FT_ENABLED`
- `PHONE_GATE_ENABLED`

## Automated verification

Run from the repository root:

```powershell
node .\tools\prod-01-production-readiness-gate-check.cjs
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:smoke
npm.cmd run lint
npm.cmd run build
```

## Runtime verification

After deployment, check:

- `/api/health` returns JSON with `deployment`, `paymentReadiness`, `checks`, `env`, and `Cache-Control: no-store, max-age=0`.
- `/api/health` reports `ok: true` only when required environment and database checks pass.
- `/admin/ops` is accessible to admins only and shows production readiness, database status, required environment status, canonical URL status, and payment readiness.
- `/api/stripe/webhook` still returns `PAYMENTS_DISABLED` for the current launch model.

## Manual go/no-go checklist

- Required environment variables are present in production.
- Database migrations have been applied with `npm.cmd run db:deploy` or the production host equivalent.
- A production admin account exists and can access `/admin/ops`.
- Public route smoke coverage passes.
- Auth login/register/password reset flows are available.
- Listing creation, Buy Now order creation, offer acceptance, messaging, reporting, and feedback checks remain protected by static regression scripts.
- Legal, fees, support, and how-it-works pages match the current platform-only launch model.
- No active Stripe checkout, escrow, wallet, payout, refund, shipping, pickup scheduling, or forced order completion workflow is active.

## Rollback path

- Revert the release commit or roll production back to the last known-good deployment in the host dashboard.
- Confirm `/api/health` after rollback.
- Confirm admin access to `/admin/ops` after rollback.
- Preserve logs, PR number, commit SHA, and deployment URL for incident review.

## No-drift rule

Do not add marketplace payment capture, escrow, wallet, payout, refund handling, shipping, pickup scheduling, forced order completion, third-party tracking, or buyer-protection claims unless a future scoped issue updates legal, support, health, admin ops, and regression checks together.
