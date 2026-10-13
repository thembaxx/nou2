import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: true,
    proxy:
      process.env.BASE_URL?.startsWith("https:") && process.env.HTTPS_PROXY
        ? { server: process.env.HTTPS_PROXY }
        : undefined,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  reporter: "list",
});
