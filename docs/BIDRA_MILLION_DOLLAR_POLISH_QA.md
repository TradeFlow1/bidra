# Bidra million-dollar marketplace polish QA

This checklist belongs to the one-shot PowerShell polish pass.

## Must inspect before merge

- /
- /listings
- one listing detail page
- /sell/new
- /auth/login
- /auth/register
- /dashboard
- /messages
- /orders
- /watchlist
- /support
- /legal

## Mobile widths

- 360px
- 390px
- 430px

## Desktop widths

- 1280px
- 1440px

## Pass criteria

- no horizontal scrolling
- header is not cramped
- buttons are consistent
- back buttons are aligned with page content
- listing cards look stable and professional
- listing gallery shows items clearly
- create-listing upload preview is usable
- auth pages look trustworthy
- dashboard does not look like an admin/debug screen
- empty states do not make the marketplace look abandoned
- no fake/test/debug wording visible
- no overpromising buyer protection, escrow, refunds, or payment holding

## Ignored for this PR

- escrow
- payment integrations
- shipping integrations
- advanced analytics
- admin polish
- new marketplace features
- seed data
- fake listings
