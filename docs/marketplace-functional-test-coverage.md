# Marketplace Functional Test Coverage

Last verified locally: 2026-06-06

## Current verified status

- Playwright UI/browser suite: 36 passed / 0 failed / 0 skipped
- Marketplace DB logic suite: 22 passed / 0 failed

## Browser/UI coverage

- Homepage loads
- Homepage has no horizontal overflow
- Public marketplace routes are reachable
- Buy Now listings page renders
- Category browsing page renders
- Guest cannot access protected create-listing page
- Seeded seller can log in
- Seeded seller can access create-listing page
- Seeded buyer can log in
- Seeded buyer can see seeded listing in listing feed
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

## Known missing product logic

- Notification model is not present in prisma/schema.prisma
- No schema-backed unread/read message state exists on Message
- Failed payment is represented as CANCELLED because OrderStatus has no FAILED enum
- Full real payment provider webhook flow still needs endpoint-level tests
- Full UI checkout journey still needs browser tests
- Full UI offer accept/reject journey still needs browser tests
- Full UI message send/reply journey still needs browser tests
- Admin/moderator UI still needs browser tests
- Listing creation form submission still needs browser tests
- Image upload flow still needs browser tests
- Email verification flow still needs browser tests
- Password reset flow still needs browser tests

## Recommended next test blocks

1. Add API route tests for checkout, offers, messaging, reports, and listing mutation endpoints
2. Add UI tests for create-listing form submission
3. Add UI tests for buyer Buy Now checkout flow
4. Add UI tests for buyer offer flow and seller accept/reject flow
5. Add UI tests for buyer/seller messaging flow
6. Add admin/moderator UI tests
7. Add notification model and notification logic tests if notifications are required
