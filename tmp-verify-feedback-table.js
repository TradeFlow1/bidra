const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.findMany({ take: 1 });
  console.log("✅ Feedback table OK");
}

main()
  .catch((e) => {
    console.error("❌", e.code || e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });