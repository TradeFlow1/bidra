# Bidra launch blockers

## Goal
Get Bidra ready for controlled public launch testing in Australia by fixing launch blockers only.

## Non-negotiable product rules
- Buy Now = sold pending pickup
- No escrow
- No deposits
- No in-app payments
- No shipping
- Seller defines pickup availability
- Buyer must select a pickup slot
- Offers are seller-accepted timed offers, not auctions
- No counter-offers
- Chat cannot override the system
- Trust and completion reliability come first

## Launch blocker execution order
1. Structured transactions
   - Add mandatory seller pickup windows in listing create/edit flow
   - Require buyer pickup slot selection in Buy Now / accepted offer flow
   - Lock listing after sale and reflect correct order state

2. Remove payment/shipping contradictions
   - Remove PayID / bank transfer / shipping instructions from live order, support, and legal flows
   - Replace with pickup-first language

3. Replace auction-like offers
   - Remove bid ladders / auction behaviour
   - Keep fixed-duration seller-reviewed offers

4. Restrict chat
   - Prevent negotiation / off-system override behaviour
   - Limit chat to support / reschedule / safe coordination

5. Reliability enforcement
   - Tie strikes / reliability to no-shows, lateness, and reschedules

6. Trust layer
   - Turn on / finish phone verification for listing and buying actions

7. Polish after system truth
   - Remove watchlist / legacy routes if still public
   - Standardise CTA/button affordance
   - Clean remaining mojibake and stale copy

## Files already identified by prior repo audit
- app/sell/new/sell-new-client.tsx
- app/orders/[id]/page.tsx
- app/listings/[id]/page.tsx
- app/messages/[id]/page.tsx
- server/actions/reliability.ts
- app/auth/register/page.tsx
- app/watchlist/page.tsx
- app/api/listings/create/route.ts
- app/api/listings/[id]/accept-highest-offer/route.ts
- app/api/listings/[id]/update/route.ts
- app/api/offers/place/route.ts
- app/api/orders/[id]/pickup/select/route.ts

## How to use this file with Claude Code / Codex
Prompt:
Use plans/bidra-launch-blockers.md as the source of truth. Implement step 1 only. Make the smallest necessary change, run the relevant tests/build, report files changed and what now works, then stop.

