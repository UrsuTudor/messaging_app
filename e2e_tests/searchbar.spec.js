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

  test.describe("display on smaller screens", () => {
    test("renders search icon", async ({ page }) => {
      await expect(page.getByRole("img", { name: "search" }).first()).toBeVisible();
    });

    test("renders input on click", async ({ page }) => {
      await expect(page.getByRole("textbox", { name: "Search for a fellow hiker" })).toHaveCount(0);
      await page.getByRole("img", { name: "search" }).first().click();

      let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).first();

      await expect(input).toBeVisible();
      await expect(input).toBeFocused();
    });

    test("hides input on blur", async ({ page }) => {
      await expect(page.getByRole("textbox", { name: "Search for a fellow hiker" })).toHaveCount(0);
      await page.getByRole("img", { name: "search" }).first().click();

      let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).first();
      await expect(input).toBeVisible();
      await input.blur();
      await expect(input).toHaveCount(0);
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
        let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).nth(1);
        await input.fill("A");
        await expect(page.getByText("Ash")).toHaveCount(1);
      });

      test("refetches the full list on an empty input", async ({ page }) => {
        let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).nth(1);
        await input.fill("A");
        await expect(page.getByTestId("userListBtn")).toHaveCount(1);

        await input.fill("");
        await page.waitForResponse(
          (response) => response.url().includes("/api/v1/users/list") && response.ok()
        );

        const count = await page.getByTestId("userListBtn").count();
        expect(count).toBeGreaterThanOrEqual(20);
      });
    });

    test.describe("on smaller screens", () => {
      test("refetches list on blur", async ({ page }) => {
        await page.getByRole("img", { name: "search" }).nth(1).click();

        let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).first();
        await input.fill("A");
        await expect(page.getByTestId("userListBtn")).toHaveCount(1);

        await input.blur();
        await page.waitForResponse(
          (response) => response.url().includes("/api/v1/users/list") && response.ok()
        );

        const count = await page.getByTestId("userListBtn").count();
        expect(count).toBeGreaterThanOrEqual(20);
      });
    });
  });
});
