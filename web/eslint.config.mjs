import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy pages and scripts copied as-is (chat page, admin page, hit.js).
    "public/**",
  ]),
  {
    rules: {
      // Pages use plain <a> on purpose: each one is a full page load, like the old multi-page site.
      // The landing and legal pages have different global CSS (same selectors, different rules), and
      // client-side navigation between them would leave the wrong CSS applied.
      "@next/next/no-html-link-for-pages": "off",
      // fonts.css is a static file in public/ and has to be linked directly.
      "@next/next/no-css-tags": "off",
      // The topo map is a decorative SVG, which next/image would not optimise anyway.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
