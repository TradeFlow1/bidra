# Bidra (AU Marketplace MVP)

Bidra is a modern Australian-focused marketplace built from scratch (original implementation and copy).
It supports fixed-price listings and offer-based buying with anti-sniping, watchlists, messaging, reporting, and an admin dashboard.

## Tech
- Next.js (App Router) + TypeScript
- Prisma + Postgres (Neon / Supabase / Vercel Postgres compatible)
- NextAuth (Credentials provider)
- Tailwind (simple lightweight UI components)
- Stripe Checkout (test mode in MVP)
- Offer model: no auction settlement cron

---

## 1) Local setup

### Prereqs
- Node.js 18+
- Postgres database URL

### Install
```bash
cp .env.example .env
# update DATABASE_URL, NEXTAUTH_SECRET, STRIPE keys
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open: http://localhost:3000

Seed accounts:
- admin@bidra.com.au / admin123
- demo@bidra.com.au / user1234

Email verification (MVP):
- Registration prints a verification URL in your server console.

---

## 2) Stripe (test mode)

### Webhook
Create a webhook in Stripe for:
- `checkout.session.completed`

Point it at:
- `https://<your-domain>/api/stripe/webhook`

Copy the signing secret into:
- `STRIPE_WEBHOOK_SECRET`

---

## 3) Deploy to Vercel via GitHub

1. Push this repo to GitHub.
2. In Vercel: **New Project** -> import your GitHub repo.
3. Add env vars in Vercel Project Settings:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (e.g. https://bidra.com.au)
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
4. Deploy.

### Database migrations in production
After first deploy, run:
```bash
npx prisma migrate deploy
```

---

## 4) Offer model note
This repo includes `vercel.json` with a cron calling:
- `/api/cron/settle-auctions` every minute

Auction settlement is disabled. Orders are created when a seller accepts an offer.

---

## 5) Notes
- Image uploads: MVP stores image paths/URLs; sample SVG placeholders are included.
- Rate limiting: simple in-memory limiter (sufficient for MVP). For multi-region, swap to Redis/Upstash.

---
(c) Bidra ” original implementation