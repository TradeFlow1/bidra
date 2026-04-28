# CONTROL-04 - Add PR proof template

**Priority:** P0

**Area:** PR Quality

**Milestone:** P0 Control System

## Problem

Every PR must show issue ID, commands run, test added, screenshots where relevant, and rollback notes.

## Acceptance criteria

PRs without proof are not accepted.

## Regression requirement

Create a sample PR body and verify required sections exist.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
