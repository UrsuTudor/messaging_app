import { test, expect } from "@playwright/test";

test.describe("mobile tests", () => {
  test.use({ viewport: { width: 650, height: 1200 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("renders user and chat list without chat component", async ({ page }) => {
    await expect(page.getByText("Chats")).toBeVisible();
    await expect(page.getByText("Users")).toBeVisible();
    await expect(page.getByTestId("chatContainer")).not.toBeVisible();
  });

  test("handles opening and closing of chat", async ({ page }) => {
    await expect(page.getByText("Chats")).toBeVisible();

    await page.getByTestId("chatListBtn").nth(0).click();

    await expect(page.getByTestId("chatBackArrow")).toBeVisible();
    await expect(page.getByText("Chats")).not.toBeVisible();
    await expect(page.getByText("Users")).not.toBeVisible();

    await page.getByTestId("chatBackArrow").click();

    await expect(page.getByText("Chats")).toBeVisible();
  });

  test.describe("profile handling tests", () => {
    test.beforeEach(async ({page}) => {
      await expect(page.getByText("Users")).toBeVisible();

      await page.getByTestId("userListBtn").nth(0).click();
      await page.getByTestId("userChatHeader").click();
    });

    test("displays user profile by itself when the user's banner is clicked in chat", async ({ page }) => {
      await expect(page.getByTestId("profileUserName")).toBeVisible();
      await expect(page.getByTestId("chatContainer")).not.toBeVisible();
    });

    test("safely returns from profile page", async ({ page }) => {
      await expect(page.getByTestId("profileUserName")).toBeVisible();

      await page.getByTestId("homeBtn").click();
      await expect(page.getByText("Chats")).toBeVisible();
      await expect(page.getByText("Users")).toBeVisible();
      await expect(page.getByTestId("profileUserName")).not.toBeVisible();
    });
  });
});
