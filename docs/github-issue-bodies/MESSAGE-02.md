# MESSAGE-02 - Fix message sending state reliability

**Priority:** P1

**Area:** Messaging

**Milestone:** P1 Core Marketplace Flows

## Problem

Sending state must resolve to sent, failed, or retry. No indefinite spinner.

## Acceptance criteria

Message send cannot hang silently.

## Regression requirement

Message smoke test checks success and failure states.

## Definition of Done

- Patch is applied by PowerShell script from repo root.
- Patch script refuses to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git.
- Regression test, smoke test, or explicit route check is added.
- npm run lint passes.
- npm run build passes.
- PR body includes command output and acceptance proof.
