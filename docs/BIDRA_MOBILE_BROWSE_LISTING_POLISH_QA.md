# Bidra mobile browse and listing detail polish QA

## Fix intent

This branch targets the next marketplace-parity step after listing detail layout cleanup.

## Must pass

- Listing detail description is visually obvious immediately under the gallery.
- Item metadata remains easy to scan but does not overpower the description.
- Mobile listing filters open in a clear drawer with a large close target.
- Gallery previous/next controls meet mobile tap target expectations.
- Gallery dot controls are easier to tap.
- Listing cards show title, short description, price, seller signal, location, and a single clear view action.
- Own listings do not show buyer messaging/watchlist actions as if the seller were a buyer.
- Logged-in users are not told to create a new account in core marketplace flows.
- No horizontal overflow at 390px mobile width.

## Pages to inspect

- /
- /listings
- /listings?type=BUY_NOW
- /listings?type=OFFERABLE
- /listings/[id]
- /how-it-works

## Verification commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
