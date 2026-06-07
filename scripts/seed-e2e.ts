import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.test');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL. Add it to .env.test or set it before running npm run seed:e2e.');
}

import { prisma } from '../lib/prisma';

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error('Missing required environment variable: ' + name);
  }
  return value;
}

async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new Error('User not found: ' + email);
  }

  return user;
}

async function cleanup(prefix: string) {
  const listings = await prisma.listing.findMany({
    where: { title: { startsWith: prefix } },
    select: { id: true },
  });

  const listingIds = listings.map(function (listing) { return listing.id; });
  if (listingIds.length === 0) {
    return;
  }

  await prisma.feedback.deleteMany({ where: { order: { listingId: { in: listingIds } } } }).catch(function () { return null; });
  await prisma.offerDecision.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.order.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.offer.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.message.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.messageThread.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.watchlist.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.report.deleteMany({ where: { listingId: { in: listingIds } } }).catch(function () { return null; });
  await prisma.listing.deleteMany({ where: { id: { in: listingIds } } });
}

async function main() {
  const seller = await getUser(required('BIDRA_TEST_SELLER_EMAIL'));
  const prefix = process.env.BIDRA_E2E_LISTING_PREFIX || 'E2E Browser Disposable ';
  const buyNowTitle = process.env.BIDRA_E2E_BUY_NOW_TITLE || prefix + 'Buy Now';
  const offerTitle = process.env.BIDRA_E2E_OFFER_TITLE || prefix + 'Offerable';

  await cleanup(prefix);

  const buyNowListing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      type: 'BUY_NOW',
      status: 'ACTIVE',
      title: buyNowTitle,
      description: 'Disposable E2E browser Buy Now listing.',
      category: 'Electronics',
      condition: 'Used',
      location: '4000 Brisbane City, QLD',
      locationState: 'QLD',
      locationSuburb: 'Brisbane City',
      locationPostcode: '4000',
      price: 12345,
      buyNowPrice: 12345,
      buyNowEnabled: true,
      images: ['https://bidra-test.vercel-storage.com/e2e-test-listing.jpg'],
      photos: ['https://bidra-test.vercel-storage.com/e2e-test-listing.jpg'],
    },
  });

  const offerListing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      type: 'OFFERABLE',
      status: 'ACTIVE',
      title: offerTitle,
      description: 'Disposable E2E browser offerable listing.',
      category: 'Electronics',
      condition: 'Used',
      location: '4000 Brisbane City, QLD',
      locationState: 'QLD',
      locationSuburb: 'Brisbane City',
      locationPostcode: '4000',
      price: 10000,
      buyNowPrice: null,
      buyNowEnabled: false,
      currentOfferAmount: null,
      currentOfferBuyerId: null,
      offerIncrement: 100,
      images: ['https://bidra-test.vercel-storage.com/e2e-test-listing.jpg'],
      photos: ['https://bidra-test.vercel-storage.com/e2e-test-listing.jpg'],
    },
  });

  console.log('Seeded disposable E2E listings.');
  console.log('BUY_NOW_ID=' + buyNowListing.id);
  console.log('BUY_NOW_TITLE=' + buyNowListing.title);
  console.log('OFFERABLE_ID=' + offerListing.id);
  console.log('OFFERABLE_TITLE=' + offerListing.title);
}

main()
  .catch(function (error) {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async function () {
    await prisma.$disconnect();
  });
