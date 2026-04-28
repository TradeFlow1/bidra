# TRUST-01 - Make legal and trust pages public and consistent

**Priority:** P0

**Area:** Public Trust

**Milestone:** P0 Trust and Launch Blocking

## Problem

Privacy, terms, prohibited items, fees, support, safety, and feedback pages must not require login.

## Acceptance criteria

Logged-out users can access all public trust pages.

## Regression requirement

Smoke test visits each public trust route while logged out.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
