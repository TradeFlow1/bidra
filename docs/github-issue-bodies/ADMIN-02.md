# ADMIN-02 - Build admin listing moderation controls

**Priority:** P1

**Area:** Admin

**Milestone:** P1 Admin and Moderation

## Problem

Admin listing detail should support suspend, delete, restore, reason, and audit log.

## Acceptance criteria

Admin can moderate listing without only opening public page.

## Regression requirement

Admin test verifies moderation action creates audit entry.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
