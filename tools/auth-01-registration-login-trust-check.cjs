const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[AUTH-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function pass(message) {
  console.log("[AUTH-01] PASS: " + message);
}

function fail(message) {
  console.error("[AUTH-01] FAIL: " + message);
  process.exitCode = 1;
}

const files = [
  "app/auth/login/page.tsx",
  "app/auth/register/page.tsx",
  "app/auth/register/success/page.tsx",
  "app/auth/verify/page.tsx",
  "app/forgot-password/page.tsx",
  "app/reset-password/page.tsx"
];

const combined = files.map(read).join("\n");

const required = [
  "friendlyAuthError",
  "Incorrect email or password.",
  "Please verify your email before logging in.",
  "We could not create your account. Please check your details and try again.",
  "Check your email and verify your account before logging in.",
  "Next: check your email and verify your account.",
  "We could not reset your password. Please request a new link and try again.",
  "We could not reset your password. Please try again shortly.",
  "Bidra does not reveal whether a specific email address has an account during password recovery."
];

for (const phrase of required) {
  if (!combined.includes(phrase)) {
    fail("Required auth trust copy missing: " + phrase);
  } else {
    pass("Required auth trust copy found: " + phrase);
  }
}

const forbidden = [
  'setError((data as any)?.error || "Registration failed")',
  'setError(String((data as any)?.error || "Unable to reset password. Please request a new link."))',
  "Registration failed",
  "Your account is ready. Log in to start using Bidra.",
  "Next: log in to start using Bidra."
];

for (const phrase of forbidden) {
  if (combined.includes(phrase)) {
    fail("Forbidden raw or misleading auth copy remains: " + phrase);
  } else {
    pass("Forbidden auth copy absent: " + phrase);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[AUTH-01] Registration and login trust check completed.");
