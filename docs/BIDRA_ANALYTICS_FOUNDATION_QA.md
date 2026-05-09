# Bidra analytics foundation QA

## Goal

Clarify Bidra's current internal analytics foundation without claiming external analytics providers, attribution dashboards, event warehouses, marketing pixels, or cookie-consent tracking infrastructure.

## Included in this PR

- Adds a shared analytics foundation helper.
- Clarifies /admin/events as an internal operational event stream.
- Clarifies /admin/audit as moderation traceability, not marketing attribution.
- Adds an Analytics mode card and foundation panel to /admin/ops.
- Adds safe analytics metadata to /api/activity/ping responses.
- Adds support copy explaining analytics and privacy limits.
- Adds analytics foundation QA documentation.

## Explicitly not included

- No Google Analytics or GA4 integration.
- No Meta Pixel integration.
- No PostHog integration.
- No Segment integration.
- No Mixpanel integration.
- No Amplitude, Plausible, Umami, Hotjar, or Clarity integration.
- No external event warehouse.
- No cookie-consent tracking banner.
- No attribution dashboard.
- No revenue analytics overclaim.
- No schema migration.

## Manual QA

- Open /admin/events and confirm analytics wording describes internal operational events only.
- Open /admin/audit and confirm audit wording does not imply marketing analytics.
- Open /admin/ops and confirm Analytics mode and Analytics foundation appear naturally.
- Open /support and confirm Analytics and privacy limits appears after notification limits.
- POST to /api/activity/ping and confirm the response still succeeds.
- Confirm no page claims GA4, Meta Pixel, PostHog, Segment, Mixpanel, or external attribution is active.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
