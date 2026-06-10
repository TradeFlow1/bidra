# Controlled beta launch checklist

This checklist is for moving Bidra from live/demo-looking to controlled real-user beta while keeping the current platform-only marketplace model.

## Scope guard

- Bidra remains a platform marketplace only.
- Do not add in-app checkout, escrow, wallet, payout, refund handling, shipping, pickup scheduling, or forced completion workflows for this launch gate.
- Orders are sold-item records and conversation anchors, not payment or fulfilment guarantees.

## Local launch gate

Run from repo root:

```powershell
Set-Location C:\Users\jpdup\OneDrive\Documents\Bidra\bidra-main-git
npm.cmd run launch:gate
```

The script must pass:

- Production readiness gate
- Typecheck
- Regression tests
- Public smoke tests
- Lint
- Build

## Live smoke checks

- `https://www.bidra.com.au/api/health` returns healthy JSON.
- `/admin/ops` is admin-only.
- `/api/stripe/webhook` returns `PAYMENTS_DISABLED` while payments are disabled.
- Homepage does not look like demo content.
- A real listing flow works end to end:
  - register
  - login
  - create listing
  - upload images
  - message seller
  - Buy Now or make offer

## Real-user beta readiness

- Demo-looking listings are removed or replaced.
- Controlled-beta invite list is ready.
- Support/contact path is visible.
- Rollback path is documented in `docs/BIDRA_PRODUCTION_READINESS_GATE.md`.
- Any live smoke blocker has a GitHub issue before inviting users.

## Go/no-go evidence

Record before invite:

- Date/time of local launch gate run.
- Commit SHA tested.
- Live site URL tested.
- Live smoke tester account used.
- Any blocker issue links.

## Go decision

- Go: all local and live checks pass, no P0/P1 blockers open.
- No-go: any local gate failure, live auth/payment/admin failure, demo-looking homepage/listings, or broken real listing flow.
