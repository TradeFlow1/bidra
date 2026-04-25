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

## Inspected but not yet cleaned in this pass

- [ ] Listing detail page
  - File: app/listings/[id]/page.tsx
  - Current state inspected after commit e703a47.
  - Needs review for Buy Now / offer clarity, trust-first copy, and avoiding platform/workflow language.

- [ ] Listings browse page
  - File: app/listings/page.tsx
  - Many .bak files exist from prior layout/filter passes.
  - Needs review after listing detail page.

## Known follow-up risks

- lib/message-safety.ts still contains unused maskContactInfo and contact detection helpers.
- Current scan showed maskContactInfo is not used by app messages.
- Do not reintroduce contact blocking or phone masking.
- There are still legacy routes such as /orders/[id]/complete, /orders/[id]/pay, /orders/[id]/message in the app route table. Inspect before removing; do not assume they are unused.

## Preferred workflow for future chats

1. Start by reading this file.
2. Check latest GitHub state / git log before patching.
3. Do not rework checked pages unless there is a new bug or explicit request.
4. Use inspect -> patch -> diff -> lint/build -> commit/push.
5. Keep each commit small and named for the product behavior changed.

