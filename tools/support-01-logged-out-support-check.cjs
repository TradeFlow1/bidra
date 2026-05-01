const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[SUPPORT-01] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[SUPPORT-01] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[SUPPORT-01] PASS: Found " + snippet);
  }
}

const contactPage = read("app/contact/page.tsx");
const contactForm = read("app/contact/contact-form.tsx");
const contactApi = read("app/api/contact/route.ts");
const support = read("app/support/page.tsx");
const bundle = contactPage + "\n" + contactForm + "\n" + contactApi + "\n" + support;

check(contactPage, "You can send support a message without logging in.");
check(contactPage, "No account required. Use the form or email us directly.");
check(contactPage, "<ContactForm defaultEmail={defaultEmail} />");
check(contactForm, "sent");
check(contactForm, "setError(");
check(contactApi, "const userId = session?.user?.id ? String(session.user.id) : null;");
check(contactApi, 'rateLimit("contact:support:" + ip, 5, 60_000)');
check(contactApi, "const website = String(body?.website");
check(contactApi, "return NextResponse.json({ ok: true });");
check(contactApi, "loggedOut: !userId");
check(contactApi, 'source: userId ? "signed-in-contact-form" : "logged-out-contact-form"');
check(support, "No login required for contact support.");

for (const forbidden of ["Sign in required.", "Log in to use the form", "support form requires you to be signed in"]) {
  if (bundle.includes(forbidden)) {
    console.error("[SUPPORT-01] FAIL: Logged-out blocker remains: " + forbidden);
    process.exitCode = 1;
  } else {
    console.log("[SUPPORT-01] PASS: Logged-out blocker absent: " + forbidden);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[SUPPORT-01] Logged-out support check completed.");
