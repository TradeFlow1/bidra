# Bidra fraud and risk event logging foundation QA

## Goal

Improve risk-signal visibility and event logging using existing Bidra models without claiming automated fraud detection, payment fraud scoring, external provider checks, or machine-learning decisions.

## Included in this PR

- Adds a shared risk signal helper using existing account, report, strike, restriction, and account-age fields.
- Admin users list shows risk level and report counts.
- Admin user detail shows a Risk signal review panel.
- Admin events page frames events as audit and risk-signal events.
- Scam/fraud and safety listing reports create REPORT_RISK_SIGNAL_RECORDED admin events with IP and user-agent context.
- Order issue reports include IP, user-agent, source, and riskSignal metadata.
- Support explains how Bidra reviews risk signals without overpromising.

## Explicitly not included

- No automated bans.
- No automated fraud decisions.
- No payment fraud scoring.
- No external fraud provider.
- No ML risk scoring.
- No Stripe Radar integration.
- No schema migration.

## Manual QA

- Log in as admin and open /admin/users.
- Confirm each user row shows Risk level and report counts.
- Open /admin/users/[id] and confirm Risk signal review appears after Verification signals.
- Open /admin/events and confirm copy says risk-signal events support human review.
- Submit a listing report with SCAM_OR_FRAUD or SAFETY_RISK and verify an admin event is created.
- Submit an order issue report and verify admin event metadata contains source, ip, userAgent, and riskSignal.
- Open /support and confirm risk wording does not claim automated fraud detection or payment fraud scoring.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
