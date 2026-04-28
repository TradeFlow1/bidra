# MESSAGE-01 - Block off-platform contact details server-side

**Priority:** P0

**Area:** Messaging

**Milestone:** P0 Transaction Safety

## Problem

Messages containing prohibited off-platform contact details should be blocked or redacted server-side and logged.

## Acceptance criteria

Client warning is not the only protection.

## Regression requirement

API test attempts phone or email and expects blocked response.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
