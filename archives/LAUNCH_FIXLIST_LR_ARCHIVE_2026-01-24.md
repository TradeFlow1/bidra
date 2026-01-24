# [ARCHIVED]

> Historical document only. **Do not use for active tracking.**
> Single source of truth was .\LAUNCH_FIXLIST_LR.md (reached 100% and archived on 2026-01-24).

---
# LAUNCH_FIXLIST_LR — ARCHIVE (2026-01-24)

This file contains all completed items removed from LAUNCH_FIXLIST_LR.md after reaching 100%.

## Completed items
- [x] No console/runtime errors on any page (including DevTools open).
- [x] Auth-aware header states correct (signed out vs signed in).
- [x] Mobile menu reliable (no dead buttons).
- [x] Search works and is styled correctly (desktop + mobile).
- [x] No invalid hook call / next/link misuse / hydration crashes.
- [x] 18+ enforcement is strict server-side for all sensitive actions/APIs (not UI-only).
- [x] Under-18 users can browse public pages only (no listing, bidding, messaging, watchlist, orders, feedback, reports create).
- [x] Session handling stable (NEXTAUTH_URL, secrets, redirects).
- [x] Browse → listing detail: all critical listing info renders cleanly (price/offer state, photos, location display, seller link).
- [x] Sell/New listing: validation is correct; no broken fields; errors are clear; success redirects correctly.
- [x] Edit listing works; delete listing works; relist works.
- [x] Watchlist add/remove works everywhere (list + detail) and respects 18+ gating.
- [x] Reporting works (listing + messaging thread) and admin can action correctly.
- [x] Buy Now = binding purchase (no seller confirmation); copy reflects this clearly; seller pre-authorises.
- [x] Timed Offers = non-binding; seller must explicitly accept highest offer to form a sale.
- [x] Platform language stays neutral (no “winner”, no automatic “sold” by Bidra).
- [x] Orders creation/transition rules match the model (server-side enforced).
- [x] Cancel/refund rules exist and match model.
- [x] Canonical payment page is /orders/[id]/pay (single source of truth).
- [x] Osko/PayID “I’ve paid” confirm works (audit logged).
- [x] Messaging includes soft reminders to pay on-platform (no threats, no bans).
- [x] No pooled-funds behaviour; platform does not handle money.
- [x] Prohibited items blocked at listing creation server-side (no publish/review path).
- [x] Includes: vapes/nicotine, alcohol, sexual/fetish content (at minimum).
- [x] Validates title, description, category/tags, and images where possible.
- [x] Clear user-facing error + attempt logging + escalation only on repeats.
- [x] Mobile upload supports multiple photos per listing (append, not replace).
- [x] User can tap “Add photo / Take photo” repeatedly; input resets after selection.
- [x] Backend accepts multiple files and appends correctly.
- [x] Thumbnails show; remove works (reorder optional).
- [x] Instrumentation ready: MESSAGE_SENT / MESSAGE_THREAD_REPORTED / MESSAGE_THREAD_DELETED logged to AdminEvent; /admin/events supports ?q= filter.
- [x] “Break the messaging system” test phase completed and issues resolved:
- [x] Terms + Privacy + Support pages exist and are linked in footer/header where appropriate.
- [x] Prohibited items page exists and is linked.
- [x] Copy is plain/accurate: Bidra not the seller; no guarantees; dispute expectations clear.
- [x] Single Vercel project; prod build green; env vars correct.
- [x] Apex -> www redirect confirmed.
- [x] No accidental static export / prerender traps.
- [x] Accessibility pass (keyboard nav, contrast, focus states).
- [x] Mobile responsiveness pass on key pages.
- [x] Error states polished (empty inbox, empty watchlist, no listings, etc.).
- [x] Admin audit/events cover critical actions (orders/pay/feedback/report actions).
- [x] Small copy polish sweep (no placeholders, no “beta” wording).
- [x] Small copy polish sweep (no placeholders, no beta wording).
