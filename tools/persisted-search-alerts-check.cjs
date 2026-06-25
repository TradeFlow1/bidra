const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error("Missing required file: " + relativePath);
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, expectations) {
  const content = read(file);
  for (const item of expectations) {
    if (!content.includes(item.pattern)) throw new Error(file + " missing persisted search alert anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("prisma/migrations/20260624094000_add_saved_searches/migration.sql", [
  { pattern: "CREATE TABLE \"SavedSearch\"", label: "saved search table" },
  { pattern: "alertEnabled", label: "alert flag" },
  { pattern: "lastCheckedAt", label: "alert check timestamp" },
  { pattern: "SavedSearch_userId_href_key", label: "unique user href" },
  { pattern: "ON DELETE CASCADE", label: "user cascade" }
]);

check("app/api/saved-searches/route.ts", [
  { pattern: "auth", label: "auth gate" },
  { pattern: "FROM \"SavedSearch\"", label: "saved search list query" },
  { pattern: "INSERT INTO \"SavedSearch\"", label: "saved search create query" },
  { pattern: "ON CONFLICT", label: "upsert by href" },
  { pattern: "Only listing searches can be saved.", label: "listing-only guard" }
]);

check("app/api/saved-searches/[id]/route.ts", [
  { pattern: "PATCH", label: "alert toggle route" },
  { pattern: "DELETE", label: "remove route" },
  { pattern: "alertEnabled", label: "alert flag update" },
  { pattern: "WHERE \"id\" =", label: "ownership-scoped update" }
]);

check("components/saved-searches.tsx", [
  { pattern: "/api/saved-searches", label: "persisted API usage" },
  { pattern: "Account-synced", label: "persisted status copy" },
  { pattern: "Browser-local", label: "fallback status copy" },
  { pattern: "Saved to account", label: "persisted row label" },
  { pattern: "Saved in this browser", label: "local row label" },
  { pattern: "browser-local fallback", label: "fallback explanation" }
]);

console.log("PASS Persisted search alerts checks completed.");
