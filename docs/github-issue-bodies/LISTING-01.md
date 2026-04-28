# LISTING-01 - Replace raw unauthenticated listing CTA

**Priority:** P0

**Area:** Listings

**Milestone:** P0 Trust and Launch Blocking

## Problem

Logged-out offer and message areas should show premium sign-in prompt with return path.

## Acceptance criteria

No NOT_AUTHENTICATED text appears in UI.

## Regression requirement

Smoke test checks listing detail while logged out.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
