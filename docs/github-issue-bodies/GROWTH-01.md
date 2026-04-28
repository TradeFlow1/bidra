# GROWTH-01 - Seed real marketplace liquidity

**Priority:** P1

**Area:** Marketplace Supply

**Milestone:** P3 Growth and Marketplace Density

## Problem

Add enough real listings, remove duplicates, improve categories and locations.

## Acceptance criteria

Marketplace no longer feels empty or duplicated.

## Regression requirement

Listing audit checks duplicate titles and minimum seeded listing count in staging.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
