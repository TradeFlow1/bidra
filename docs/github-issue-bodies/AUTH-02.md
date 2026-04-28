# AUTH-02 - Replace raw auth errors

**Priority:** P0

**Area:** Auth

**Milestone:** P0 Auth and Security

## Problem

Provider codes and ugly auth strings must be replaced with clear user-safe copy.

## Acceptance criteria

Bad login shows friendly message, not raw provider error.

## Regression requirement

Auth test submits bad credentials and checks error copy.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
