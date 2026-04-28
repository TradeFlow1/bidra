# OFFER-01 - Add offer confirmation and instant UI update

**Priority:** P0

**Area:** Offers

**Milestone:** P0 Transaction Safety

## Problem

Offer submit must await API response, show confirmation, and update visible offer state.

## Acceptance criteria

User sees clear Offer sent state.

## Regression requirement

Offer smoke test submits once and checks confirmation.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
