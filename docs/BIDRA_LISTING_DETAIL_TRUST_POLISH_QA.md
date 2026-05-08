# Bidra listing detail and marketplace trust polish QA

## Fix intent

This patch targets the remaining visual/trust issues found after the public launch polish merge:

- huge blank space under listing gallery
- item description/details pushed too far below the photo
- logged-in users seeing create-account wording
- pushy Buy Now listing card copy
- tiny gallery controls
- unclear own-listing message error
- long/repetitive trust wording

## Pages to inspect

- /
- /listings
- /listings/[id]
- /sell/new
- /auth/login
- /dashboard
- /messages
- /watchlist

## Must pass

- Listing description/details appear directly under the photo/gallery column, not after a huge blank area.
- Logged-in users are not told to create a free account.
- Logged-out users still get clear sign-in/create-account paths.
- Listing cards do not repeat Buy Now three times.
- Gallery arrows are easy to tap.
- Own-listing message action does not look broken.
- No horizontal overflow at mobile width.
- Core build/type/lint/tests pass.
