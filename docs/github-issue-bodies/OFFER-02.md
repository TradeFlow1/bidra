# OFFER-02 - Prevent duplicate critical actions

**Priority:** P0

**Area:** Idempotency

**Milestone:** P0 Transaction Safety

## Problem

Signup, login, listing creation, message send, offer submit, accept offer, and reports need duplicate protection.

## Acceptance criteria

Double-click or refresh does not create duplicate critical records.

## Regression requirement

API test sends duplicate idempotency key and expects safe response.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
