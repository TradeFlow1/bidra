# LISTING-02 - Fix seller edit delete confirmation flow

**Priority:** P1

**Area:** Seller Listings

**Milestone:** P1 Core Marketplace Flows

## Problem

Seller edit links must work and delete must use branded modal with success state.

## Acceptance criteria

Seller can edit or delete listing without native confirm dialog.

## Regression requirement

Seller smoke test validates edit link and delete modal.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
