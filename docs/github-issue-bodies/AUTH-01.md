# AUTH-01 - Fix forgot-password route

**Priority:** P0

**Area:** Auth

**Milestone:** P0 Auth and Security

## Problem

Login forgot-password link must route to a working public forgot-password page.

## Acceptance criteria

User can reach forgot-password from login while logged out.

## Regression requirement

Smoke test clicks forgot-password and confirms route.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
