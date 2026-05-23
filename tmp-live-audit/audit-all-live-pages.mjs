import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, "app");
const baseUrl = "https://www.bidra.com.au";

const explicitDynamicRoutes = [
  "/listings/cmovw18tj0009js041qr5b55r",
  "/listings/cmovvnep00007js04132s1zvb",
  "/listings/cmovvawzu0005js04488r14g0",
  "/listings/cmovv024r0003js04mec6h49b",
  "/listings/cmovun42f0001js0472n1zm1e",
  "/listings/cmnr4nb8p000dl804ji5e2tmv"
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name === "page.tsx") out.push(full);
  }
  return out;
}

function routeFromPage(file) {
  const rel = path.relative(appRoot, path.dirname(file)).split(path.sep).join("/");
  if (!rel || rel === ".") return "/";
  const parts = rel.split("/").filter(Boolean);
  const routeParts = [];
  for (const part of parts) {
    if (part.startsWith("(") && part.endsWith(")")) continue;
    routeParts.push(part);
  }
  return "/" + routeParts.join("/");
}

function shouldSkip(route) {
  if (route.startsWith("/api/")) return true;
  if (route.includes("[") || route.includes("]")) return true;
  if (route === "/_not-found") return true;
  return false;
}

const staticRoutes = Array.from(new Set(walk(appRoot).map(routeFromPage).filter(r => !shouldSkip(r)))).sort();
const routes = Array.from(new Set([...staticRoutes, ...explicitDynamicRoutes])).sort();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const failures = [];

page.on("console", msg => {
  if (msg.type() !== "error") return;
  const text = msg.text();
  if (text.indexOf("Failed to fetch RSC payload") >= 0) return;
  failures.push({ route: currentRoute, kind: "CONSOLE_ERROR", detail: text });
});

page.on("pageerror", err => {
  failures.push({ route: currentRoute, kind: "PAGE_ERROR", detail: err.message });
});

let currentRoute = "";

console.log("Routes to audit: " + routes.length);

for (const route of routes) {
  currentRoute = route;
  const before = failures.length;
  const url = baseUrl + route;
  console.log("");
  console.log("=== " + route + " ===");
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const status = res ? res.status() : 0;
    const title = await page.title();
    const bodyText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
    const links = await page.locator("a[href]").count().catch(() => 0);
    const buttons = await page.locator("button").count().catch(() => 0);
    const inputs = await page.locator("input,textarea,select").count().catch(() => 0);
    console.log("Status: " + status);
    console.log("FinalUrl: " + page.url());
    console.log("Title: " + title);
    console.log("Links: " + links + " Buttons: " + buttons + " Inputs: " + inputs);
    console.log("Body: " + bodyText.replace(/\\s+/g, " ").slice(0, 400));
    if (status >= 400) failures.push({ route, kind: "HTTP_" + status, detail: page.url() });
    for (const bad of ["Something went wrong", "Application error", "NEXT_REDIRECT", "NOT_AUTHENTICATED"]) {
      if (bodyText.includes(bad)) failures.push({ route, kind: "FAIL_TEXT", detail: bad });
    }
  } catch (err) {
    console.log("FAIL_NAV: " + err.message);
    failures.push({ route, kind: "FAIL_NAV", detail: err.message });
  }
  for (let i = before; i < failures.length; i++) {
    console.log(failures[i].kind + ": " + failures[i].detail);
  }
}

await browser.close();

console.log("");
console.log("=== SUMMARY ===");
if (!failures.length) {
  console.log("PASS: All audited live pages are clean.");
} else {
  console.log("FAILURES: " + failures.length);
  for (const failure of failures) {
    console.log(failure.route + " :: " + failure.kind + " :: " + failure.detail);
  }
}
