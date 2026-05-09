# Bidra recommendation engine foundation QA

## Goal

Improve Bidra's related-listing and discovery readiness without claiming AI personalisation, machine-learning ranking, vector search, embeddings, collaborative filtering, behavioural profiling, paid ranking, or external recommendation infrastructure.

## Included in this PR

- Adds a shared recommendation foundation helper.
- Adds rules-based related listings to listing detail pages.
- Uses existing Listing fields only: category, location, sellerId, status, createdAt, price, buyNowPrice, and offer count.
- Adds transparent recommendation limits copy to listing detail pages.
- Adds discovery-limit copy to /listings.
- Adds recommendation metadata to /api/listings responses.
- Adds support and admin ops wording explaining rules-based discovery limits.

## Explicitly not included

- No AI model integration.
- No machine-learning ranking.
- No vector search.
- No embeddings.
- No collaborative filtering.
- No behavioural profiling.
- No paid placement ranking.
- No external recommendation provider.
- No schema migration.

## Manual QA

- Open /listings/[id] and confirm Related discovery appears naturally.
- Confirm related listings exclude the current listing.
- Confirm empty related state links to Browse all listings and Create a listing.
- Open /listings and confirm Guided discovery shortcuts explains rules-based discovery.
- Call /api/listings and confirm recommendations metadata appears without overclaiming.
- Open /support and confirm Recommendations and discovery limits appears.
- Open /admin/ops and confirm Recommendation foundation appears.
- Confirm no page claims AI personalisation, ML ranking, vector search, behavioural profiling, or paid placement is active.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
