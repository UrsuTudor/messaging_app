import { test, expect } from "@playwright/test";

test.describe("userList tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test.describe("handles pagination", () => {
    test("requests a list of users on load", async ({ page }) => {
      const request = await page.waitForRequest((request) => {
        return request.url().includes("/api/v1/users/list?page=1") && request.method() === "GET";
      });

      expect(request.url()).toContain(`/api/v1/users/list?page=1`);
      expect(request.method()).toBe("GET");
    });

    test("requests more users when the container is scrolled down", async ({ page }) => {
      await expect(page.getByTestId("userListBtn").nth(0)).toBeVisible();

      const userList = page.getByTestId("userList");
      await userList.evaluate(async (el) => {
        el.scrollBy({ top: 200, behavior: "smooth" });
      });
      await page.waitForTimeout(500);

      const userCount = await page.getByTestId("userListBtn").count();
      expect(userCount).toBeGreaterThan(20);
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
