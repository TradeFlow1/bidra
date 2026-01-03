const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const id = process.argv[2];
if (!id) { console.log("Usage: node tools/_check_user_block.js <USER_ID>"); process.exit(1); }

(async () => {
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, policyStrikes: true, policyBlockedUntil: true },
  });
  console.log(u || "USER_NOT_FOUND");
  await prisma.$disconnect();
})();
