import { chromium } from "playwright";

const baseUrl = "https://www.bidra.com.au";
const routes = [
  "/listings?type=BUY_NOW",
  "/listings?type=OFFERABLE",
  "/listings?category=electronics",
  "/listings?category=home-and-living",
  "/listings?category=vehicles",
  "/listings?category=sports-and-outdoors",
  "/listings?category=fashion",
  "/listings?category=kids-and-baby",
  "/listings?category=business-and-industrial",
  "/listings?category=books-and-media",
  "/listings?category=other"
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const failures = [];

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
    console.log("Status: " + status);
    console.log("FinalUrl: " + page.url());
    console.log("Title: " + await page.title());
    if (status >= 500) pageFailures.push("HTTP_5XX: " + status);
    if (bodyText.includes("Something went wrong")) pageFailures.push("FAIL_TEXT: Something went wrong");
    if (bodyText.includes("Application error")) pageFailures.push("FAIL_TEXT: Application error");
    if (bodyText.includes("0 results")) console.log("Observed: 0 results");
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
if (failures.length === 0) {
  console.log("PASS: Listing filter routes are clean.");
} else {
  console.log("FAILURES: " + failures.length);
  for (const failure of failures) console.log(failure);
  process.exitCode = 1;
}
