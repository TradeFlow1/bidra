const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.vercel.prodcheck') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe('select id, migration_name, started_at, finished_at, rolled_back_at from "_prisma_migrations" order by started_at asc');
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((err) => {
    console.error('INSPECT_PROD_MIGRATIONS_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
