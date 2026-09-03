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
    // Prisma client hasil generate: kode buatan mesin, tidak di-commit,
    // dan tidak bisa kita perbaiki. Tanpa baris ini, `npm run lint`
    // memuntahkan ratusan error yang tidak ada hubungannya dengan kode kita.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
