const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.vercel.prodcheck') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sql = "select column_name, data_type from information_schema.columns where table_name = 'Bid' order by ordinal_position";
  const cols = await prisma.$queryRawUnsafe(sql);
  console.log(JSON.stringify(cols, null, 2));
}

main()
  .catch((err) => {
    console.error('INSPECT_PROD_BID_COLUMNS_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
