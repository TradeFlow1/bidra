# ORDER-01 - Make order feedback payment next actions clear

**Priority:** P1

**Area:** Orders

**Milestone:** P1 Core Marketplace Flows

## Problem

Every order state must show one obvious next action or explanation.

## Acceptance criteria

No dead-end Pay now or Leave feedback flows.

## Regression requirement

Order smoke test checks key order states.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
