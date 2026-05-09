# Bidra identity verification foundation QA

## Goal

Improve how Bidra explains and displays account trust signals without claiming provider-backed government ID, biometric, escrow, payment, or shipping verification.

## Included in this PR

- Dashboard Account trust signals panel using existing email, phone, age, location, policy standing, and restriction data.
- Listing cards use Email confirmed and Phone confirmed language instead of identity-style verification wording.
- Seller profiles explain that email and phone signals are contact/account signals only.
- Listing detail seller panels show account signals with clear limits.
- Phone confirmation page clarifies that phone confirmation is not government ID verification.
- Admin user list shows email, phone, and 18+ account signal badges.
- Admin user detail shows a Verification signals panel.
- Support explains what account signals do and do not mean.

## Explicitly not included

- No government ID verification.
- No Stripe Identity.
- No Persona, Onfido, Veriff, or other KYC provider.
- No biometric or liveness checks.
- No escrow or payment protection.
- No shipping or delivery guarantee.
- No schema migration.

## Manual QA

- Log in as a standard user and check /dashboard for Account trust signals.
- Check /auth/phone-verify copy does not overclaim identity verification.
- View /listings and confirm cards use Email confirmed or Phone confirmed.
- Open a listing detail and confirm seller account signal note appears.
- Open a seller profile and confirm identity verification note appears.
- Log in as admin and check /admin/users shows verification signal badges.
- Open /admin/users/[id] and confirm Verification signals panel appears.
- Open /support and confirm account signal limits are clear.

## Commands

- git diff --check
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build
- npm.cmd test
