# Bidra – Engineer-Ready QA Fix List (Full Website)
Generated: 2026-01-29 17:05:41

Rules:
- Fix in this exact order.
- P0 first, then P1, then P2, then P3.
- Each item includes: ID, Severity, Status, Roles, Where, Repro, Expected, Actual, Root-cause hypothesis, Fix approach, Acceptance criteria.

---

## P0 – Launch Blockers

### 1) ID: AUTH-GLOBAL-01
- Severity: P0
- Status: LIKELY
- Roles affected: Logged-out / Buyer / Seller / Admin
- Where: /auth/login (and any auth error UI)
- Repro steps:
  1. Go to /auth/login
  2. Enter an incorrect email/password
  3. Submit login
- Expected result:
  - Error message is clear and human: "Incorrect email or password."
  - Error appears at the bottom of the form (inline) + optional bottom toast.
- Actual result:
  - Error can appear as raw provider text (e.g. "CredentialsSignin") or unclear wording, sometimes placed poorly encouraging repeated clicks.
- Root-cause hypothesis:
  - Auth error codes are surfaced directly without mapping; UI places errors in a generic banner location.
- Fix approach:
  - Map auth/provider error codes to friendly copy in login handler/UI.
  - Render inline error under password field and/or bottom-of-form error container.
- Acceptance criteria:
  - All failed logins show "Incorrect email or password." at the bottom of the form.
  - No raw auth codes ever appear in production UI.

