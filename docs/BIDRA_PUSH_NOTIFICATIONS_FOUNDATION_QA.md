# Bidra push notifications foundation QA

## Goal

Improve Bidra's notification clarity and future-readiness without claiming browser push, service worker push handling, Firebase Cloud Messaging, Apple Push Notification service, native mobile push, or background delivery guarantees.

## Included in this PR

- Adds a notification channel summary helper using existing data only.
- Improves /notifications copy and empty state.
- Adds a Notification channels panel explaining in-app counts, email where configured, and push limits.
- Adds message-send response metadata for current notification channels.
- Adds admin-event metadata for offer and Buy Now email-if-configured channels.
- Adds support copy explaining notification and push limits.

## Explicitly not included

- No Web Push subscription storage.
- No service worker push handler.
- No Firebase Cloud Messaging.
- No Apple Push Notification service.
- No native mobile push notifications.
- No browser permission prompt.
- No background delivery guarantee.
- No notification preference schema migration.

## Manual QA

- Open /notifications and confirm Notification channels appears naturally.
- Confirm /notifications empty state does not claim push delivery.
- Send a message and confirm the response still succeeds.
- Place an offer and confirm the flow still succeeds.
- Use Buy Now and confirm the flow still succeeds.
- Open /support and confirm Notifications and push limits appears after chat limits.
- Confirm no page claims Web Push, Firebase, APNs, native mobile push, or guaranteed background delivery is active.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
