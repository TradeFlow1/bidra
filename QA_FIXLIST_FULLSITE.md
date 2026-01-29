# Bidra – Full Website QA Fix List (All 4 Scans)
Generated: 2026-01-29 16:46:17

This file consolidates all fix suggestions captured from:
1) Logged-out scan
2) Seller scan
3) Buyer scan
4) Admin scan

Severity legend:
- P0 Launch Blocker
- P1 Core Flow Breaker
- P2 Trust & UX
- P3 Polish

---

## A) Logged-out Visitor Scan – Fix Suggestions

### AUTH / ACCESS / ROUTING
- **AUTH-LOGOUT-01 (P0)** Public legal/trust pages should NOT require login
  - Affected: Footer links + legal routes (Privacy, Terms, Prohibited Items, Support/Safety, Feedback)
  - Fix: Remove auth gating from public legal content; keep only transactional routes protected.

- **AUTH-LOGOUT-02 (P0)** Login/redirect inconsistency for unknown routes
  - Some invalid routes redirect to login instead of consistent branded 404.
  - Fix: Ensure unknown routes always go to the Next.js not-found page (no auth fallback).

- **AUTH-LOGOUT-03 (P0)** “Forgot password?” link from login is broken / misroutes
  - Fix: Ensure /auth/login “Forgot password?” reliably routes to /forgot-password (public) and works.

### LISTINGS / CTA GATING
- **LIST-LOGOUT-01 (P0)** Listing offer box shows raw placeholder: NOT_AUTHENTICATED
  - Fix: Replace with friendly UX: “Sign in to place an offer” + button.

- **LIST-LOGOUT-02 (P1)** “Message seller” can show “Opening chat…” without completing (hang)
  - Fix: Ensure unauthenticated click results in predictable redirect to login + return path, OR show inline prompt.

### SEARCH
- **SEARCH-LOGOUT-01 (P0)** Search does not submit on Enter; relies on “Show results” link
  - Fix: Wrap search in form + onSubmit; add proper button; ensure Enter works.

---

## B) Seller Scan – Fix Suggestions

### LISTING CREATION / EDIT / DELETE
- **LIST-SELL-01 (P1)** “Edit listing” appears as text/heading but is not clickable
  - Fix: Provide working Edit button/link on listing page + seller dashboard listing rows.

- **LIST-SELL-02 (P1)** Delete listing uses native browser confirm dialog
  - Fix: Replace with branded modal; show clear success state after deletion (toast + redirect).

- **LIST-SELL-03 (P2)** No clear success confirmation after key seller actions
  - Fix: Standardize bottom toast confirmations for create/edit/delete.

### WATCHLIST (SELLER VIEW)
- **WATCH-SELL-01 (P1)** Watch button gives no visible feedback/doesn’t reflect state
  - Fix: Toggle UI state immediately; reconcile with server response; show toast.

### ACCOUNT SETTINGS
- **ACC-SELL-01 (P2)** Save success confirmation should be consistent and anchored (bottom toast)
  - Current: green banner exists sometimes; enforce consistent pattern.

---

## C) Buyer Scan – Fix Suggestions

### AUTH / ROLE CONFUSION
- **AUTH-BUY-01 (P1)** Role clarity: ensure buyer vs seller session state is obvious
  - Fix: Add account type indicator (Buyer/Seller/Admin) in menu and/or dashboard header.

### MESSAGING + SAFETY
- **MSG-BUY-01 (P0)** Off-platform contact details are only “warned”, not enforced
  - User can still send phone/email/bank details after warning.
  - Fix: Enforce server-side blocking/redaction; disable send when violation detected; log attempts.

- **MSG-BUY-02 (P1)** Messaging send state reliability (avoid “Sending…” hang / unclear delivery)
  - Fix: Always show delivered state or error; retry option; never leave indefinite sending.

- **MSG-BUY-03 (P2)** Report in chat uses native prompt
  - Fix: Replace with branded modal + explicit category/reason + success state.

### OFFERS
- **OFFER-BUY-01 (P0)** Offer submission lacks clear confirmation
  - Fix: Await API response; show toast “Offer sent”; update offers section instantly.

