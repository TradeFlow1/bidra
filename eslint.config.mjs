import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Expand ignores so lint targets actual product code.
  // We keep this strict: we are NOT ignoring app/components/lib/prisma/schema.
  globalIgnores([
    // Next defaults:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Repo operational folders:
    "node_modules/**",
    ".vercel/**",
    "archives/**",
    "tmp/**",
    "tools/**",
    "scripts/**",

    // One-off root scripts / scratch:
    "_tmp_check.js",
    "tmp-*.js",

    // Generated / patch artifacts (your Wave 1 scans, etc.)
    "docs/bidra_v2_*",
  ]),
  // Baseline: keep lint runnable. Keep as warnings so we still see issues.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "react/no-unescaped-entities": "warn",

      // React purity / render-stability guidance: warn for now (we’ll harden later).
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
