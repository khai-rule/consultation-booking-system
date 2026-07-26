import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Integration tests only — no jsdom, no React, plain Node environment.
    // Tests make real HTTP requests against a running Next.js server and a
    // real Postgres instance. See ASSESSMENT.md for setup instructions.
    environment: "node",
    testTimeout: 15000, // allow time for two concurrent requests + DB round-trips
  },
});
