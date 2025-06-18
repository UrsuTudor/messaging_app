import { test, expect } from "@playwright/test";

test.describe("chatList tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("handles pagination with scrolling", async ({ page }) => {
    await expect(page.getByTestId("chatListBtn").nth(0)).toBeVisible();
    const initialChatCount = await page.getByTestId("chatListBtn").count();

    const chatList = page.getByTestId("chatList");
    await chatList.evaluate(async (el) => {
      el.scrollBy({ top: 600, behavior: "smooth" });
    });
    await page.waitForTimeout(500);

    const newChatCount = await page.getByTestId("chatListBtn").count();
    expect(newChatCount).toBeGreaterThan(initialChatCount);
  });

  test("opens chat with user on click", async ({ page }) => {
    const chatList = page.getByTestId("chatListBtn");
    await expect(chatList.nth(0)).toBeVisible();

    await chatList.nth(0).click();
    await expect(page.getByTestId("chatContainer")).toBeVisible();
    expect(await page.getByTestId("chatUserName").textContent()).toMatch(await chatList.nth(0).textContent());

    await chatList.nth(5).click();
    await expect(page.getByTestId("chatContainer")).toBeVisible();
    expect(await page.getByTestId("chatUserName").textContent()).toMatch(await chatList.nth(5).textContent());
  });
});
