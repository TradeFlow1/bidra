# Bidra release checklist

Use this checklist before promoting a release build.

## Required local validation

- Run 
pm.cmd run lint.
- Run 
pm.cmd run build.
- Confirm git status --short is clean.
- Confirm the deployment branch is main and is up to date with origin/main.

## Required deployment validation

- Confirm production environment variables are configured in the hosting provider.
- Confirm database migrations are applied with 
pm.cmd run db:deploy where required.
- Confirm 
pm.cmd run prisma:generate or postinstall Prisma generation has completed.
- Confirm the deployed build starts successfully.

## Product smoke checks

- Visit the homepage and browse listings.
- Search and filter listings.
- Open a listing detail page.
- Sign in and open Dashboard.
- Open My listings.
- Open Messages and one message thread.
- Open Orders and one order detail page.
- Open Watchlist.
- Open Account status.
- Open Support, Terms, Privacy, Fees, and Prohibited items pages.

## Marketplace safety checks

- Confirm copy does not promise buyer protection, escrow, guaranteed delivery, or payment protection.
- Confirm handover copy tells users to arrange pickup or postage directly in Messages.
- Confirm Bidra is described as the platform only, not the seller, payment provider, shipper, escrow holder, or auctioneer.
- Confirm reports, restrictions, and moderation pages explain platform actions without over-promising outcomes.

## Mobile checks

- Check homepage listing grids on narrow mobile width.
- Check browse listings grid and filters on mobile.
- Check message inbox and message thread actions on mobile.
- Check orders and dashboard listing actions on mobile.

## Admin checks

- Confirm admin routes require the expected admin access.
- Confirm reports, listings, users, audit, and events pages load.
- Confirm moderation actions are intentional and auditable.

## Final release decision

- CI is green.
- Local lint and build are green.
- Smoke checks pass.
- Known launch blockers are documented before release.

