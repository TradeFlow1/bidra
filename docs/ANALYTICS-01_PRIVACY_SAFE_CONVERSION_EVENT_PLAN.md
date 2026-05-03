# ANALYTICS-01: Privacy-safe conversion event plan

## Purpose
Bidra needs a simple conversion view that helps improve marketplace activation without collecting sensitive personal data or creating surveillance-style tracking.

This plan defines the first privacy-safe event map for growth, trust, and marketplace quality decisions. It is a plan only. It does not add trackers, cookies, third-party pixels, session replay, fingerprinting, or behavioural advertising.

## Privacy rules
- Do not collect names, email addresses, phone numbers, street addresses, message bodies, listing descriptions, uploaded images, payment details, or exact date of birth in conversion events.
- Do not collect raw search text, raw location text, or free-form user input.
- Do not collect device fingerprints, full IP addresses, user agent strings for identity, or cross-site identifiers.
- Do not send conversion events to advertising platforms.
- Prefer aggregate counts, coarse categories, boolean flags, and server-side event names.
- Keep user identifiers out of analytics payloads unless there is a separate approved privacy review.

## Event naming
Use lowercase snake_case event names. Keep names stable so dashboards can compare releases.

## Conversion funnel map
| Funnel area | Event | Trigger | Allowed properties | Do not include |
| --- | --- | --- | --- | --- |
| Acquisition | `homepage_primary_cta_clicked` | User clicks primary homepage CTA | `cta`, `destination`, `authed` | email, name, IP, full URL with query |
| Discovery | `listing_search_submitted` | Listings search form submits | `has_keyword`, `has_category`, `has_location`, `sale_type`, `condition`, `sort` | raw keyword, raw suburb, postcode, full query string |
| Discovery | `listing_filter_applied` | Listing filters are applied | `filter_count`, `has_price_min`, `has_price_max`, `sale_type` | exact price, raw query, raw location |
| Listing intent | `listing_viewed` | Listing detail page renders | `listing_type`, `category_group`, `has_images`, `seller_email_verified`, `seller_phone_present` | listing title, description, seller ID, buyer ID |
| Listing intent | `listing_buy_now_clicked` | Buy Now action is clicked | `category_group`, `price_band`, `seller_trust_band` | exact price, exact location, user ID |
| Listing intent | `offer_started` | Offer flow starts | `category_group`, `price_band`, `seller_trust_band` | offer amount, message text, user ID |
| Activation | `registration_started` | Register page is opened from a CTA | `source_area`, `authed` | email, username, date of birth |
| Activation | `registration_completed` | Account creation succeeds | `has_general_location`, `email_verification_required` | email, username, date of birth, postcode |
| Seller activation | `seller_listing_started` | Sell-new page opens | `source_area`, `has_default_location` | user ID, exact location |
| Seller activation | `seller_listing_published` | Listing creation succeeds | `listing_type`, `category_group`, `has_images`, `condition`, `price_band` | title, description, exact price, images |
| Trust | `message_thread_opened` | Message thread opens | `thread_context`, `has_order`, `has_listing` | message body, participant IDs |
| Trust | `report_started` | Report flow opens | `surface`, `reason_category` | report text, screenshots, user IDs |
| Order follow-up | `order_detail_opened` | Order detail page opens | `viewer_role`, `status`, `has_feedback_due` | buyer ID, seller ID, exact amount |

## Allowed derived properties
- `authed`: boolean.
- `source_area`: coarse source such as `home`, `listings`, `listing_detail`, `dashboard`, `help`, or `support`.
- `category_group`: top-level category only.
- `listing_type`: `buy_now` or `offerable`.
- `price_band`: coarse band such as `under_50`, `50_200`, `200_500`, `500_plus`, or `unknown`.
- `seller_trust_band`: coarse band such as `new`, `some_signals`, or `strong_signals`.
- `has_images`, `has_keyword`, `has_category`, `has_location`, `has_default_location`: booleans.
- `viewer_role`: `buyer`, `seller`, or `other` for the current order context.

## Dashboard questions
1. Are visitors finding active listings?
2. Are listing cards and detail pages creating buyer intent?
3. Are users choosing Buy Now, offers, watchlist, and messaging paths?
4. Are new users completing account setup after registration?
5. Are sellers starting and publishing buyer-ready listings?
6. Are safety, report, support, and help routes being used at the right moments?

## Implementation guardrails
- Start with server-side aggregate counters or first-party event records only after a separate implementation PR.
- Add an explicit allowlist for event names and properties before recording anything.
- Reject unknown properties by default.
- Strip or bucket values before storage.
- Keep event payloads small and documented.
- Do not introduce third-party analytics without a separate privacy and product review.
- Do not add client-side tracking scripts in this planning PR.

## Acceptance criteria
- A documented conversion event map exists.
- The map separates allowed properties from prohibited data.
- The plan covers acquisition, discovery, listing intent, activation, seller activation, trust, and order follow-up.
- The plan explicitly avoids cookies, third-party pixels, session replay, fingerprinting, behavioural advertising, raw search text, exact location, and message content.
- A static regression check protects the plan.
