import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Pure-logic tests for the domain layer. The `@/` alias mirrors tsconfig paths so the
// few `@/lib/...` imports (type-only, but aliased for safety) resolve under Vitest.
const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

export default defineConfig({
  resolve: {
    alias: { "@": root },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
