const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  try {
    const cols = await p.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name='Order' ORDER BY column_name;"
    );
    console.log(cols);
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
