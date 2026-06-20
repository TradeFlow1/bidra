# Bidra

Bidra is a trust-first Australian household marketplace focused on reliable local trading, clear sold-item records, and safer buyer/seller handover.

## Current launch model

- Bidra is a platform marketplace only. It is not a seller, auctioneer, payment provider, escrow service, refund decision-maker, shipping provider, or pickup scheduler.
- Buyers and sellers arrange payment, pickup, postage, refunds, and handover details directly in Bidra Messages.
- Orders are sold-item records. There is no forced in-app Pay now, checkout, escrow, shipping, pickup scheduling, or completion workflow in the current launch model.
- Current launch pricing: $0 buyer fees, $0 standard listing fees, and 0% seller success fee during launch.
- Stripe integration remains disabled for marketplace payment capture; `/api/stripe/webhook` intentionally returns `PAYMENTS_DISABLED`.

## Production go-live checks

Run this from the repository root before launch or after a production-risk change:

```powershell
npm.cmd run launch:gate
```

The consolidated launch gate runs production readiness checks, marketplace API guard checks, marketplace UI flow checks, originality checks, typecheck, regression tests, public smoke tests, lint, and a clean Next.js build.

For debugging a failed gate, the individual commands are:

```powershell
node .\tools\prod-01-production-readiness-gate-check.cjs
npm.cmd run test:marketplace-api-guards
npm.cmd run test:marketplace-ui-flows
npm.cmd run test:marketplace-originality
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:smoke
npm.cmd run lint
npm.cmd run build
```

Required production environment variables are documented in `.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

Operator readiness surfaces:

- `/api/health` for machine-readable database, environment, deployment, and payment-readiness checks.
- `/admin/ops` for admin-facing production diagnostics.
- `docs/BIDRA_PRODUCTION_READINESS_GATE.md` for the manual go/no-go checklist and rollback path.

## Local development

```powershell
npm.cmd install
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:smoke
npm.cmd run lint
npm.cmd run build
```
