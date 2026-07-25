import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["scripts/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://localhost:5432/atlas_ai_test",
      JWT_SECRET: "test-jwt-secret-at-least-32-characters-long-!!",
    },
  },
});
