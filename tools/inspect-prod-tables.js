const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.vercel.prodcheck') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe("select table_name from information_schema.tables where table_schema = 'public' order by table_name");
  console.log(JSON.stringify(tables, null, 2));
}

main()
  .catch((err) => {
    console.error('INSPECT_PROD_TABLES_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
