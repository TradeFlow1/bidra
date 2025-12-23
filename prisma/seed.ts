import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Keep seed minimal and safe (no special characters / no assumptions)
  // You can add sample listings later once everything is stable.
  console.log("Seed: OK (no actions)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
