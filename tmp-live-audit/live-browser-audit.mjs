import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseUrl = "https://www.bidra.com.au";
const repoRoot = process.cwd();
const appDir = path.join(repoRoot, "app");
const failures = [];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name === "page.tsx") out.push(full);
  }
  return out;
}

function pageFileToRoute(file) {
  let rel = path.relative(appDir, file);
  rel = rel.split(path.sep).join("/");
  rel = rel.replace(/\/page\.tsx$/, "");
  if (rel === "page.tsx") return "/";
  const parts = rel.split("/").filter(Boolean).filter((part) => part !== "page.tsx").filter((part) => !(part.startsWith("(") && part.endsWith(")")));
  if (parts.some((part) => part.startsWith("[") && part.endsWith("]"))) return null;
  const route = "/" + parts.join("/");
  return route === "/" ? "/" : route.replace(/\/+$/, "");
}

const routes = Array.from(new Set(walk(appDir).map(pageFileToRoute).filter(Boolean))).sort();
if (!routes.includes("/")) routes.unshift("/");

console.log("Routes: " + routes.length);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

for (const route of routes) {
  const page = await context.newPage();
  const pageFailures = [];
  page.on("console", msg => {
    const text = msg.text();
    if (msg.type() === "error" && !text.includes("Failed to load resource: the server responded with a status of 404") && !text.includes("Failed to fetch RSC payload")) {
      pageFailures.push("CONSOLE_ERROR: " + text);
    }
  });
  page.on("pageerror", err => {
    pageFailures.push("PAGE_ERROR: " + err.message);
  });

  console.log("");
  console.log("=== " + route + " ===");

  try {
    const res = await page.goto(baseUrl + route, { waitUntil: "networkidle", timeout: 30000 });
    const status = res ? res.status() : 0;
    const finalUrl = page.url();
    const title = await page.title();
    const bodyText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
    const links = await page.locator("a[href]").count().catch(() => 0);
    const buttons = await page.locator("button").count().catch(() => 0);
    const inputs = await page.locator("input,textarea,select").count().catch(() => 0);

    console.log("Status: " + status);
    console.log("FinalUrl: " + finalUrl);
    console.log("Title: " + title);
    console.log("Links: " + links + " Buttons: " + buttons + " Inputs: " + inputs);

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
if (failures.length === 0) {
  console.log("PASS: No route-level browser failures found.");
} else {
  console.log("FAILURES: " + failures.length);
  for (const failure of failures) console.log(failure);
  process.exitCode = 1;
}
