const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ path: path.join(process.cwd(), '.env.vercel.prodcheck') });

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL_UNPOOLED).replace(/^"|"$/g, '');
} else if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = String(process.env.DATABASE_URL).replace(/^"|"$/g, '');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    throw new Error('Usage: node tools/create-prod-admin.js <email> <password>');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A user with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
      name: 'Bidra Admin'
    },
    select: {
      id: true,
      email: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true
    }
  });

  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((err) => {
    console.error('CREATE_PROD_ADMIN_ERROR');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
