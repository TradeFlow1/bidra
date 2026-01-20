const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const x = await p.listing.findFirst({
    where: { OR: [{ status: "SOLD" }, { status: "ENDED" }, { status: "EXPIRED" }] },
    orderBy: { updatedAt: "desc" },
    select: { id: true, status: true, title: true, updatedAt: true },
  });
  console.log(x || "NO_SOLD_ENDED_FOUND");
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
