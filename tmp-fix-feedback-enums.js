const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  try {
    // Create enums safely (ignore "already exists")
    await p.$executeRawUnsafe(`
DO $$
BEGIN
  BEGIN
    CREATE TYPE "SaleOutcome" AS ENUM ('PENDING','COMPLETED','CANCELLED','DISPUTED');
  EXCEPTION WHEN duplicate_object THEN
    -- already exists
    NULL;
  END;

  BEGIN
    CREATE TYPE "FeedbackRole" AS ENUM ('BUYER','SELLER');
  EXCEPTION WHEN duplicate_object THEN
    -- already exists
    NULL;
  END;
END $$;
    `);

    // Fix Order.outcome: drop default -> normalize -> convert -> set default
    await p.$executeRawUnsafe(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='Order' AND column_name='outcome'
  ) THEN
    ALTER TABLE "Order"
      ALTER COLUMN outcome DROP DEFAULT;

    UPDATE "Order"
      SET outcome = 'PENDING'
      WHERE outcome IS NULL OR outcome NOT IN ('PENDING','COMPLETED','CANCELLED','DISPUTED');

    ALTER TABLE "Order"
      ALTER COLUMN outcome TYPE "SaleOutcome"
      USING outcome::"SaleOutcome";

    ALTER TABLE "Order"
      ALTER COLUMN outcome SET DEFAULT 'PENDING';
  END IF;
END $$;
    `);

    console.log("✅ Enums OK + Order.outcome converted (default fixed)");
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
