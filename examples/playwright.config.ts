import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["courier.spec.ts", "frameworks.spec.ts"],
  outputDir: "../.artifacts/example-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: process.env.CI !== undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4290",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium" }],
  webServer: [
    {
      command:
        "pnpm --filter example-react build && pnpm --filter example-react exec vite preview --host 127.0.0.1 --port 4290 --strictPort",
      cwd: "..",
      url: "http://127.0.0.1:4290",
      reuseExistingServer: process.env.CI === undefined,
      timeout: 120_000,
    },
    {
      command:
        "pnpm --filter example-vue build && pnpm --filter example-vue exec vite preview --host 127.0.0.1 --port 4291 --strictPort",
      cwd: "..",
      url: "http://127.0.0.1:4291",
      reuseExistingServer: process.env.CI === undefined,
      timeout: 120_000,
    },
    {
      command:
        "pnpm --filter example-solid build && pnpm --filter example-solid exec vite preview --host 127.0.0.1 --port 4292 --strictPort",
      cwd: "..",
      url: "http://127.0.0.1:4292",
      reuseExistingServer: process.env.CI === undefined,
      timeout: 120_000,
    },
    {
      command:
        "pnpm --filter example-svelte build && pnpm --filter example-svelte exec vite preview --host 127.0.0.1 --port 4293 --strictPort",
      cwd: "..",
      url: "http://127.0.0.1:4293",
      reuseExistingServer: process.env.CI === undefined,
      timeout: 120_000,
    },
  ],
});
