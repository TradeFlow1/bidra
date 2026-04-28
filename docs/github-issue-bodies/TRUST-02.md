# TRUST-02 - Replace blank and loading public states

**Priority:** P0

**Area:** Public UX

**Milestone:** P0 Trust and Launch Blocking

## Problem

Public pages must never show blank chrome or permanent Loading text.

## Acceptance criteria

Signed-out and empty states have clear explanation and CTA.

## Regression requirement

Smoke test rejects visible permanent Loading text on public routes.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
