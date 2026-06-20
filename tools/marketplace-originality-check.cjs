const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const requiredRootFile = path.join(repoRoot, "package.json");

if (!fs.existsSync(requiredRootFile)) {
  console.error("Refusing to run outside the repository root.");
  process.exit(1);
}

const roots = ["app", "components", "lib"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);
const blocked = [
  /gumtree/i,
  /ebay/i,
  /trade\s*me/i,
  /facebook\s*marketplace/i,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      out.push(...walk(full));
    } else if (extensions.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

const failures = [];
for (const root of roots) {
  for (const file of walk(path.join(repoRoot, root))) {
    const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of blocked) {
        if (pattern.test(line)) {
          failures.push(`${rel}:${index + 1}: remove external marketplace brand reference from user-facing code`);
        }
      }
    });
  }
}

if (failures.length) {
  console.error("Marketplace originality check failed:");
  failures.forEach((failure) => console.error("- " + failure));
  process.exit(1);
}

console.log("Marketplace originality check passed.");
