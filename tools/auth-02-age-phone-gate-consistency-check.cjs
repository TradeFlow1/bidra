const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[AUTH-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[AUTH-02] PASS: " + message);
}

function fail(message) {
  console.error("[AUTH-02] FAIL: " + message);
  process.exitCode = 1;
}

const middleware = read("middleware.ts");
const phonePage = read("app/auth/phone-verify/page.tsx");
const registerApi = read("app/api/auth/register/route.ts");
const restrictionsPage = read("app/account/restrictions/page.tsx");

const requiredMiddleware = [
  'String(process.env.PHONE_GATE_ENABLED ?? "").trim() !== "1"',
  'pathname.startsWith("/sell")',
  'pathname.startsWith("/messages")',
  'pathname.startsWith("/dashboard")',
  'pathname.startsWith("/dash")',
  'pathname.startsWith("/account")',
  'pathname.startsWith("/orders")',
  'pathname.startsWith("/watchlist")',
  'pathname.startsWith("/notifications")',
  'target.pathname = "/auth/phone-verify"'
];

for (const snippet of requiredMiddleware) {
  if (!middleware.includes(snippet)) {
    fail("Missing phone gate middleware snippet: " + snippet);
  } else {
    pass("Found phone gate middleware snippet: " + snippet);
  }
}

const requiredPhoneCopy = [
  "Phone verification is only required when Bidra enables the phone gate for protected marketplace actions.",
  "We could not send a phone verification code. Please check your number and try again.",
  "We could not send a phone verification code. Please try again shortly.",
  "We could not verify that code. Please check it and try again.",
  "We could not verify your phone right now. Please try again shortly."
];

for (const phrase of requiredPhoneCopy) {
  if (!phonePage.includes(phrase)) {
    fail("Missing stable phone verification copy: " + phrase);
  } else {
    pass("Found stable phone verification copy: " + phrase);
  }
}

const forbiddenPhoneCopy = [
  "throw new Error(data?.error",
  "String(e?.message",
  "Failed to send code",
  "Failed to verify code",
  "Phone verification is required before you can list, make offers, or message."
];

for (const phrase of forbiddenPhoneCopy) {
  if (phonePage.includes(phrase)) {
    fail("Forbidden raw or misleading phone copy remains: " + phrase);
  } else {
    pass("Forbidden phone copy absent: " + phrase);
  }
}

const requiredAgePolicy = [
  "function isAtLeast18(dob: Date)",
  "return dob <= cutoff;",
  '{ error: "Bidra accounts are 18+ only" }',
  "ageVerified: true",
  "phoneVerified: false",
  "isActive: false"
];

for (const snippet of requiredAgePolicy) {
  if (!registerApi.includes(snippet)) {
    fail("Missing registration age/activation policy: " + snippet);
  } else {
    pass("Found registration age/activation policy: " + snippet);
  }
}

const requiredRestrictionCopy = [
  "18+ restriction (browse-only)",
  "Browse-only access applies.",
  "you cannot create listings, message, make offers, or complete transactions"
];

for (const phrase of requiredRestrictionCopy) {
  if (!restrictionsPage.includes(phrase)) {
    fail("Missing account restriction copy: " + phrase);
  } else {
    pass("Found account restriction copy: " + phrase);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[AUTH-02] Age and phone gate consistency check completed.");
