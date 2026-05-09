# Bidra real-time chat foundation QA

## Goal

Improve Bidra's messaging confidence, navigation, freshness wording, and order-to-message routing without claiming WebSockets, external realtime providers, typing indicators, read receipts beyond existing last-read status, push notifications, or attachment support.

## Included in this PR

- Confirms /orders/[id]/message uses the existing route-handler bridge into the listing message thread.
- Adds inbox Message freshness guidance.
- Adds thread Chat freshness guidance.
- Tightens message-thread safety copy around pickup, postage, tracking, packaging, dispatch, payment expectations, and handover.
- Adds API metadata documenting current stored-message refresh mode.
- Adds admin event metadata for message delivery mode and realtime provider status.
- Adds support copy explaining message freshness and chat limits.

## Explicitly not included

- No WebSocket server.
- No Pusher integration.
- No Ably integration.
- No Firebase integration.
- No Supabase Realtime integration.
- No typing indicators.
- No mobile push notifications.
- No attachment uploads.
- No schema migration.

## Manual QA

- Open /messages and confirm Message freshness appears naturally.
- Open /messages/[id] and confirm Chat freshness appears naturally.
- From /orders/[id], click Message buyer or Message seller and confirm the existing route-handler bridge redirects to the existing thread.
- Send a message and confirm the message appears after navigation or refresh.
- Confirm unsafe contact/payment wording is still blocked by the send API.
- Confirm /support explains current chat limits without overclaiming realtime infrastructure.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
