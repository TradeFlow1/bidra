# Bidra shipping labels foundation QA

## Goal

Improve Bidra's postage, pickup, tracking, packaging, dispatch, and carrier-limit guidance without claiming shipping label purchase, carrier integration, live postage rates, delivery insurance, or carrier claim handling.

## Included in this PR

- New listing page explains postage readiness and evidence expectations.
- Listing detail page clarifies pickup, postage, tracking, packaging, dispatch, and delivery-risk expectations.
- Orders list and order detail pages direct users to confirm postage details in Messages.
- Order detail adds clear Shipping label status copy.
- Feedback completion copy includes postage evidence.
- Support explains that Bidra does not sell labels, calculate live rates, insure parcels, or manage carrier claims.
- Help, Disputes, Terms, and Fees pages include clearer postage evidence and platform-limit wording.

## Explicitly not included

- No Australia Post integration.
- No Sendle integration.
- No courier API integration.
- No shipping label purchase flow.
- No live postage rate calculation.
- No shipping insurance.
- No carrier claim handling.
- No tracking field or schema migration.

## Manual QA

- Open /sell/new and confirm Postage readiness appears naturally.
- Open /listings/[id] and confirm postage limits appear near safe-trading guidance.
- Open /orders and confirm order action text mentions pickup or postage.
- Open /orders/[id] and confirm Shipping label status appears with no overclaiming.
- Open /orders/[id]/feedback and confirm completion guidance mentions tracking, packaging, dispatch, and handover.
- Open /support and confirm Postage and shipping labels explains platform limits clearly.
- Open /help, /disputes, /legal/terms, and /legal/fees and confirm copy is accurate.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
