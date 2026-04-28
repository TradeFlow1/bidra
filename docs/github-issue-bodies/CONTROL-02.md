# CONTROL-02 - Add regression test harness

**Priority:** P0

**Area:** Testing

**Milestone:** P0 Control System

## Problem

Add typecheck, unit or integration test, and smoke-test commands so fixes cannot silently regress.

## Acceptance criteria

package.json has test scripts and public route, auth, and listing smoke coverage.

## Regression requirement

CI fails when a protected public route breaks.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
