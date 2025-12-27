const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  try {
    await p.$executeRawUnsafe(`
      ALTER TABLE "Order"
        ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS "buyerFeedbackAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "sellerFeedbackAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;
    `);
    console.log("✅ Order columns forced");
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
