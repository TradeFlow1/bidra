# Bidra dispute handling foundation QA

## Goal

Add a professional Resolution Centre layer for order, listing, message, pickup, postage, and handover issues without claiming Bidra provides escrow, marketplace payments, shipping labels, insurance, or automated refund decisions.

## Included in this PR

- Public /disputes page becomes a Resolution Centre.
- Help and support pages route users to the Resolution Centre for order and handover issues.
- Contact page clarifies when to use Contact, Report, Feedback, and Resolution Centre.
- Orders list and order detail pages add visible Need help entry points.
- Order detail explains what evidence to collect before contacting support.
- Feedback page removes leftover sold-item-record wording.
- Admin report wording recognises resolution signals while keeping moderation decisions evidence-based.

## Explicitly not included

- No Stripe Connect marketplace payments.
- No escrow.
- No automated refund decisions.
- No shipping label provider.
- No delivery insurance or carrier claim handling.
- No dedicated dispute database model yet.

## Manual QA

- Visit /disputes logged out and confirm the page is public, clear, and does not overpromise.
- Visit /support and confirm Resolution Centre appears with Contact support.
- Visit /help and confirm problem-reporting routes mention Resolution Centre.
- Visit /contact and confirm order help directs users to Resolution Centre evidence guidance.
- Log in as buyer and seller, open /orders, and confirm each order card has Need help.
- Open an order detail and confirm Need help appears in the action area and evidence panel.
- Open order feedback and confirm it says order, not sold-item record.
- Log in as admin and confirm reports wording still treats admins as evidence reviewers, not refund adjudicators.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
