# Bidra Marketplace Build Plan

## Operating model

No random fixes. Work in vertical marketplace slices.

Each slice must have:

- Acceptance criteria
- Tests or verification script
- Implementation
- marketplace:gate result
- Remaining-risk report

## Commands

Primary gate:

npm run marketplace:gate

Manual supporting commands:

npm.cmd run prisma:generate
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npx.cmd playwright test tests/e2e/marketplace-launch.spec.ts

## Completion order

### 1. Database/schema reliability

Goal: runtime database matches Prisma/code expectations.

Acceptance:
- tools/db-drift-audit.cjs passes.
- No runtime references to missing columns.
- Missing optional fields are either migrated or guarded.

### 2. Auth/security

Goal: logged-out users cannot access protected routes or admin tools.

Acceptance:
- /account, /messages, /orders, /watchlist, /admin redirect to login.
- Header does not expose admin/account internals to public visitors.

### 3. Browse and detail

Goal: buyers can browse and open active listings.

Acceptance:
- /listings loads.
- Listing cards render.
- At least one active detail page loads.
- No Prisma missing-column error.
- No image optimizer crash.

### 4. Seller listing flow

Goal: sellers can create and manage valid listings.

Acceptance:
- Create listing flow validates required fields.
- Photo handling works or blocks submission clearly.
- Seller can edit own listing.

### 5. Buyer intent

Goal: buyers can save, message, and offer safely.

Acceptance:
- Watchlist works for authenticated users.
- Logged-out users are redirected to login.
- Messaging/offer actions do not 500.

### 6. Orders and payments

Goal: transaction paths are production-safe.

Acceptance:
- Working flows are tested.
- Incomplete flows are hidden or disabled with clear copy.

### 7. Admin and safety

Goal: moderation exists and is protected.

Acceptance:
- Reports, listing moderation, user restriction tools are protected.
- Admin pages do not leak to public visitors.

### 8. Mobile and launch

Goal: production visitor/buyer/seller flows are usable on mobile.

Acceptance:
- Mobile browse/detail/auth/sell flow passes smoke.
- Empty states and onboarding are clear.