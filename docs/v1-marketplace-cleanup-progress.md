# Bidra V1 Marketplace Cleanup Progress

Purpose: keep a repo-tracked checklist so new chats do not rework the same pages.

## V1 product direction

- Simple trust-first local marketplace.
- Buy Now = sold.
- Accepted highest offer = sold.
- Use messages to arrange pickup or postage.
- No in-app pickup scheduling.
- No forced order workflow.
- No complete-order pressure.
- No endless seller/buyer confirmation loops.
- Do not block or mask phone numbers in messages.
- Unread messages should be obvious, blue, and sorted first.
- Orders are sold-item history, not active tasks.
- Notifications should only feel active for unread messages or optional feedback.

## Checked and cleaned

- [x] Dashboard / Account Center
  - Profile/account wording merged into Dashboard.
  - Account Status / Account Restrictions entry added.
  - Commit: bea3745 Add account status to dashboard

- [x] Public handover copy
  - Help, How it works, Support, Contact, Feedback, Notifications copy moved to V1 marketplace truth.
  - Removed pickup scheduling, complete order, order flow, V2 language.
  - Commits: e7eb690, 6d04e23, 054152f, 7473c87

- [x] Support page
  - Action buttons polished away from old bd-btn style.
  - Commit: d6d91bf Polish support page actions

- [x] Contact page
  - Simplified to contact support form plus short guidance.
  - Submit button polished.
  - Commits: 4eb1e54, ecb9974, 30c0ffe

- [x] Notifications page and notification logic
  - Orders now show as Sold, not Active.
  - Sold orders no longer count toward notification total.
  - Sold orders no longer drive critical/primary notification state.
  - Orders card no longer highlights just because sold orders exist.
  - Commit: 83595f9 Stop treating sold orders as notifications and align orders UI

- [x] Orders page
  - Orders treated as sold-item records, not a forced workflow.
  - Pending sold item action points to order details, not forced messaging.
  - Commit: 83595f9 Stop treating sold orders as notifications and align orders UI

- [x] Messages inbox
  - Unread messages are blue, bold, and sorted first.
  - Removed off-platform restriction tone.
  - Copy now supports arranging pickup or postage without controlling users.
  - Commit: e703a47 Simplify messages copy to remove off-platform restriction tone

## Inspected and cleaned in this pass

- [x] Listing detail page
  - File: app/listings/[id]/page.tsx
  - Buy now / make-an-offer / sold-state copy aligned to V1 trust-first rules.
  - PR: #16

- [x] Listings browse page
  - File: app/listings/page.tsx
  - Header/filter/empty-state copy aligned to simple local marketplace flow.
  - PR: #18

## Known follow-up risks

- Do not reintroduce contact blocking or phone masking in messages.
- Keep legacy redirect routes in place unless a dedicated migration removes old links safely.

## Launch-readiness sweep (2026-04-25)

- Files/routes inspected
  - `app/orders/[id]/complete/page.tsx`
  - `app/orders/[id]/pay/page.tsx`
  - `app/orders/[id]/pay-now/page.tsx`
  - `app/orders/[id]/message/route.ts`
  - `app/api/orders/[id]/complete/route.ts`
  - `app/api/orders/[id]/pay/confirm/route.ts`
  - `app/orders/[id]/page.tsx`
  - `app/messages/page.tsx`
  - `app/messages/[id]/page.tsx`
  - `app/api/messages/thread/[id]/send/route.ts`
  - `lib/message-safety.ts`
  - `app/support/page.tsx`
  - `app/legal/terms/page.tsx`
  - `app/legal/fees/page.tsx`

- Routes redirected/retired
  - Legacy post-sale pages `/orders/[id]/complete`, `/orders/[id]/pay`, and `/orders/[id]/pay-now` remain safe redirects to `/orders/[id]`.
  - `/orders/[id]/message` remains a useful bridge that opens or reopens the message thread and redirects to `/messages/[threadId]`.
  - Legacy API `/api/orders/[id]/complete` remains retired with `410`.
  - Legacy API `/api/orders/[id]/pay/confirm` now clearly states there is no in-app payment confirmation flow and points users to messages.

- Stale wording removed
  - Removed user-facing order-flow / pickup-scheduling / completion-step language from legal pages.
  - Removed user-facing off-platform restriction phrasing in support and thread safety copy while keeping clear scam guidance.
  - Removed legacy message-contact masking/blocking helpers and message-send blocking branch.

- Remaining known risks
  - Some internal names still use legacy terms (for example enum/status values like `COMPLETED` or offer/bid internals) and were intentionally not renamed for schema safety.
  - Admin AI analysis labels still contain “off-platform messaging” as internal moderation metadata; this is not shown as user-facing marketplace workflow copy.

## Marketplace loop clarity (this pass)

- Listing → message → sold flow clarified with direct guidance on listing detail actions.
- Next-step guidance added to listing detail, message thread, and order detail pages.
- Removed remaining ambiguous transaction language from marketplace headers and empty states.
- Confirmed no new workflow systems were added (no payments, no scheduling, no forced completion flow).

## Trust and safety confidence pass (this pass)

- Added lightweight trust tips on listing detail pages: safe public meetup, inspect before paying, and confirm details in messages.
- Added calm safety hinting in message threads: agree details before meeting and avoid deposits unless trust is established.
- Strengthened sold-state reassurance on order detail pages with clear messaging records guidance.
- Made reporting visibility clearer with explicit labels for both listing and user reporting surfaces.
- Added seller credibility context in listing detail (seller name, location, and member-since when available).
- Confirmed no new complexity was added (no escrow, no payment flow, no verification flow, no moderation queue).

## Preferred workflow for future chats

1. Start by reading this file.
2. Check latest GitHub state / git log before patching.
3. Do not rework checked pages unless there is a new bug or explicit request.
4. Use inspect -> patch -> diff -> lint/build -> commit/push.
5. Keep each commit small and named for the product behavior changed.
