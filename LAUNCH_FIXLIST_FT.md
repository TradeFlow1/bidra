# Bidra — Friend Test Launch Fix List (Matchbox)
Rule: Only tick [x] AFTER: (1) npm run build is green AND (2) git commit + push is done.
Rule: One checkbox = one focused change-set (minimal regress).

## Screenshot references (do not delete)
- Account settings: ./_fix_refs/account settings.png
- Messages: ./_fix_refs/messages.png
- Sell/new: ./_fix_refs/sell.png
- Browse: ./_fix_refs/browse.png
- Home: ./_fix_refs/home.png
- Orders: ./_fix_refs/orders.png
- Dashboard: ./_fix_refs/dashboard.png

---

## P0 — Must fix before Friend Test (trust, usability, payment, privacy)
- [x] CATS-01: Categories are unclear. Replace with full Category + Subcategory taxonomy (eBay/Gumtree style, original copy). Apply consistently on: Home category chips, /listings filters, /sell/new dropdown.
- [x] PAY-01: Remove any hardcoded support@bidra.com.au usage in user-facing flows/legal copy. Replace with neutral wording (no email) OR configurable seller contact.
- [x] PAY-02: PayID/Osko payment: allow sellers to set PayID details in Account Settings (optional). After a sale: if seller has PayID show instructions; if not, show “Contact seller to arrange payment.”
- [x] ACCT-01: Consolidate /dashboard and /account into one simple “My Account” hub (keep routes, but make one redirect or one canonical UI).
- [x] MSG-01: /messages UI: fix white text on white pill (Messages screenshot). Ensure pill text is dark and readable.
- [x] MSG-02: Messages list + thread: show listing photo thumbnail in the chat header / thread area so users know which listing it’s for.
- [x] LOC-01: Location rules everywhere: require Suburb + Postcode + State (NOT either/or) on signup + account. Ensure privacy copy avoids revealing exact suburb examples publicly.
- [x] LOC-02: Listing cards should display: "{postcode} {suburb}, {STATE}" (example format only; avoid exposing “where I live” in examples). Autofill /sell/new from profile but allow manual change.
- [x] FOOT-01: Footer must sit at bottom on all pages. Fix pages where footer appears halfway up (Messages/Orders screenshots show large empty space).
- [x] DOB-01: Signup DOB input: replace clunky calendar with a reel/spinner style selector for day/month/year (fast mobile signup).
- [x] OFF-01: Highest offer / Outbid indicator needs more colour/visual emphasis so it grabs attention (Browse screenshot).
- [x] STRIKE-01: Remove all current strikes/restrictions for all users (reset for Friend Test environment).
- [x] AUTH-01: Remove duplicate reset-password routes shown in /profile (only one clear reset path).
- [x] BLOCK-01: When a user clears the required feedback/log, unblock immediately (no stale block state).
- [ ] DASH-01: Seller/Bought/Expired/Active listings are confusing (seller view needs clear separation + labels).
- [ ] HOME-01: Home page mobile hero gets cut off (Home screenshot) — fix spacing/responsiveness.

## P1 — Friend Test temporary pages (must be removable cleanly later)
- [ ] FT-01: Friend Test feedback/suggestions page: keep for testing, but isolate so it can be deleted later (feature-flag or clearly separated route).
- [ ] FT-02: Temporary friends/family test reporting: keep for testing, but isolate so it can be deleted later.

## P2 — Structured audit passes (do last, but before public launch)
- [ ] AUDIT-PUB-01: Scan EVERY public page end-to-end (no functionality changes): visual/theme consistency + broken UI + copy.
- [ ] AUDIT-ADM-01: Scan EVERY admin page end-to-end: broken UI + policy correctness.
- [ ] AUDIT-OTHER-01: Scan non-FT-impact pages: note issues but don’t regress FT.

