const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const row = await prisma.adminEvent.create({
    data: {
      type: "TEST_EVENT",
      userId: null,
      orderId: null,
      data: { note: "seed test event" },
    },
  });

  console.log("CREATED_ADMIN_EVENT_ID=" + row.id);
  await prisma.$disconnect();
})();