- **OFFER-BUY-02 (P1)** Offer flow should be resilient to refresh/back/multi-tab
  - Fix: Idempotency token per offer submit; server rejects duplicates; client disables button.

### WATCHLIST
- **WATCH-BUY-01 (P1)** Watch/unwatch requires multiple clicks / no feedback; empty state too bare
  - Fix: Single click toggle; toast; clear “Watchlist empty” CTA to browse.

### ORDERS / FEEDBACK
- **ORDER-BUY-01 (P1)** “Pay now to continue” must always have actionable CTA
  - Fix: Provide Pay page/button or explicit next action.

- **FEED-BUY-01 (P1)** Feedback route/button reliability
  - Fix: Ensure Leave Feedback always routes correctly; show success state after submit.

---

## D) Admin Scan – Fix Suggestions

### ADMIN USERS
- **ADM-USERS-01 (P1)** Admin Users list opens wrong profile (often opens admin’s own profile)
  - Fix: Correct user link mapping to clicked user ID; build dedicated admin user detail page.

- **ADM-USERS-02 (P1)** Missing moderation controls on user detail (strike/block/unblock/reset)
  - Fix: Add actions with confirmation modal; log to audit trail.

### ADMIN LISTINGS
- **ADM-LIST-01 (P1)** Admin “Manage listings” lacks moderation tools (opens public listing only)
  - Fix: Dedicated admin listing detail with suspend/delete/restore actions + reasons + logs.

### ADMIN REPORTS / AI ACTIONS
- **ADM-REPORT-01 (P2)** AI actions use native confirm prompt; copy is not premium
  - Fix: Branded confirmation modal with explicit consequences, undo notes, and audit logging.

### ADMIN VISUAL CONSISTENCY
- **ADM-UI-01 (P2)** Admin pages look “plain/template-like” vs marketplace
  - Fix: Apply same design system tokens (spacing, typography, buttons, cards, tables).

---

## Cross-Cutting Fix Suggestions (Apply Everywhere)

### AUTH ERROR COPY + PLACEMENT
- **AUTH-GLOBAL-01 (P0)** Replace ugly auth errors (e.g., “CredentialsSignin”) with friendly copy
  - Fix: “Incorrect email or password.” (not “invalid credentials”, not raw provider codes)
  - Placement: Bottom-of-form inline error + bottom toast; avoid top banners that encourage repeated clicking.

### LOGIN SECURITY
- **SEC-GLOBAL-01 (P0)** Maximum login attempt + rate limiting
  - Fix: Per-IP + per-account throttling, exponential backoff, temporary lockout; 429 responses + friendly UI.

### DOUBLE SUBMIT / IDEMPOTENCY (All critical actions)
- **SAFE-GLOBAL-01 (P0)** Prevent duplicates on:
  - signup, login, create listing, send message, submit offer, accept offer, report submit
  - Fix: disable buttons + server idempotency keys + unique constraints.

### ERROR HANDLING QUALITY BAR
- **UX-GLOBAL-01 (P1)** Every failure must have:
  - clear error text, mobile-friendly placement (bottom), actionable next step
  - Fix: standard error component; no raw codes; no silent failures.

### TOAST/SUCCESS STANDARDIZATION
- **UX-GLOBAL-02 (P2)** Every success must have:
  - confirmation + next-step CTA; consistent bottom toast pattern

### NATIVE DIALOGS
- **UX-GLOBAL-03 (P2)** Remove browser alerts/prompts/confirms
  - Fix: unified branded modal component.

### TYPO/COPY POLISH
- **POLISH-GLOBAL-01 (P3)** Fix typos like listing titles (e.g., “Fish tand”) and awkward strings
  - Fix: moderation assist + simple spell warnings; never ship placeholder helper text.

### PERFORMANCE / ACCESSIBILITY
- **POLISH-GLOBAL-02 (P3)** Improve responsiveness, tap targets, keyboard nav, and image loading
  - Fix: consistent layout grid + a11y checks + image sizing/lazy loading.

---

## Notes for Engineering
- Keep platform-neutral language: “offers”, “seller accepts”, avoid “winner/sold automatically”.
- Restricted/under-18 must be blocked server-side from: offers, messages, listings, orders, feedback, profile updates enabling transactions.
- Prohibited items must be blocked server-side at listing creation.

