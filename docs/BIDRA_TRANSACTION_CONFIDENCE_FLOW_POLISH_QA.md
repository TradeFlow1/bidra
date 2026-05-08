# Bidra transaction confidence flow polish QA

## Goal

Make Buy Now, offers, orders, and messaging feel like a clear marketplace transaction flow instead of internal records or beta screens.

## Must verify

- Buy Now button uses standard Bidra button styling and explains failure states clearly.
- Offer action uses standard Bidra button styling and has clearer success/error copy.
- Accept highest offer does not mention pending order records.
- Orders page speaks in buyer/seller language, not internal record language.
- Order detail no longer mentions V1, Launch pricing, dead-end Pay now, or internal record language.
- Message seller button uses standard Bidra styling and clearer opening/error text.
- Mobile action buttons remain full width and easy to tap.
- There is no horizontal overflow on listing detail, orders, order detail, or messages.

## Pages to inspect

- /listings/[id]
- /orders
- /orders/[id]
- /messages
- /messages/[id]

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
