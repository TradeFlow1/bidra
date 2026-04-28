# AUTH-03 - Add login rate limiting

**Priority:** P0

**Area:** Security

**Milestone:** P0 Auth and Security

## Problem

Add per-IP and per-account throttling with friendly 429 response.

## Acceptance criteria

Repeated failed login attempts are throttled.

## Regression requirement

Security test simulates repeated attempts and expects throttle.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
