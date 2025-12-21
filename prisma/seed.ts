import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bidra.com.au" },
    update: {},
    create: {
      email: "admin@bidra.com.au",
      passwordHash: adminPassword,
      emailVerified: true,
      role: "ADMIN",
      name: "Bidra Admin",
      location: "NSW"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@bidra.com.au" },
    update: {},
    create: {
      email: "demo@bidra.com.au",
      passwordHash: userPassword,
      emailVerified: true,
      role: "USER",
      name: "Demo User",
      location: "VIC"
    }
  });

  // Idempotent demo listings: clear previous seller listings
  const existing = await prisma.listing.findMany({ where: { sellerId: user.id } });
  for (const l of existing) {
    await prisma.watchlist.deleteMany({ where: { listingId: l.id } });
    await prisma.message.deleteMany({ where: { listingId: l.id } });
    await prisma.bid.deleteMany({ where: { listingId: l.id } });
    await prisma.order.deleteMany({ where: { listingId: l.id } });
    await prisma.report.deleteMany({ where: { listingId: l.id } });
    await prisma.listing.delete({ where: { id: l.id } });
  }

  await prisma.listing.createMany({
    data: [
      {
        title: "Shimano Road Bike Ã¢â‚¬â€ Weekend Ready",
        description: "Lightweight road bike, recently serviced. Smooth shifting and solid brakes. Includes bottle cage.",
        category: "Sports",
        type: "AUCTION",
        status: "ACTIVE",
        condition: "Used - Good",
        price: 45000,
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        location: "VIC",
        images: ["/uploads/sample-bike.svg"],
        sellerId: user.id
      },
      {
        title: "iPhone 14 Pro 256GB (Unlocked)",
        description: "Excellent condition, unlocked. Includes original box. Battery health strong.",
        category: "Electronics",
        type: "BUY_NOW",
        status: "ACTIVE",
        condition: "Used - Like New",
        price: 129900,
        endsAt: null,
        location: "NSW",
        images: ["/uploads/sample-phone.svg"],
        sellerId: user.id
      },
      {
        title: "Modern Couch Ã¢â‚¬â€ 3 Seater",
        description: "Comfortable 3-seater couch, neutral colour, great for apartments. Pickup only.",
        category: "Home & Garden",
        type: "BUY_NOW",
        status: "ACTIVE",
        condition: "Used - Good",
        price: 35000,
        endsAt: null,
        location: "QLD",
        images: ["/uploads/sample-couch.svg"],
        sellerId: user.id
      }
    ]
  });

  console.log("Seed complete.");
  console.log("Admin: admin@bidra.com.au / admin123");
  console.log("Demo:  demo@bidra.com.au / user1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
