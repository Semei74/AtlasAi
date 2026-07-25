import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.e2e-spec.ts", "test/**/*.e2e.test.ts"],
    exclude: ["node_modules", "dist"],
    testTimeout: 15000,
  },
});
