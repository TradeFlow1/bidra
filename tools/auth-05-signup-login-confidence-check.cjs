const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[AUTH-05] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[AUTH-05] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[AUTH-05] PASS: Found " + snippet);
  }
}

const login = read("app/auth/login/page.tsx");
const register = read("app/auth/register/page.tsx");
const reset = read("app/reset-password/page.tsx");
const registerApi = read("app/api/auth/register/route.ts");
const resetApi = read("app/api/auth/password-reset/confirm/route.ts");
const bundle = login + "\n" + register + "\n" + reset + "\n" + registerApi + "\n" + resetApi;

check(login, "Login confidence checklist");
check(login, "ACCOUNT_RESTRICTED");
check(login, "ACCOUNT_DISABLED");
check(login, "reset your password");
check(login, "aria-label={showPassword ?");
check(register, "Password confidence");
check(register, "passwordGuidanceText()");
check(register, "Check the highlighted form guidance and try again.");
check(register, "aria-label={showPassword ?");
check(register, "aria-label={showConfirmPassword ?");
check(reset, "passwordGuidanceText()");
check(reset, "checkPasswordPolicy(pw)");
check(reset, "Password strength: ");
check(reset, "Request a new link if this one has expired.");
check(reset, "aria-label={showPassword ?");
check(reset, "aria-label={showConfirmPassword ?");
check(registerApi, "checkPasswordPolicy(passwordStr)");
check(resetApi, "checkPasswordPolicy(newPassword)");

for (const forbidden of ["alert(", "prompt(", "window.confirm"]) {
  if (bundle.includes(forbidden)) {
    console.error("[AUTH-05] FAIL: Native dialog remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[AUTH-05] PASS: Native dialog absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[AUTH-05] Signup and login confidence check completed.");
