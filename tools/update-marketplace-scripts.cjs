const fs = require("fs");

const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));

pkg.scripts = pkg.scripts || {};
pkg.scripts["marketplace:gate"] = "node tools/marketplace-gate.cjs";
pkg.scripts["db:drift"] = "node tools/db-drift-audit.cjs";

fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");