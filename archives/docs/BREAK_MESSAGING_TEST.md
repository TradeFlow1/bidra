# [ARCHIVED]

> Historical document only. **Do not use for active tracking.**
> Single source of truth was .\LAUNCH_FIXLIST_LR.md (reached 100% and archived on 2026-01-24).

---
# Break the Messaging System — Adversarial Test (Friend Test)

Date:
Tester(s):
Build/Commit:
Environment: (local / bidra.com.au)

## Goal
Deliberately try to break messaging: abuse, evasion, race conditions, edge cases, and admin traceability.

## Rules
- Try to move conversations off-platform (PayID, bank transfer, phone, WhatsApp, email).
- Try harassment, spam, impersonation cues.
- Try multi-tab + refresh + back/forward.
- Try actions while listing/order state changes.
- Try delete/report flows and confirm audit trail exists (Admin Events).

---

## Test Cases

### A) Access & Gating
- [ ] Under-18 / restricted user cannot create threads (403 → restrictions)
- [ ] Not logged in → redirects to /auth/login?next=...
- [ ] Seller cannot open buyer thread on own listing

### B) Thread Creation & Navigation
- [ ] “Message seller” creates thread (or opens existing) and navigates to /messages/[id]
- [ ] Re-opening after buyerDeletedAt restores thread visibility
- [ ] Duplicate clicking doesn’t create duplicate threads
- [ ] Listing deleted/unavailable blocks messaging cleanly

### C) Send Flow
- [ ] Send message succeeds and appears instantly
- [ ] Empty message blocked
- [ ] Very long message handled gracefully
- [ ] Rapid spam sends throttled/handled (note behaviour)
- [ ] Network failure (offline / slow 3G) shows a safe error

### D) Abuse / Off-platform Attempts
Try sending:
- [ ] “my number is 04xx…”
- [ ] “email me at…”
- [ ] “pay me via PayID…”
- [ ] “cash only”
Record outcome:
- Behaviour:
- Logged admin events? (yes/no)

### E) Report & Delete
- [ ] Report thread works; user sees confirmation
- [ ] Delete thread hides it from inbox
- [ ] Delete then recreate/open thread behaves correctly
- [ ] AdminEvent logged for send/report/delete/thread-open

### F) Cross-state Edge Cases
- [ ] Messaging during/after Buy Now order creation
- [ ] Messaging after listing marked SOLD
- [ ] Messaging when listing set to SUSPENDED (if applicable)
- [ ] Messaging with multiple buyers concurrently

---

## Findings
### Critical (P0)
- None / list:

### Important (P1)
- None / list:

### Minor (P2)
- None / list:

---

## Fixes Applied
- (link commits / notes)

## Sign-off
- [ ] All P0 fixed
- [ ] All P1 fixed or explicitly accepted
- [ ] Item 53 ready to tick in LAUNCH_FIXLIST_LR.md
