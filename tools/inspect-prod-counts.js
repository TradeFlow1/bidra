const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.vercel.prodcheck') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count(table) {
  const rows = await prisma.$queryRawUnsafe('select count(*)::int as count from "' + table + '"');
  return rows[0].count;
}

async function main() {
  const tables = ['User','Listing','Bid','Order','Message','Report','Watchlist','VerificationToken'];
  const results = [];
  for (const table of tables) {
    results.push({ table, count: await count(table) });
  }
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((err) => {
    console.error('INSPECT_PROD_COUNTS_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
