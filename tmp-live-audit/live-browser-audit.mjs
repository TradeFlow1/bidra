import { chromium } from "playwright";

const baseUrl = "https://www.bidra.com.au";
const routes = [
  "/",
  "/listings",
  "/categories",
  "/watchlist",
  "/auth/login",
  "/auth/register",
  "/forgot-password",
  "/contact",
  "/feedback"
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const failures = [];

page.on("console", msg => {
  if (["error"].includes(msg.type())) failures.push("CONSOLE_ERROR: " + msg.text());
});

page.on("pageerror", err => {
  failures.push("PAGE_ERROR: " + err.message);
});

for (const route of routes) {
  const url = baseUrl + route;
  console.log("");
  console.log("=== " + route + " ===");
  const before = failures.length;
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    console.log("Status: " + (res ? res.status() : "no response"));
    console.log("FinalUrl: " + page.url());
    console.log("Title: " + await page.title());
    const buttons = await page.locator("button").count();
    const links = await page.locator("a[href]").count();
    const inputs = await page.locator("input,textarea,select").count();
    console.log("Links: " + links + " Buttons: " + buttons + " Inputs: " + inputs);
    const bodyText = await page.locator("body").innerText({ timeout: 10000 });
    for (const bad of ["NEXT_REDIRECT", "NOT_AUTHENTICATED", "Application error", "Something went wrong"]) {
      if (bodyText.includes(bad)) console.log("FAIL_TEXT: " + bad);
    }
  } catch (err) {
    console.log("FAIL_NAV: " + err.message);
  }
  for (let i = before; i < failures.length; i++) console.log(failures[i]);
}

await browser.close();
