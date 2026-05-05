const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  "lib/rate-limit.ts",
  "lib/auth.ts",
  "app/auth/login/page.tsx",
];

const corpus = files.map((rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8")).join("\n");

const required = [
  "rateLimitResult",
  "retryAfterSeconds",
  "clientIpFromHeaders",
  "tooManyRequestsJson",
  "login:ip:",
  "login:email:",
  "AUTH_RATE_LIMITED",
  "Too many login attempts. Please wait before trying again or reset your password.",
];

const forbidden = [
  "Too many login attempts. Please wait 15 minutes and try again.",
  "const okIp = rateLimit(`login:ip:${ip}`, 20, windowMs);",
  "const okEmail = rateLimit(`login:email:${email}`, 8, windowMs);",
];

const missing = required.filter((item) => !corpus.includes(item));
const presentForbidden = forbidden.filter((item) => corpus.includes(item));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error("AUTH-03 login rate limiting check failed.");
  for (const item of missing) console.error("Missing: " + item);
  for (const item of presentForbidden) console.error("Forbidden: " + item);
  process.exit(1);
}

console.log("AUTH-03 login rate limiting check passed.");