### 2) ID: SEC-GLOBAL-01
- Severity: P0
- Status: LIKELY
- Roles affected: Logged-out / Buyer / Seller / Admin
- Where: /auth/login, /api/auth/* (login, forgot-password)
- Repro steps:
  1. Attempt to log in with wrong password 15+ times quickly.
  2. Repeat from the same IP and same account.
- Expected result:
  - Throttling / temporary lockout occurs.
  - User sees a clear message (e.g., "Too many attempts. Try again later or reset your password.")
- Actual result:
  - No visible throttling or lockout (brute-force risk).
- Root-cause hypothesis:
  - No rate limiting middleware on auth endpoints; no per-account lockout counter.
- Fix approach:
  - Add per-IP + per-account rate limiting with escalating backoff.
  - Store failed attempt counters and lock windows (e.g., 10 attempts → 15 min lock).
- Acceptance criteria:
  - Excessive attempts return 429 or lockout response.
  - UI shows a friendly lockout message and offers password reset CTA.

### 3) ID: LIST-LOGOUT-01
- Severity: P0
- Status: LIKELY
- Roles affected: Logged-out
- Where: /listings/[id] (offer UI area)
- Repro steps:
  1. Log out
  2. Open any listing detail page
  3. View offer section
- Expected result:
  - Offer UI prompts "Sign in to make an offer" with button to login and return.
- Actual result:
  - Raw placeholder appears (e.g., NOT_AUTHENTICATED) instead of friendly gating.
- Root-cause hypothesis:
  - UI renders internal auth state constant instead of UX copy.
- Fix approach:
  - Replace placeholder with signed-out gate component.
  - Add returnUrl to login.
- Acceptance criteria:
  - No raw placeholders appear anywhere; signed-out gating is clear and branded.

### 4) ID: SEARCH-LOGOUT-01
- Severity: P0
- Status: LIKELY
- Roles affected: Logged-out / Buyer / Seller
- Where: /listings search bar (and homepage search if present)
- Repro steps:
  1. Go to /listings
  2. Type a search term
  3. Press Enter
- Expected result:
  - Enter submits search and results update.
- Actual result:
  - Enter may do nothing; users must click small text "Show results".
- Root-cause hypothesis:
  - Search input not inside a form; no onSubmit handler.
- Fix approach:
  - Wrap in <form> with onSubmit; add a proper Search button.
- Acceptance criteria:
  - Enter key submits search every time; button is visually obvious.

### 5) ID: MSG-BUY-01
- Severity: P0
- Status: VERIFIED
- Roles affected: Buyer / Seller
- Where: /messages/[thread]
- Repro steps:
  1. Open a message thread
  2. Type a phone number/email (e.g., 0412... or test@example.com)
  3. Attempt to send
- Expected result:
  - Message is blocked or redacted; user cannot send contact details.
  - Clear error explaining policy and next step.
- Actual result:
  - Warning appears, but user can still send anyway; Send stays active (policy bypass).
- Root-cause hypothesis:
  - Only client-side warning exists; server allows content through.
- Fix approach:
  - Add server-side message content enforcement (block/redact).
  - Disable send when violation detected; log attempts for moderation.
- Acceptance criteria:
  - Contact/payment details cannot be sent (server-side enforced).
  - User receives clear, bottom-anchored error + guidance.

### 6) ID: SAFE-GLOBAL-01
- Severity: P0
- Status: LIKELY
- Roles affected: Buyer / Seller / Admin
- Where: Signup, Login, Create listing, Send message, Submit offer, Admin actions
- Repro steps:
  1. Rapid double-click submit actions (signup/login/offer/message/create listing)
  2. Observe if duplicates occur
- Expected result:
  - One action only; no duplicates.
- Actual result:
  - Duplicate submits likely possible; inconsistent disable states.
- Root-cause hypothesis:
  - Buttons not disabled during pending; no idempotency server-side.
- Fix approach:
  - Disable buttons during pending.
  - Add idempotency keys for write actions and reject duplicates.
- Acceptance criteria:
  - Double-submit never creates duplicates across all critical flows.

### 7) ID: AUTH-LOGOUT-03
- Severity: P0
- Status: LIKELY
- Roles affected: Logged-out
- Where: /auth/login (Forgot password link)
- Repro steps:
  1. Go to /auth/login
  2. Click "Forgot password?"
- Expected result:
  - Navigates to /forgot-password and works.
- Actual result:
  - Misroutes or fails in some cases.
- Root-cause hypothesis:
  - Incorrect href or route mismatch.
- Fix approach:
  - Fix href and ensure route exists publicly.
- Acceptance criteria:
  - Link always routes to working reset request page.

### 8) ID: AUTH-LOGOUT-01
- Severity: P0
- Status: LIKELY
- Roles affected: Logged-out
- Where: /legal/* pages (Privacy/Terms/Prohibited Items/Support)
- Repro steps:
  1. Log out
  2. Open footer links to Privacy/Terms/etc.
- Expected result:
  - Public pages load without auth.
- Actual result:
  - Some legal/trust pages may require login (trust blocker).
- Root-cause hypothesis:
  - Over-broad auth middleware protecting /legal routes.
- Fix approach:
  - Remove gating from public legal routes.
- Acceptance criteria:
  - All legal/trust pages load logged out.


## P1 – Core Flow Breakers

### 1) ID: OFFER-BUY-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Buyer
- Where: /listings/[id] (offer submission)
- Repro steps:
  1. Open listing
  2. Submit offer
- Expected result:
  - Toast confirmation + UI updates
- Actual result:
  - No confirmation; user unsure
- Root-cause hypothesis:
  - Modal closes without awaiting API; no success state
- Fix approach:
  - Await API; show toast; update offer state
- Acceptance criteria:
  - Offer always shows success toast and updates UI

### 2) ID: LIST-SELL-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Seller
- Where: Seller listing page (post-create view)
- Repro steps:
  1. Create a listing
  2. View listing page
  3. Try to click “Edit listing”
- Expected result:
  - Edit action is a working link/button
- Actual result:
  - “Edit listing” appears but is not clickable
- Root-cause hypothesis:
  - Heading rendered without link/button
- Fix approach:
  - Add explicit button linking to edit route
- Acceptance criteria:
  - Sellers can edit listing from listing page reliably

### 3) ID: LIST-LOGOUT-02
- Severity: P1
- Status: LIKELY
- Roles affected: Logged-out
- Where: /listings/[id] (Message seller CTA)
- Repro steps:
  1. Log out
  2. Click “Message seller”
- Expected result:
  - Redirect to login with return path OR inline login prompt
- Actual result:
  - Can hang on “Opening chat…”
- Root-cause hypothesis:
  - Chat creation endpoint requires session and returns ambiguous state
- Fix approach:
  - Gate CTA for logged-out; ensure deterministic redirect
- Acceptance criteria:
  - No “Opening chat…” hang; always clear next step

### 4) ID: WATCH-BUY-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Buyer / Seller
- Where: /watchlist and watch buttons on listing cards
- Repro steps:
  1. Click Watch on listing card
  2. Visit /watchlist
  3. Remove item
- Expected result:
  - Immediate UI toggle; clear confirmation
- Actual result:
  - Requires multiple clicks; no confirmation; state unclear
- Root-cause hypothesis:
  - State not synced; click handlers flaky
- Fix approach:
  - Fix state updates; add toast; ensure single-click toggle
- Acceptance criteria:
  - Watch/unwatch always reflects instantly and correctly

### 5) ID: ORDER-BUY-01
- Severity: P1
- Status: LIKELY
- Roles affected: Buyer
- Where: /orders/[id]
- Repro steps:
  1. Open an unpaid order
  2. Look for payment CTA
- Expected result:
  - “Pay now” button that works
- Actual result:
  - “Pay now to continue” but no actionable button in some states
- Root-cause hypothesis:
  - Payment route/session not created or UI hides CTA
- Fix approach:
  - Ensure payment page exists and CTA always present
- Acceptance criteria:
  - Unpaid orders always provide pay flow CTA

### 6) ID: ADM-USERS-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Admin
- Where: /admin/users
- Repro steps:
  1. Open /admin/users
  2. Click a user row
- Expected result:
  - Opens that user’s admin detail view
- Actual result:
  - Opens admin’s own profile / wrong user
- Root-cause hypothesis:
  - Link uses current user ID instead of row user ID
- Fix approach:
  - Fix link mapping; create /admin/users/[id]
- Acceptance criteria:
  - Clicking user opens correct detail page with moderation controls

### 7) ID: ADM-LIST-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Admin
- Where: /admin/listings
- Repro steps:
  1. Open /admin/listings
  2. Click listing
- Expected result:
  - Admin moderation tools appear (suspend/delete/restore)
- Actual result:
  - Opens public listing; no admin actions available
- Root-cause hypothesis:
  - Admin page reuses public listing link without moderation UI
- Fix approach:
  - Add admin listing detail page with actions + logging
- Acceptance criteria:
  - Admin can moderate listings from admin UI

### 8) ID: ADM-USERS-02
- Severity: P1
- Status: LIKELY
- Roles affected: Admin
- Where: Admin user detail UI
- Repro steps:
  1. Attempt to strike/block/unblock a user
- Expected result:
  - Controls exist + confirmation modal + audit log entry
- Actual result:
  - Controls missing or unusable
- Root-cause hypothesis:
  - Moderation actions not implemented on user detail
- Fix approach:
  - Add strike/ban controls + logging
- Acceptance criteria:
  - Admin can execute moderation actions safely and auditably

### 9) ID: AUTH-LOGOUT-02
- Severity: P0
- Status: VERIFIED
- Roles affected: Logged-out
- Where: Unknown/invalid routes (global routing)
- Repro steps:
  1. Visit an invalid route (e.g., /this-does-not-exist)
  2. Observe where you land
- Expected result:
  - Branded 404 / not-found page (no auth fallback)
- Actual result:
  - Some invalid routes redirect to login instead of consistent 404
- Root-cause hypothesis:
  - Middleware or auth guard catches unknown routes and redirects to /auth/login
- Fix approach:
  - Ensure unknown routes always resolve to Next.js not-found; avoid auth fallback for unknown paths
- Acceptance criteria:
  - Invalid routes always show 404 (logged-in or logged-out) with no redirect loop
### 10) ID: AUTH-BUY-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Buyer / Seller / Admin
- Where: Header menu / dashboard
- Repro steps:
  1. Sign in as buyer/seller/admin
  2. Open header menu / dashboard
- Expected result:
  - Session role is obvious (Buyer/Seller/Admin indicator)
- Actual result:
  - Role clarity is not obvious; confusion risk
- Root-cause hypothesis:
  - UI lacks role indicator / account type label
- Fix approach:
  - Add account type indicator in menu and/or dashboard header
- Acceptance criteria:
  - Role indicator visible and accurate on all signed-in experiences
---

### 11) ID: LIST-SELL-02
- Severity: P1
- Status: VERIFIED
- Roles affected: Seller
- Where: Listing management (delete listing)
- Repro steps:
  1. Attempt to delete a listing
  2. Observe confirmation UX
- Expected result:
  - Branded confirmation modal + clear success state
- Actual result:
  - Uses native browser confirm dialog
- Root-cause hypothesis:
  - window.confirm used for destructive action
- Fix approach:
  - Replace confirm() with branded modal; on success show toast + redirect
- Acceptance criteria:
  - No native confirm; consistent UX; delete is clearly confirmed and completed
---

### 12) ID: MSG-BUY-02
- Severity: P1
- Status: VERIFIED
- Roles affected: Buyer / Seller
- Where: Messaging threads
- Repro steps:
  1. Send a message
  2. Observe sending state and delivery feedback
- Expected result:
  - Clear delivered or error state; retry option; no indefinite sending
- Actual result:
  - Can hang on “Sending…” / unclear delivery
- Root-cause hypothesis:
  - Client state not updated on network errors / request timeouts not handled
- Fix approach:
  - Always resolve send promise to success/error; show delivered timestamp or error + retry
- Acceptance criteria:
  - Messages never remain indefinitely “Sending…”
---

### 13) ID: OFFER-BUY-02
- Severity: P1
- Status: VERIFIED
- Roles affected: Buyer
- Where: Offer submission flow
- Repro steps:
  1. Submit an offer
  2. Refresh/back/multi-tab repeat
- Expected result:
  - Idempotent offer submission; duplicates prevented
- Actual result:
  - Risk of duplicates / inconsistent UI after refresh/back
- Root-cause hypothesis:
  - No idempotency token / server duplicate protection
- Fix approach:
  - Add idempotency token per offer; server rejects duplicates; client disables button
- Acceptance criteria:
  - Duplicate offers not created under repeat submits/refresh/back
---

### 14) ID: WATCH-SELL-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Seller
- Where: Watch button (seller view)
- Repro steps:
  1. Click Watch on a listing
  2. Observe UI state
- Expected result:
  - Immediate toggle + visible feedback + toast
- Actual result:
  - No visible feedback / state doesn’t reflect reliably
- Root-cause hypothesis:
  - UI not optimistic; state reconciliation missing
- Fix approach:
  - Optimistic toggle; reconcile with server; show toast
- Acceptance criteria:
  - Watch/unwatch is single click with consistent visual state + toast
---

### 15) ID: FEED-BUY-01
- Severity: P1
- Status: VERIFIED
- Roles affected: Buyer
- Where: Feedback action routing/buttons
- Repro steps:
  1. Click Leave Feedback from orders/dashboard
  2. Submit feedback
- Expected result:
  - Reliable route + success state after submit
- Actual result:
  - Button/route sometimes unreliable or unclear completion
- Root-cause hypothesis:
  - Incorrect route mapping or missing post-submit UX
- Fix approach:
  - Fix routing; add success toast/state; ensure button always points to correct order/listing context
- Acceptance criteria:
  - Leave Feedback always works; success state is clear
---

---

---

## P2 – Trust & UX

### 1) ID: UX-GLOBAL-02
- Severity: P2
- Status: VERIFIED
- Roles affected: All
- Where: All critical actions (offers/messages/listings/admin actions)
- Repro steps:
  1. Perform actions that should show success/failure
- Expected result:
  - Clear bottom toast + next step CTA
- Actual result:
  - Many actions have no confirmation or use native dialogs
- Root-cause hypothesis:
  - No unified toast system applied across pages
- Fix approach:
  - Implement global toast and use consistently
- Acceptance criteria:
  - Every action gives success/failure feedback consistently at bottom

### 2) ID: UX-GLOBAL-03
- Severity: P2
- Status: VERIFIED
- Roles affected: All
- Where: Delete listing / report chat / admin AI actions
- Repro steps:
  1. Trigger delete/report/admin confirm actions
- Expected result:
  - Branded modal confirmation
- Actual result:
  - Browser confirm/prompt used
- Root-cause hypothesis:
  - Native dialogs used for speed
- Fix approach:
  - Replace with branded modal component
- Acceptance criteria:
  - No native confirm/prompt/alert remains in production

### 3) ID: ADM-UI-01
- Severity: P2
- Status: VERIFIED
- Roles affected: Admin
- Where: /admin pages
- Repro steps:
  1. Compare admin UI to public marketplace UI
- Expected result:
  - Same premium styling + layout
- Actual result:
  - Admin looks plain/template-like
- Root-cause hypothesis:
  - Admin pages not using the design system
- Fix approach:
  - Apply shared UI components + tokens
- Acceptance criteria:
  - Admin UI matches marketplace polish


## P3 – Polish

### 1) ID: POLISH-GLOBAL-02
- Severity: P3
- Status: LIKELY
- Roles affected: All
- Where: Mobile layouts, tap targets, keyboard nav, image loading
- Repro steps:
  1. Test on mobile widths
  2. Tap critical CTAs and use keyboard navigation
- Expected result:
  - No horizontal scroll; 44px+ tap targets; proper focus states
- Actual result:
  - Some pages feel cramped; tap targets and spacing inconsistent
- Root-cause hypothesis:
  - Inconsistent spacing and breakpoints
- Fix approach:
  - Standardize spacing scale; audit mobile layouts
- Acceptance criteria:
  - Mobile UX meets marketplace-grade standards

### 2) ID: ACC-SELL-01
- Severity: P2
- Status: VERIFIED
- Roles affected: Seller / Buyer
- Where: Account Settings
- Repro steps:
  1. Save account settings changes
  2. Observe confirmation UX
- Expected result:
  - Consistent anchored bottom toast confirmation
- Actual result:
  - Confirmation pattern inconsistent (sometimes green banner)
- Root-cause hypothesis:
  - Mixed success UI patterns across pages
- Fix approach:
  - Standardize to bottom toast success pattern for account save
- Acceptance criteria:
  - Account save always shows consistent bottom toast confirmation
### 3) ID: POLISH-GLOBAL-01
- Severity: P3
- Status: VERIFIED
- Roles affected: All
- Where: Copy/typos across listings and UI strings
- Repro steps:
  1. Browse listings/UI copy
  2. Note obvious typos/awkward strings (e.g., “Fish tand”)
- Expected result:
  - Professional copy; no obvious typos
- Actual result:
  - Occasional typos / awkward strings
- Root-cause hypothesis:
  - No lightweight spell/copy checks; no moderation assist
- Fix approach:
  - Simple spell warnings; moderation assist; never ship placeholder helper text
- Acceptance criteria:
  - No obvious typos in common flows
---

---

### 4) ID: ADM-REPORT-01
- Severity: P2
- Status: VERIFIED
- Roles affected: Admin
- Where: Admin reports / AI actions
- Repro steps:
  1. Trigger an AI action from admin report
  2. Observe confirmation UX
- Expected result:
  - Branded modal with premium copy and explicit consequences
- Actual result:
  - Uses native confirm prompt; copy not premium
- Root-cause hypothesis:
  - confirm() used; no unified admin modal
- Fix approach:
  - Branded confirmation modal; include consequences, undo notes, audit logging
- Acceptance criteria:
  - No native confirm; admin actions feel premium and logged
---

### 5) ID: LIST-SELL-03
- Severity: P2
- Status: VERIFIED
- Roles affected: Seller
- Where: Seller create/edit/delete actions
- Repro steps:
  1. Create/edit/delete listing
  2. Observe completion confirmation
- Expected result:
  - Clear consistent success confirmation (toast)
- Actual result:
  - No clear success confirmation after key actions
- Root-cause hypothesis:
  - Success UI inconsistent / missing toasts
- Fix approach:
  - Standardize bottom toast confirmations for create/edit/delete
- Acceptance criteria:
  - Seller actions always show clear success confirmation
---

### 6) ID: MSG-BUY-03
- Severity: P2
- Status: VERIFIED
- Roles affected: Buyer / Seller
- Where: Report in chat
- Repro steps:
  1. Use report action inside chat
  2. Observe UX
- Expected result:
  - Branded modal with category/reason + success state
- Actual result:
  - Uses native prompt
- Root-cause hypothesis:
  - prompt() used / missing modal
- Fix approach:
  - Replace with branded modal; require reason/category; show success toast
- Acceptance criteria:
  - No native prompt; report in chat is clear and logged
---

### 7) ID: UX-GLOBAL-01
- Severity: P1
- Status: VERIFIED
- Roles affected: All
- Where: Global error handling
- Repro steps:
  1. Trigger common failures (invalid input, server error)
  2. Observe error message UX
- Expected result:
  - Clear error text, mobile-friendly bottom placement, actionable next step
- Actual result:
  - Some failures show raw/unclear errors or inconsistent placement
- Root-cause hypothesis:
  - No unified error component / inconsistent patterns
- Fix approach:
  - Standard error component; no raw codes; no silent failures
- Acceptance criteria:
  - All failures show clear actionable messages in consistent placement
---

---

# End
