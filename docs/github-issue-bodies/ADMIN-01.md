# ADMIN-01 - Build admin user moderation controls

**Priority:** P1

**Area:** Admin

**Milestone:** P1 Admin and Moderation

## Problem

Admin user detail page needs correct user mapping, strike, block, unblock, reset, and audit log.

## Acceptance criteria

Clicked user opens correct admin detail page.

## Regression requirement

Admin test opens two users and verifies distinct IDs.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
