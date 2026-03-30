const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.vercel.prodcheck') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
} else if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      name: true,
      avatarUrl: true,
      location: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const target = await prisma.user.findUnique({
    where: { email: 'jpdup491@gmail.com' },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      name: true,
      avatarUrl: true,
      location: true,
      createdAt: true,
      updatedAt: true
    }
  });

  console.log('=== USER COUNT ===');
  console.log(users.length);
  console.log('');
  console.log('=== ALL USERS ===');
  console.log(JSON.stringify(users, null, 2));
  console.log('');
  console.log('=== TARGET USER ===');
  console.log(JSON.stringify(target, null, 2));
}

main()
  .catch((err) => {
    console.error('INSPECT_USERS_LIVE_LEGACY_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
