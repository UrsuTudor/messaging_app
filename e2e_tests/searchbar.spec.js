import { test, expect } from "@playwright/test";

test.describe("searchbar tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001");
  });

  test.describe("display on wider screens", () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test("renders the form right away", async ({ page }) => {
      await expect(page.getByRole("textbox", { name: "Search for a fellow hiker" }).first()).toBeVisible();
    });
  });

  test.describe("filtering logic", () => {
    test.describe("on wider screens", () => {
      test.use({ viewport: { width: 1920, height: 1080 } });

      test("filters the chat list", async ({ page }) => {
        let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).first();

        await input.fill("Test");
        await expect(page.getByText("Test Chat")).toHaveCount(1);
      });

      test("filters the user list", async ({ page }) => {
        let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).nth(0);
        await input.fill("A");
        await expect(page.getByText("Ash")).toHaveCount(1);
      });
    });
  });
});
