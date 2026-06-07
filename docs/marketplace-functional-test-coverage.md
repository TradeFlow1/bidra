# Marketplace Functional Test Coverage

Last verified locally: 2026-06-06

## Current verified status

- Playwright UI/browser suite: 48 passed / 0 failed / 0 skipped
- Marketplace DB logic suite: 23 passed / 0 failed
- Marketplace API guard inventory: passed
- Marketplace UI flow inventory: passed

## Browser/UI coverage

- Homepage loads
- Homepage has no horizontal overflow
- Public marketplace routes are reachable
- Buy Now listings page renders
- Category browsing page renders
- Guest cannot access protected create-listing page
- Guest create-listing redirect is covered across browser projects
- Guest messages redirect is covered across browser projects
- Seeded seller can log in
- Seeded seller can access create-listing page
- Seeded buyer can log in
- Seeded buyer can see seeded listing in listing feed
- Seeded public listing detail page loads from feed
- Desktop Chromium coverage
- Mobile Chromium coverage
- Desktop Firefox coverage
- Mobile WebKit coverage

## Marketplace DB logic coverage

1. Buy Now creates one order and locks listing as SOLD
2. Highest offer acceptance creates order and marks listing SOLD
3. Messaging creates one thread and stores buyer/seller replies
4. Seller cannot buy own listing
5. Duplicate order is blocked after listing is SOLD
6. Expired offer cannot be accepted
7. Duplicate buyer/listing message thread is rejected
8. Watchlist add/remove works and duplicate watchlist item is rejected
9. Listing report creates unresolved moderation record
10. Feedback works after completed order and duplicate feedback is rejected
11. Listing visibility/status rules protect public feed and ownership management
12. Listing validation rejects invalid price, missing fields, invalid type, and invalid status
13. Listing questions and seller answers are linked, visible, and permission-guarded
14. Order completion gates feedback eligibility and protects feedback targets
15. Policy strike and moderation action logic records report, strike, suspension, and admin log
16. User eligibility guards protect sell, buy, offer, message, and report actions
17. Order and listing race-condition guards prevent duplicate purchases, duplicate accepted offers, and sold-listing offers
18. Search, category/type filters, price sort, newest sort, and ACTIVE-only public results work
19. Location filters return matching ACTIVE listings and exclude non-matching or inactive listings
20. Dashboard ownership summaries show correct seller listings and buyer/seller orders
21. Conversation inbox, latest message ordering, recipient message history, and empty-message guards work
22. Checkout/payment guards validate price, ownership, listing status, cancelled payment, and successful sale
23. Proxy offer logic stores private maximums and exposes only current public offer amount

## API route guard coverage

- Offer placement route contains adult/session gating, owner blocking, active-listing validation, offerable-listing validation, private max amount storage, public display amount storage, and current-offer listing updates
- Accept-highest-offer route uses proxy max ordering and stores accepted display amount
- Buy Now route contains adult/session gating, owner blocking, active-listing validation, and sold-listing updates
- Listing creation route contains adult/session gating and required listing-field validation
- Messaging routes contain adult/session gating and participant/listing relationship checks
- Report creation route contains adult/session gating and moderation record creation

## UI flow inventory coverage

- Create-listing client exposes required form anchors
- Listing detail exposes Buy Now, Make an offer, and Message seller action anchors
- Message send box exposes message textarea and send action anchors
- Category SEO listing pages use currentOfferAmount for public offer display

## Known missing product logic

- Notification model is not present in prisma/schema.prisma
- No schema-backed unread/read message state exists on Message
- Failed payment is represented as CANCELLED because OrderStatus has no FAILED enum
- Full real payment provider webhook flow still needs endpoint-level tests
- Full UI checkout journey still needs browser tests with mocked or sandbox payment flow
- Full UI offer accept/reject journey still needs browser tests with deterministic auth/session setup
- Full UI message send/reply journey still needs browser tests with deterministic auth/session setup
- Admin/moderator UI still needs browser tests
- Listing creation form submission still needs browser tests with deterministic auth/session setup
- Image upload flow still needs browser tests
- Email verification flow still needs browser tests
- Password reset flow still needs browser tests

## Recommended next test blocks

1. Add deterministic auth/session setup for UI tests so authenticated browser journeys do not rely on live login form stability
2. Add UI tests for create-listing form submission
3. Add UI tests for buyer Buy Now checkout flow
4. Add UI tests for buyer offer flow and seller accept/reject flow
5. Add UI tests for buyer/seller messaging flow
6. Add admin/moderator UI tests
7. Add notification model and notification logic tests if notifications are required
8. Add deeper mocked request/response API tests for route behaviour
