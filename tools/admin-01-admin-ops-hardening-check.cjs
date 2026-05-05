const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  "app/admin/users/page.tsx",
  "app/admin/users/[id]/page.tsx",
  "app/api/admin/users/strike/route.ts",
  "app/api/admin/users/unstrike/route.ts",
  "app/api/admin/users/block/route.ts",
  "app/api/admin/users/unblock/route.ts",
];

const corpus = files.map((rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8")).join("\n");

const required = [
  'href={"/admin/users/" + u.id}',
  'Open admin detail',
  'Admin user detail',
  'Audit evidence',
  '/api/admin/users/strike',
  '/api/admin/users/block',
  '/api/admin/users/unblock',
  '/api/admin/users/unstrike',
  'Every action below is routed through an admin API that creates audit evidence in AdminActionLog.',
  'prisma.adminActionLog.create',
  'USER_STRIKE',
  'USER_UNSTRIKE',
  'USER_BLOCK',
  'USER_UNBLOCK',
];

const forbidden = [
  'href={"/profile?user=" + u.id}',
];

const missing = required.filter((item) => !corpus.includes(item));
const presentForbidden = forbidden.filter((item) => corpus.includes(item));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("ADMIN-01 admin ops hardening check failed.");
  for (const item of missing) console.error("Missing: " + item);
  for (const item of presentForbidden) console.error("Forbidden: " + item);
  process.exit(1);
}

console.log("ADMIN-01 admin ops hardening check passed.");
