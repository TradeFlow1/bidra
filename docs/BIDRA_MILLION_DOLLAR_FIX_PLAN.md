# Bidra Million Dollar Fix Plan

Generated: 2026-04-28 11:21:02

Rule: no issue is done until it has a GitHub issue, acceptance criteria, a scripted patch, and a regression test or smoke check.

## Fix register

| ID | Priority | Area | Milestone | Title | Status |
|---|---:|---|---|---|---|
| CONTROL-01 | P0 | Process | P0 Control System | Create GitHub labels, milestones, and issue backlog | Backlog |
| CONTROL-02 | P0 | Testing | P0 Control System | Add regression test harness | Backlog |
| CONTROL-03 | P0 | CI | P0 Control System | Expand GitHub Actions quality gate | Backlog |
| CONTROL-04 | P0 | PR Quality | P0 Control System | Add PR proof template | Backlog |
| PRODUCT-01 | P0 | Product Promise | P0 Trust and Launch Blocking | Lock V1 and V2 marketplace promise | Backlog |
| TRUST-01 | P0 | Public Trust | P0 Trust and Launch Blocking | Make legal and trust pages public and consistent | Backlog |
| TRUST-02 | P0 | Public UX | P0 Trust and Launch Blocking | Replace blank and loading public states | Backlog |
| ROUTE-01 | P0 | Routing | P0 Trust and Launch Blocking | Fix unknown route behavior | Backlog |
| AUTH-01 | P0 | Auth | P0 Auth and Security | Fix forgot-password route | Backlog |
| AUTH-02 | P0 | Auth | P0 Auth and Security | Replace raw auth errors | Backlog |
| AUTH-03 | P0 | Security | P0 Auth and Security | Add login rate limiting | Backlog |
| AUTH-04 | P1 | Account UX | P1 Core Marketplace Flows | Clarify buyer seller admin role | Backlog |
| SEARCH-01 | P0 | Search | P0 Trust and Launch Blocking | Make search submit on Enter | Backlog |
| LISTING-01 | P0 | Listings | P0 Trust and Launch Blocking | Replace raw unauthenticated listing CTA | Backlog |
| LISTING-02 | P1 | Seller Listings | P1 Core Marketplace Flows | Fix seller edit delete confirmation flow | Backlog |
| WATCH-01 | P1 | Watchlist | P1 Core Marketplace Flows | Fix watchlist toggle and empty state | Backlog |
| MESSAGE-01 | P0 | Messaging | P0 Transaction Safety | Block off-platform contact details server-side | Backlog |
| MESSAGE-02 | P1 | Messaging | P1 Core Marketplace Flows | Fix message sending state reliability | Backlog |
| OFFER-01 | P0 | Offers | P0 Transaction Safety | Add offer confirmation and instant UI update | Backlog |
| OFFER-02 | P0 | Idempotency | P0 Transaction Safety | Prevent duplicate critical actions | Backlog |
| ORDER-01 | P1 | Orders | P1 Core Marketplace Flows | Make order feedback payment next actions clear | Backlog |
| ADMIN-01 | P1 | Admin | P1 Admin and Moderation | Build admin user moderation controls | Backlog |
| ADMIN-02 | P1 | Admin | P1 Admin and Moderation | Build admin listing moderation controls | Backlog |
| ADMIN-03 | P2 | Admin UX | P2 Premium UX | Replace admin native dialogs | Backlog |
| UX-01 | P1 | Design System | P2 Premium UX | Standardize toast error modal components | Backlog |
| SEO-01 | P1 | SEO | P3 Growth and Marketplace Density | Add marketplace SEO structure | Backlog |
| PERF-01 | P2 | Performance | P2 Premium UX | Improve accessibility performance image quality | Backlog |
| GROWTH-01 | P1 | Marketplace Supply | P3 Growth and Marketplace Density | Seed real marketplace liquidity | Backlog |

## Definition of Done

- GitHub issue exists with the same ID.
- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Fix includes a regression test, smoke test, or explicit route check.
- npm run lint passes.
- npm run build passes.
- After the test harness exists, npm run test and npm run test:smoke pass.
- PR body includes issue ID, acceptance proof, and command output.

## Fix order

1. CONTROL-01 to CONTROL-04
2. PRODUCT-01, TRUST-01, TRUST-02, ROUTE-01
3. AUTH-01 to AUTH-04
4. SEARCH-01, LISTING-01, LISTING-02, WATCH-01
5. MESSAGE-01, MESSAGE-02, OFFER-01, OFFER-02, ORDER-01
6. ADMIN-01 to ADMIN-03
7. UX-01, SEO-01, PERF-01, GROWTH-01
