# ADMIN-03 - Replace admin native dialogs

**Priority:** P2

**Area:** Admin UX

**Milestone:** P2 Premium UX

## Problem

Admin confirm and prompt flows should use branded modal with clear consequences.

## Acceptance criteria

No browser alert confirm prompt remains in admin flows.

## Regression requirement

Static check rejects alert confirm prompt in admin files.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
