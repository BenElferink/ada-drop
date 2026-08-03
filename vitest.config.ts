import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.unit.test.ts"],
    exclude: ["src/**/*.testnet.test.ts", "node_modules"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@odigos/ui-kit": path.resolve(__dirname, "./src/odigos-ui-kit"),
    },
  },
});
