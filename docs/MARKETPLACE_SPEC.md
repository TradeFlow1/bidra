# Bidra Marketplace Spec

Bidra is a marketplace for listing, discovering, saving, messaging, offering on, buying, and managing goods.

## Marketplace-ready v1

Bidra is v1-ready when the following core flows work on production and in local smoke tests.

### Visitor

- Can load the homepage.
- Can browse active listings.
- Can search/filter listings.
- Can open listing detail pages.
- Can see listing title, price, category, condition, location, seller summary, and image/fallback.
- Cannot access protected account, admin, messages, orders, watchlist, or seller management pages without login.

### Buyer

- Can register and log in.
- Can save listings.
- Can message sellers where supported.
- Can make offers where supported.
- Can buy now only where the transaction path is production-ready.
- Can view orders only when authenticated.

### Seller

- Can create listings with required data.
- Can upload or attach listing photos, or receive clear validation.
- Can edit own listings.
- Can manage seller-side order/message activity.

### Admin

- Admin tools are never exposed to logged-out users.
- Admin routes are protected.
- Moderation tools exist for users, listings, and reports.
- Unsafe or incomplete admin functions are hidden or protected.

### Reliability

- No known public 500s.
- No Prisma missing-column runtime errors.
- Database schema matches runtime fields.
- Marketplace gate passes before release.
- Mobile buyer/seller routes are usable.