import { test, expect } from "@playwright/test";

test.describe("userList tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test.describe("handles pagination", () => {
    test("requests a list of users on load", async ({ page }) => {
      await expect(page.getByTestId("userListBtn").nth(0)).toBeVisible();
      expect(await page.getByTestId("userListBtn").count()).toBeGreaterThan(10)
    });

    test("requests more users when the container is scrolled down", async ({ page }) => {
      await expect(page.getByTestId("userListBtn").nth(0)).toBeVisible();

      const userList = page.getByTestId("userList");
      const initialCount = await page.getByTestId("userListBtn").count();

      await userList.evaluate((el) => {
        el.scrollBy({ top: 600, behavior: "smooth" });
      });

      await expect
        .poll(async () => await page.getByTestId("userListBtn").count(), {
          timeout: 3000,
          message: "Expected more users to load after scrolling",
        })
        .toBeGreaterThan(initialCount);
    });
  });

  test.describe("supports user interaction", () => {
    test("displays user profiles on hover", async ({ page }) => {
      const userList = page.getByTestId("userListBtn");
      await expect(userList.nth(0)).toBeVisible();

      await userList.nth(0).hover();
      expect(await page.getByTestId("profileUserName").textContent()).toMatch(
        await userList.nth(0).textContent()
      );

      await userList.nth(5).hover();
      expect(await page.getByTestId("profileUserName").textContent()).toMatch(
        await userList.nth(5).textContent()
      );
    });

    test("displays chat with user on click", async ({ page }) => {
      const userList = page.getByTestId("userListBtn");
      await expect(userList.nth(0)).toBeVisible();

      await userList.nth(0).click();
      await expect(page.getByTestId("chatContainer")).toBeVisible();
      expect(await page.getByTestId("chatUserName").textContent()).toMatch(
        await userList.nth(0).textContent()
      );

      await userList.nth(5).click();
      await expect(page.getByTestId("chatContainer")).toBeVisible();
      expect(await page.getByTestId("chatUserName").textContent()).toMatch(
        await userList.nth(5).textContent()
      );
    });
  });
});
