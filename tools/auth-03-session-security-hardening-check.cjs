const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[AUTH-03] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[AUTH-03] PASS: " + message);
}

function fail(message) {
  console.error("[AUTH-03] FAIL: " + message);
  process.exitCode = 1;
}

const auth = read("lib/auth.ts");
const middleware = read("middleware.ts");
const ordersApi = read("app/api/orders/route.ts");

const requiredAuth = [
  'session: { strategy: "jwt" }',
  "useSecureCookies:",
  "secret: process.env.NEXTAUTH_SECRET",
  "rateLimit(`login:ip:${ip}`, 20, windowMs)",
  "rateLimit(`login:email:${email}`, 8, windowMs)",
  'throw new Error("EMAIL_NOT_VERIFIED")',
  "token.id",
  "emailVerified",
  "phoneVerified",
  "ageVerified"
];

for (const snippet of requiredAuth) {
  if (!auth.includes(snippet)) {
    fail("Missing auth session/security snippet: " + snippet);
  } else {
    pass("Found auth session/security snippet: " + snippet);
  }
}

const requiredMiddleware = [
  'pathname.startsWith("/api")',
  'target.pathname = "/auth/login"',
  'target.searchParams.set("next", nextPath)',
  "await getToken({ req })"
];

for (const snippet of requiredMiddleware) {
  if (!middleware.includes(snippet)) {
    fail("Missing middleware auth boundary snippet: " + snippet);
  } else {
    pass("Found middleware auth boundary snippet: " + snippet);
  }
}

const requiredOrdersApi = [
  "Sign in required.",
  "Your account is not eligible to access orders.",
  "return NextResponse.json({ ok: false, error: message }, { status: gate.status });"
];

for (const snippet of requiredOrdersApi) {
  if (!ordersApi.includes(snippet)) {
    fail("Missing safe API auth boundary copy: " + snippet);
  } else {
    pass("Found safe API auth boundary copy: " + snippet);
  }
}

const forbiddenOrdersApi = [
  "error: gate.reason"
];

for (const snippet of forbiddenOrdersApi) {
  if (ordersApi.includes(snippet)) {
    fail("Forbidden raw gate reason remains: " + snippet);
  } else {
    pass("Forbidden raw gate reason absent: " + snippet);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[AUTH-03] Session/security hardening check completed.");
