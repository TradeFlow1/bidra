# Bidra public back navigation QA

## Goal

Every public-facing page should give users an obvious way back to the right parent area without relying only on browser back.

## Must verify

- Public legal, help, support, pricing, about, auth, listing, category, seller, and sell pages show a visible back link near the top.
- Back links use the shared BackButton component and existing bd-back-link styling.
- Home page is excluded because it is the top-level entry point.
- Listing detail retains its existing Back to listings control.
- Auth recovery and verification pages point back to login or dashboard where appropriate.
- Category, category-location, seller, and listing browse pages point back to listings or home.
- No public page has horizontal overflow on mobile.
- Back links do not appear twice on pages that already had BackButton.
- Alias or redirect pages may use BIDRA_BACK_NAV_ALIAS_PAGE when the canonical destination owns visible back navigation.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
