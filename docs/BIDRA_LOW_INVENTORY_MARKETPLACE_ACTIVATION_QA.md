# Bidra low-inventory marketplace activation QA

## Goal

Make low real inventory feel honest and active by routing visitors toward genuine seller supply instead of fake listings or dead empty states.

## Must verify

- Homepage empty category/listing states invite real sellers to list items.
- Listings empty state prioritises creating a listing while still allowing browsing and filter clearing.
- Category pages with no results invite a real listing in that category.
- Category-location pages no longer hard 404 just because inventory is empty.
- Dashboard first-run setup encourages real inventory without changing account type.
- Seller listings empty state explains how to create a buyer-ready first listing.
- No fake, demo, sample, seeded, placeholder, early access, launch, or beta inventory wording is added.
- Mobile empty states and CTAs do not overflow horizontally.

## Pages to inspect

- /
- /listings
- /listings?category=Electronics
- /listings/c/[category]
- /listings/c/[category]/[location]
- /dashboard
- /dashboard/listings
- /sell/new

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
