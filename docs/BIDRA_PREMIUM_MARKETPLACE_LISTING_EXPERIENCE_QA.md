# Bidra premium marketplace listing experience QA

## Target

Move Bidra closer to high-quality marketplace listing detail density, trust, and visual hierarchy.

## Must pass

- Listing detail content uses more desktop width without feeling stretched.
- Gallery no longer dominates the page with excessive vertical height.
- Gallery controls use thumbnail-style navigation instead of prototype-looking large dots.
- Purchase/action sidebar is cleaner and more transactional.
- Seller trust appears near the purchase decision.
- Safe-buying copy is shorter and less visually heavy.
- About this item remains easy to find under the gallery.
- Mobile listing detail does not overflow horizontally.
- Listing browse empty states avoid abandoned-marketplace wording.

## Pages to inspect

- /listings/[id]
- /listings
- /listings?type=BUY_NOW
- /listings?type=OFFERABLE
- /seller/[id]

## Verification commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
