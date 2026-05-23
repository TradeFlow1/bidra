import { chromium } from "playwright";

const baseUrl = "https://www.bidra.com.au";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const failures = [];

const seedPage = await context.newPage();
await seedPage.goto(baseUrl + "/listings", { waitUntil: "networkidle", timeout: 30000 });
const hrefs = await seedPage.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href")).filter(Boolean));
await seedPage.close();

const routes = Array.from(new Set(hrefs.filter((h) => /^\/listings\/[^/?#]+$/.test(h)))).slice(0, 20);
console.log("Dynamic listing routes: " + routes.length);

for (const route of routes) {
  const page = await context.newPage();
  const pageFailures = [];
  page.on("console", msg => {
    const text = msg.text();
    if (msg.type() === "error" && !text.includes("Failed to fetch RSC payload")) pageFailures.push("CONSOLE_ERROR: " + text);
  });
  page.on("pageerror", err => pageFailures.push("PAGE_ERROR: " + err.message));

  console.log("");
  console.log("=== " + route + " ===");
  try {
    const res = await page.goto(baseUrl + route, { waitUntil: "networkidle", timeout: 30000 });
    const status = res ? res.status() : 0;
    const bodyText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
    const links = await page.locator("a[href]").count().catch(() => 0);
    const buttons = await page.locator("button").count().catch(() => 0);
    const inputs = await page.locator("input,textarea,select").count().catch(() => 0);

    console.log("Status: " + status);
    console.log("FinalUrl: " + page.url());
    console.log("Title: " + await page.title());
    console.log("Links: " + links + " Buttons: " + buttons + " Inputs: " + inputs);
    console.log("Body: " + bodyText.slice(0, 500).replace(/\s+/g, " "));

    if (status >= 500) pageFailures.push("HTTP_5XX: " + status);
    if (status === 404) pageFailures.push("HTTP_404_UNEXPECTED");
    for (const bad of ["NEXT_REDIRECT", "NOT_AUTHENTICATED", "Application error", "Internal Server Error", "PrismaClient", "Something went wrong"]) {
      if (bodyText.includes(bad)) pageFailures.push("FAIL_TEXT: " + bad);
    }
  } catch (err) {
    pageFailures.push("FAIL_NAV: " + err.message);
  }

  for (const failure of pageFailures) {
    console.log(failure);
    failures.push(route + " :: " + failure);
  }
  await page.close();
}

await browser.close();

console.log("");
console.log("=== SUMMARY ===");
if (failures.length === 0 && routes.length > 0) {
  console.log("PASS: Dynamic listing detail routes are clean.");
} else {
  if (routes.length === 0) failures.push("No dynamic listing routes found.");
  console.log("FAILURES: " + failures.length);
  for (const failure of failures) console.log(failure);
  process.exitCode = 1;
}
