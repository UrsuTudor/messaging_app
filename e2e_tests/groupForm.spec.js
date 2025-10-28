import { test, expect } from "@playwright/test";

test.describe("groupForm tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001");
    await page.getByRole("img", { name: "Create a group" }).click();
    await expect(page.getByRole("img", { name: "close group form" })).toBeVisible();
  });

  test.describe("display tests", () => {
    test("hides the groupForm when the close group icon is clicked", async ({ page }) => {
      await page.getByRole("img", { name: "close group form" }).click();
      await expect(page.getByRole("img", { name: "close group form" })).toHaveCount(0);
    });

    test("displays buttons to remove each user from the staged group as they are added", async ({ page }) => {
      await page.getByTestId("groupFormUserBtn").first().click();
      await expect(page.getByRole("img", { name: "remove user from group" })).toHaveCount(1);

      await page.getByTestId("groupFormUserBtn").first().click();
      await expect(page.getByRole("img", { name: "remove user from group" })).toHaveCount(2);
    });

    test("displays the create button when a user is added to staging", async ({ page }) => {
      await page.getByTestId("groupFormUserBtn").first().click();
      await expect(page.getByRole("button", { name: "create" })).not.toHaveClass(/hidden/);
    });

    test("hides the create button when all users are removed from staging", async ({ page }) => {
      await page.getByTestId("groupFormUserBtn").first().click();
      await expect(page.getByRole("button", { name: "create" })).toBeVisible();

      await page.getByRole("img", { name: "remove user from group" }).first().click()
      await expect(page.getByRole("button", { name: "Create", exact: true })).toHaveClass(/hidden/);
    })
  });

  test.describe("functionality tests", () => {
    test.beforeEach(async ({ page }) => {
      for (let i = 0; i < 4; i++) {
        await page.getByTestId("groupFormUserBtn").first().click();
      }
    });

    test("sends a request to create a group with the selected users", async ({ page }) => {
      const [request] = await Promise.all([
        page.waitForRequest((req) => req.url().includes("api/v1/chats/open") && req.method() === "POST"),
        page.getByRole("button", { name: "Create" }).click(),
      ]);

      expect(request.postDataJSON()['chat']['receiver_uuids'].length).toBe(4)
    });

    test("doesn't include a user that has been removed from staging in a request", async ({ page }) => {
      await page.getByRole("img", { name: "remove user from group" }).first().click()

      const [request] = await Promise.all([
        page.waitForRequest((req) => req.url().includes("api/v1/chats/open") && req.method() === "POST"),
        page.getByRole("button", { name: "Create" }).click(),
      ]);

      expect(request.postDataJSON()['chat']['receiver_uuids'].length).toBe(3)
    });
  });
});
