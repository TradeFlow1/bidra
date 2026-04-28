# SEARCH-01 - Make search submit on Enter

**Priority:** P0

**Area:** Search

**Milestone:** P0 Trust and Launch Blocking

## Problem

Search must be a real form with submit handling and accessible button.

## Acceptance criteria

Enter key and button both navigate to results.

## Regression requirement

Smoke test types search and presses Enter.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
