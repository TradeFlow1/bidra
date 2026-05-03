# BIDRA Phase 4 Launch Hardening Plan

## Purpose

Phase 4 focuses on launch hardening after Phase 3 growth, trust, SEO, onboarding, support, analytics planning, and polish are complete.

The goal is to reduce transaction risk, duplicate actions, abuse paths, and remaining launch-quality gaps without reopening completed Phase 3 conversion work.

## Phase 4 theme

Launch hardening and transaction safety.

## Completed baseline

- Phase 2 readiness work is merged through PRs including admin listing moderation, order next actions, message send states, watchlist feedback, payment readiness, production diagnostics, public mutation hardening, and mobile tap targets.
- Phase 3 growth work is merged through PRs #110 through #119.
- Main passed typecheck, regression tests, public route smoke tests, lint, and production build after Phase 3.

## Phase 4 scope

1. `PHASE4-00` - Plan launch hardening scope.
2. `MESSAGE-01` - Block off-platform contact details server-side.
3. `OFFER-02` - Prevent duplicate critical actions.
4. `AUTH-03` - Add login rate limiting.
5. `PERF-01` - Improve accessibility, performance, and image quality.
6. `UX-01` - Standardize toast, error, and modal components.
7. `ADMIN-01` - Build admin user moderation controls.
8. `CONTROL-05` - Reconcile stale fix register statuses.

## Out of scope

- Do not add escrow, in-app payment capture, shipping, courier scheduling, or buyer protection claims beyond documented V1 behaviour.
- Do not restart Phase 3 conversion copy unless a Phase 4 issue explicitly depends on it.
- Do not add third-party analytics, tracking pixels, session replay, or advertising events.
- Do not change auth, order, offer, message, or admin behaviour without an issue-specific check.

## Acceptance criteria

- Phase 4 has a documented issue sequence.
- Each Phase 4 issue has a clear safety or launch-readiness reason.
- The register separates launch hardening from growth polish.
- A static regression check protects the Phase 4 plan and register.
