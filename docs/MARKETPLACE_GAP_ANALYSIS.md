# Bidra Marketplace Gap Analysis

## Current high-risk areas

1. Database/schema drift can pass build but fail at runtime.
2. Listing detail pages must be smoke-tested against real active listing IDs.
3. Protected routes must be checked as logged-out visitors.
4. Payment/order flows must be either complete or hidden.
5. Marketplace cannot be considered ready from build/typecheck alone.

## Required closure gates

- Prisma generate succeeds.
- DB drift audit succeeds.
- Typecheck succeeds.
- Lint succeeds.
- Build succeeds.
- Public marketplace routes load.
- Protected routes redirect when logged out.
- At least one active listing detail page loads without 500.
- Playwright reports no visible Next.js error overlay.

## Slice backlog

1. DB/schema reliability
2. Auth/security
3. Browse/search/listing detail
4. Seller listing create/edit
5. Photos/media
6. Buyer watchlist/messages/offers
7. Orders/payment readiness
8. Admin moderation
9. Trust/safety/help/legal
10. Mobile and launch polish