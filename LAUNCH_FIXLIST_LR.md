# Bidra — Public Launch Readiness Fixlist (LR)
Rule: Only mark DONE after (1) npm run build is green and (2) git commit + push are complete.
Scope: Public launch readiness (post Friend Test). Do not regress FT fixes.

## LR-P0 (Must-fix before any public launch)

### LR-P0-01 Navigation & Header
- [x] No console/runtime errors on any page (including DevTools open).
- [x] Auth-aware header states correct (signed out vs signed in).
- [x] Mobile menu reliable (no dead buttons).
- [x] Search works and is styled correctly (desktop + mobile).
- [x] No invalid hook call / next/link misuse / hydration crashes.

### LR-P0-02 Authentication & Access Gating
- [x] 18+ enforcement is strict server-side for all sensitive actions/APIs (not UI-only).
- [x] Under-18 users can browse public pages only (no listing, bidding, messaging, watchlist, orders, feedback, reports create).
- [x] Session handling stable (NEXTAUTH_URL, secrets, redirects).

### LR-P0-03 Core Marketplace Flows
- [x] Browse → listing detail: all critical listing info renders cleanly (price/offer state, photos, location display, seller link).
- [x] Sell/New listing: validation is correct; no broken fields; errors are clear; success redirects correctly.
- [x] Edit listing works; delete listing works; relist works.
- [x] Watchlist add/remove works everywhere (list + detail) and respects 18+ gating.
- [x] Reporting works (listing + messaging thread) and admin can action correctly.

### LR-P0-04 Dual Sales Model (Locked Requirement)
- [x] Buy Now = binding purchase (no seller confirmation); copy reflects this clearly; seller pre-authorises.
- [x] Timed Offers = non-binding; seller must explicitly accept highest offer to form a sale.
- [x] Platform language stays neutral (no “winner”, no automatic “sold” by Bidra).
- [x] Orders creation/transition rules match the model (server-side enforced).
- [x] Cancel/refund rules exist and match model.

### LR-P0-05 Payments (Locked Pay Page)
- [x] Canonical payment page is /orders/[id]/pay (single source of truth).
- [x] Osko/PayID “I’ve paid” confirm works (audit logged).
- [x] Messaging includes soft reminders to pay on-platform (no threats, no bans).
- [x] No pooled-funds behaviour; platform does not handle money.

### LR-P0-06 Prohibited Items Blocking (Locked Requirement)
- [x] Prohibited items blocked at listing creation server-side (no publish/review path).
- [x] Includes: vapes/nicotine, alcohol, sexual/fetish content (at minimum).
- [x] Validates title, description, category/tags, and images where possible.
- [x] Clear user-facing error + attempt logging + escalation only on repeats.

### LR-P0-07 Mobile Photos (Locked Requirement)
- [x] Mobile upload supports multiple photos per listing (append, not replace).
- [x] User can tap “Add photo / Take photo” repeatedly; input resets after selection.
- [x] Backend accepts multiple files and appends correctly.
- [x] Thumbnails show; remove works (reorder optional).

### LR-P0-08 Messaging Adversarial Test (Mandatory before public launch)
- [x] Instrumentation ready: MESSAGE_SENT / MESSAGE_THREAD_REPORTED / MESSAGE_THREAD_DELETED logged to AdminEvent; /admin/events supports ?q= filter.
- [ ] “Break the messaging system” test phase completed and issues resolved:
      harassment/off-platform payment evasion, spam, multi-tab, network failures,
      listing/account state changes, admin audit reconstruction.

### LR-P0-09 Legal/Trust Pages
- [x] Terms + Privacy + Support pages exist and are linked in footer/header where appropriate.
- [x] Prohibited items page exists and is linked.
- [x] Copy is plain/accurate: Bidra not the seller; no guarantees; dispute expectations clear.

### LR-P0-10 Domain/SEO/Deployment Sanity
- [ ] Single Vercel project; prod build green; env vars correct.
- [ ] Apex -> www redirect confirmed.
- [ ] No accidental static export / prerender traps.

## LR-P1 (Should-fix before launch)
- [ ] Accessibility pass (keyboard nav, contrast, focus states).
- [ ] Mobile responsiveness pass on key pages.
- [ ] Error states polished (empty inbox, empty watchlist, no listings, etc.).
- [ ] Admin audit/events cover critical actions (orders/pay/feedback/report actions).

## LR-P2 (Nice-to-have)
- [ ] Small copy polish sweep (no placeholders, no “beta” wording).
- [ ] Performance tidy-ups (image sizes, caching sanity).
