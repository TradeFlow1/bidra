# PERF-01 - Improve accessibility performance image quality

**Priority:** P2

**Area:** Performance

**Milestone:** P2 Premium UX

## Problem

Improve tap targets, keyboard navigation, image loading, and layout stability.

## Acceptance criteria

Core pages meet defined accessibility and performance checks.

## Regression requirement

A11y and smoke checks cover public browse and listing pages.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
