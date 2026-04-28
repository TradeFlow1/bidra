# WATCH-01 - Fix watchlist toggle and empty state

**Priority:** P1

**Area:** Watchlist

**Milestone:** P1 Core Marketplace Flows

## Problem

Watch and unwatch should be one click with visible state, toast, and useful empty page.

## Acceptance criteria

No multiple-click watchlist behavior remains.

## Regression requirement

Watchlist smoke test toggles listing and checks empty state.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
