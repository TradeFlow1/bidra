# Bidra production credibility flow polish QA

## Goal

Remove remaining beta, launch, internal-record, and prototype-like wording from high-visibility marketplace pages.

## Must verify

- Homepage no longer says early access.
- Homepage Buy Now section reads like a production marketplace section.
- How it works no longer says Bidra V1 or order record.
- Help, support, messages, and notifications use order language instead of sold-item record language.
- Legal page uses Current fee model wording instead of launch fee model wording.
- Dashboard and seller listing management buttons use Bidra button classes.
- Watchlist Sell an item goes directly to /sell/new.
- Mobile dashboard, seller listings, watchlist, messages, and orders have no horizontal overflow.

## Pages to inspect

- /
- /how-it-works
- /help
- /support
- /legal
- /dashboard
- /dashboard/listings
- /watchlist
- /messages
- /notifications

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
