(async () => {
  const listingId = process.argv[2];

  // 1) Prisma listing check
  const { PrismaClient } = require("@prisma/client");
  const p = new PrismaClient();
  const l = await p.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, status: true, buyNowPrice: true, updatedAt: true }
  });
  console.log("PRISMA_LISTING", l);
  await p.$disconnect();

  // 2) Public listings API check
  const r = await fetch("http://127.0.0.1:3000/api/listings", { cache: "no-store" });
  console.log("API_STATUS", r.status);
  console.log("API_CACHE_CONTROL", r.headers.get("cache-control"));
  const j = await r.json();
  console.log("API_COUNT", ((j && j.listings) || []).length);
})().catch((e) => { console.error("ERR", e); process.exit(1); });
