import { chromium } from "playwright";

const baseUrl = "https://www.bidra.com.au";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(baseUrl + "/listings", { waitUntil: "networkidle", timeout: 30000 });

console.log("Title: " + await page.title());
console.log("URL: " + page.url());

const bodyText = await page.locator("body").innerText();
console.log("");
console.log("=== Body text first 3000 chars ===");
console.log(bodyText.slice(0, 3000));

console.log("");
console.log("=== All hrefs ===");
const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href")).filter(Boolean));
for (const href of Array.from(new Set(hrefs)).sort()) console.log(href);

await browser.close();
