# Bidra Phase 3 Growth Register

Phase 3 starts after Phase 2 production readiness is green.

## Operating rule

Each Phase 3 fix must stay narrow, use its own branch, include a static regression check where practical, pass the full local verification suite, and merge through PR.

## Scope

Phase 3 focuses on growth, conversion, trust polish, activation, discovery, SEO, and premium user confidence.

## Non-goals

- No payment model change.
- No large redesign in one PR.
- No unrelated cleanup.
- No analytics/vendor tracking implementation until the event plan is approved.

## Fix order

1. PHASE3-00 - Create Phase 3 growth register.
2. GROWTH-02 - Sharpen homepage conversion.
3. LISTING-04 - Improve listing card conversion.
4. SEARCH-03 - Improve zero-state and guided discovery.
5. SELLER-02 - Improve seller profile confidence.
6. ONBOARD-01 - Improve first-run buyer and seller onboarding.
7. SEO-03 - Expand marketplace landing SEO.
8. TRUST-05 - Add safety education moments.
9. SUPPORT-03 - Improve help center task routing.
10. ANALYTICS-01 - Add privacy-safe conversion event plan.
11. POLISH-01 - Premium microcopy and consistency sweep.

## Definition of done

- Production health remains green.
- Critical public routes still build.
- Changes are visible, useful, and directly tied to conversion or trust.
- Each PR has acceptance proof and rollback notes.
