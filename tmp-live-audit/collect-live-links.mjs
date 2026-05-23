import { chromium } from "playwright";

const baseUrl = "https://www.bidra.com.au";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(baseUrl + "/listings", { waitUntil: "networkidle", timeout: 30000 });

const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href")).filter(Boolean));
const unique = Array.from(new Set(hrefs));

console.log("=== Listing detail links ===");
for (const href of unique.filter((h) => /^\/listings\/[^/?#]+$/.test(h)).slice(0, 10)) console.log(href);

console.log("");
console.log("=== Seller links ===");
for (const href of unique.filter((h) => /^\/seller\/[^/?#]+$/.test(h)).slice(0, 10)) console.log(href);

console.log("");
console.log("=== Category links ===");
for (const href of unique.filter((h) => /^\/listings\/c\//.test(h)).slice(0, 20)) console.log(href);

await browser.close();
