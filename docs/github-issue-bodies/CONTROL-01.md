# CONTROL-01 - Create GitHub labels, milestones, and issue backlog

**Priority:** P0

**Area:** Process

**Milestone:** P0 Control System

## Problem

Known fix list is converted into tracked GitHub issues with labels and milestones.

## Acceptance criteria

Every known fix has a GitHub issue with acceptance criteria.

## Regression requirement

Run issue import twice and confirm it does not duplicate issues.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
