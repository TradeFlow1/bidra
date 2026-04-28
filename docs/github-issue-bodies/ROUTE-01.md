# ROUTE-01 - Fix unknown route behavior

**Priority:** P0

**Area:** Routing

**Milestone:** P0 Trust and Launch Blocking

## Problem

Unknown routes should render branded 404 instead of redirecting to login.

## Acceptance criteria

Random invalid public route shows 404 and no auth fallback.

## Regression requirement

Smoke test visits invalid route and expects 404 content.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
