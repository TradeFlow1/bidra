# PRODUCT-01 - Lock V1 and V2 marketplace promise

**Priority:** P0

**Area:** Product Promise

**Milestone:** P0 Trust and Launch Blocking

## Problem

Make homepage, how-it-works, listing pages, dashboard, legal, and support copy agree on what Bidra currently does.

## Acceptance criteria

No page promises escrow, in-app payment, shipping, or scheduling unless the feature fully works.

## Regression requirement

Route smoke test checks approved product-promise phrases.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
