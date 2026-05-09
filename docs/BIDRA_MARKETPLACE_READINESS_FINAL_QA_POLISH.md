# Bidra marketplace readiness final QA polish

## Goal

Final low-risk marketplace readiness polish after the foundation PRs. This pass removes public launch wording, reduces internal jargon on public/user-facing surfaces, keeps back navigation intact, and confirms feature-limit copy does not overclaim marketplace capabilities.

## Included in this PR

- Replaces remaining public launch-pricing wording with durable current-pricing language.
- Replaces sold-item record phrasing with order wording on public and user-facing surfaces.
- Replaces a launch-version reserve-pricing error with current support language.
- Replaces a photos-coming-soon fallback with a neutral no-gallery-photos message.
- Updates operational launch-model wording to current model wording.
- Adds final marketplace readiness QA documentation.

## Explicitly not included

- No schema migration.
- No payment integration.
- No Stripe Connect implementation.
- No escrow implementation.
- No shipping label integration.
- No push notification implementation.
- No AI recommendation implementation.
- No mobile app implementation.
- No risky navigation refactor.

## Manual QA

- Open / and confirm empty states still point sellers to create real listings.
- Open /listings and confirm Back to home appears and empty states remain seller-focused.
- Open /listings/[id] and confirm Back to listings appears and pricing copy says current pricing.
- Open /legal/fees and confirm no launch wording remains.
- Open /legal/terms and confirm order wording does not use sold-item record jargon.
- Open /help and /auth/login and confirm orders wording reads naturally.
- Open a listing with no gallery photos and confirm the fallback says No gallery photos yet.
- Open /support and confirm platform limits still avoid overclaiming escrow, payments, shipping labels, push, AI, and mobile app capabilities.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
