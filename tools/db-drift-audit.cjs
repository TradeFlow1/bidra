const fs = require("fs");
const path = require("path");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index < 1) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const expected = {
  Listing: [
    "id",
    "title",
    "description",
    "category",
    "location",
    "type",
    "condition",
    "status",
    "price",
    "buyNowPrice",
    "currentOfferAmount",
    "currentOfferBuyerId",
    "images",
    "photos",
    "sellerId",
    "createdAt",
    "updatedAt",
    "attributes",
    "viewCount"
  ],
  User: [
    "id",
    "email",
    "name",
    "username",
    "role",
    "avatarUrl",
    "location",
    "emailVerified",
    "phoneVerified",
    "createdAt"
  ],
  Watchlist: [
    "id",
    "userId",
    "listingId",
    "createdAt"
  ],
  MessageThread: [
    "id",
    "buyerId",
    "sellerId",
    "listingId",
    "lastMessageAt"
  ],
  Order: [
    "id",
    "buyerId",
    "listingId",
    "createdAt"
  ]
};

async function getColumns(table) {
  const rows = await prisma.$queryRawUnsafe(
    "select column_name from information_schema.columns where table_schema = $1 and table_name = $2 order by ordinal_position",
    "public",
    table
  );

  return new Set(rows.map((row) => row.column_name));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("FAIL: DATABASE_URL is not set. Add it to .env.local or .env.");
    process.exitCode = 1;
    return;
  }

  let failed = false;

  for (const table of Object.keys(expected)) {
    const actual = await getColumns(table);
    const missing = expected[table].filter((field) => !actual.has(field));

    if (missing.length) {
      failed = true;
      console.error("FAIL " + table + ": missing " + missing.join(", "));
    } else {
      console.log("PASS " + table + ": expected launch columns exist");
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });