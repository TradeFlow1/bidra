# CONTROL-03 - Expand GitHub Actions quality gate

**Priority:** P0

**Area:** CI

**Milestone:** P0 Control System

## Problem

CI should run install, Prisma generate, typecheck, tests, smoke tests, build, and lint.

## Acceptance criteria

Pull requests cannot pass with build-only confidence.

## Regression requirement

Break a smoke route locally and confirm CI or tests catch it.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
