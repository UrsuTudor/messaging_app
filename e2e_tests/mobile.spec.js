import { test, expect } from "@playwright/test";

test.describe("mobile tests", () => {
  test.use({ viewport: { width: 650, height: 1200 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001");
  });
});
