# Bidra marketplace trust conversion polish QA

## Goal

Improve perceived marketplace maturity by removing beta/prototype wording, tightening seller credibility copy, and standardising action language.

## Must verify

- Seller profile reads like a credible marketplace profile, not a checklist prototype.
- Listing cards avoid weak wording such as launch/prototype language.
- Listing detail no longer says Launch pricing.
- Buy Now wording is clear and transactional.
- Create-listing flow no longer says launch version.
- Publish button uses the standard Bidra button system.
- Messaging safety copy remains protective but less noisy.
- Mobile pages do not overflow horizontally.

## Pages to inspect

- /seller/[id]
- /listings
- /listings/[id]
- /sell/new
- /messages
- /messages/[id]

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
