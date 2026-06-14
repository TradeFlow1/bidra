const fs = require("fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("PASS:", message);
  }
}

const middleware = read("middleware.ts");
const header = read("components/site-header-client.tsx");
const testAuth = read("app/api/e2e/auth/login/route.ts");

assert(middleware.includes('pathname.startsWith("/sell")'), "middleware protects sell routes");
assert(middleware.includes('pathname.startsWith("/messages")'), "middleware protects messages routes");
assert(middleware.includes('pathname.startsWith("/dashboard")'), "middleware protects dashboard routes");
assert(middleware.includes('pathname.startsWith("/account")'), "middleware protects account routes");
assert(middleware.includes('pathname.startsWith("/orders")'), "middleware protects orders routes");
assert(middleware.includes('pathname.startsWith("/watchlist")'), "middleware protects watchlist routes");
assert(middleware.includes('pathname.startsWith("/notifications")'), "middleware protects notifications routes");
assert(middleware.includes('pathname.startsWith("/admin")'), "middleware protects admin routes");
assert(header.includes('const accountRoleLabel = "My Bidra";'), "public header uses generic account label");
assert(header.includes('Account{badge}'), "desktop header button does not expose admin role");
assert(!testAuth.includes('host.endsWith(".vercel.app")'), "e2e auth does not allow public Vercel hosts");
assert(testAuth.includes('process.env.NODE_ENV === "production"'), "e2e auth has production kill switch");

if (process.exitCode) {
  process.exit(process.exitCode);
}
