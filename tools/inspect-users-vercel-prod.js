const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(process.cwd(), '.env.vercel.prodcheck');
dotenv.config({ path: envPath });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
} else if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'jpdup491@gmail.com';
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      username: true,
      isActive: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const target = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: {
      id: true,
      email: true,
      username: true,
      isActive: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      phoneVerified: true,
      ageVerified: true,
      policyStrikes: true,
      policyBlockedUntil: true,
      termsAcceptedAt: true,
      termsVersion: true
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
    console.error('INSPECT_USERS_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
