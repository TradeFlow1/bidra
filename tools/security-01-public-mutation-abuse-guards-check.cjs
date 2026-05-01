const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[SECURITY-01] FAIL: Missing " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(file, snippet) {
  const text = read(file);
  if (!text.includes(snippet)) {
    console.error("[SECURITY-01] FAIL: Missing " + snippet + " in " + file);
    process.exitCode = 1;
  } else {
    console.log("[SECURITY-01] PASS: Found " + snippet + " in " + file);
  }
}

check("app/api/contact/route.ts", 'rateLimit("contact:support:" + ip, 5, 60_000)');
check("app/api/contact/route.ts", "const website = String(body?.website");
check("app/contact/contact-form.tsx", 'name="website"');
check("app/contact/contact-form.tsx", "JSON.stringify({ email, message, website })");
check("app/api/feedback/site/route.ts", 'rateLimit("feedback:site:" + ip, 5, 60_000)');
check("app/api/feedback/site/route.ts", "const website = String(body?.website");
check("app/feedback/feedback-client.tsx", "website, // honeypot");
check("app/api/ft/feedback/route.ts", 'rateLimit("feedback:ft:" + ip, 5, 60_000)');
check("app/api/ft/feedback/route.ts", "const website = String(body?.website");
check("app/api/ft/feedback/route.ts", "ip,");
check("app/ft/feedback/page.tsx", "website,");
check("app/api/ft/report/route.ts", 'rateLimit("report:ft:" + ip, 5, 60_000)');
check("app/api/ft/report/route.ts", "const website = String(body?.website");
check("app/api/ft/report/route.ts", "ip,");
check("app/ft/report/page.tsx", "website,");
check("app/api/auth/register/route.ts", "rateLimit(`auth:register:${ip}`, 10, 60_000)");
check("app/api/auth/password-reset/request/route.ts", 'rateLimit("auth:password-reset:" + ip, 5, 60_000)');
check("app/api/auth/password-reset/request/route.ts", "return NextResponse.json({ ok: true });");

if (process.exitCode) process.exit(process.exitCode);
console.log("[SECURITY-01] Public mutation abuse guard check completed.");
