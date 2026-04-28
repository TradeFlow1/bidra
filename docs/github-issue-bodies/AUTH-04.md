# AUTH-04 - Clarify buyer seller admin role

**Priority:** P1

**Area:** Account UX

**Milestone:** P1 Core Marketplace Flows

## Problem

Menu and dashboard must show the current account role clearly.

## Acceptance criteria

Buyer, seller, and admin sessions are visibly distinct.

## Regression requirement

Role display test checks dashboard and header output.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
