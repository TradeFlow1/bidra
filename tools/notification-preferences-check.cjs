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
    if (!content.includes(item.pattern)) throw new Error(file + " missing notification preference anchor: " + item.label);
  }
  console.log("PASS " + file);
}

check("prisma/migrations/20260625073000_add_notification_preferences/migration.sql", [
  { pattern: "CREATE TABLE \"NotificationPreference\"", label: "preferences table" },
  { pattern: "messages", label: "messages preference" },
  { pattern: "offers", label: "offers preference" },
  { pattern: "watchlist", label: "watchlist preference" },
  { pattern: "savedSearches", label: "saved-search preference" },
  { pattern: "marketing\" BOOLEAN NOT NULL DEFAULT false", label: "marketing off by default" },
  { pattern: "ON DELETE CASCADE", label: "user cascade" }
]);

check("app/api/notification-preferences/route.ts", [
  { pattern: "auth", label: "auth gate" },
  { pattern: "NotificationPreference", label: "preference table usage" },
  { pattern: "productUpdates: false", label: "product update default off" },
  { pattern: "marketing: false", label: "marketing default off" },
  { pattern: "emailDigest: false", label: "email digest default off" },
  { pattern: "GET", label: "read route" },
  { pattern: "PATCH", label: "update route" }
]);

check("components/notification-preferences-form.tsx", [
  { pattern: "Notification preferences", label: "preferences heading" },
  { pattern: "/api/notification-preferences", label: "API binding" },
  { pattern: "Messages", label: "messages control" },
  { pattern: "Offers", label: "offers control" },
  { pattern: "Watchlist updates", label: "watchlist control" },
  { pattern: "Saved-search alerts", label: "saved-search control" },
  { pattern: "Marketing", label: "marketing control" },
  { pattern: "Off by default", label: "marketing default copy" }
]);

check("app/notifications/page.tsx", [
  { pattern: "NotificationPreferencesForm", label: "preferences form render" },
  { pattern: "notification preferences", label: "page copy" }
]);

console.log("PASS Notification preferences checks completed.");
