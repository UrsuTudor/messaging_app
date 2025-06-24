import { test, expect } from "@playwright/test";

test.describe("chat tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test.describe("displays data correctly", () => {
    test.beforeEach(async ({ page }) => {
      const chatList = page.getByTestId("chatListBtn");
      await expect(chatList.nth(0)).toBeVisible();

      await chatList.nth(0).click();
      await expect(page.getByTestId("chatContainer")).toBeVisible();
    });

    test("displays user data  in header", async ({ page }) => {
      await expect
        .poll(async () => await page.getByTestId("chatAvatar").isVisible(), {
          timeout: 3000,
          message: "Expected avatar to be visible.",
        })
        .toBe(true);

      await expect
        .poll(async () => await page.getByTestId("chatUserName").isVisible(), {
          timeout: 5000,
          message: "Expected user name of receiver to be visible.",
        })
        .toBe(true);
    });

    test("handles message pagination", async ({ page }) => {
      await expect(page.getByTestId("msg").nth(0)).toBeVisible();
      const msgList = page.getByTestId("msgList");
      const initialMsgCount = await page.getByTestId("msg").count();

      await msgList.evaluate(async (el) => {
        el.scrollBy({ top: -600, behavior: "smooth" });
      });
      await page.waitForTimeout(500);

      const newMsgCount = await page.getByTestId("msg").count();

      expect(newMsgCount).toBeGreaterThan(initialMsgCount);
    });

    test("allows user to send messages", async ({ page }) => {
      await expect
        .poll(async () => await page.getByTestId("msg").count(), {
          timeout: 5000,
          message: "Expected messages to load.",
        })
        .toBeGreaterThan(0);

      const initialMsgCount = await page.getByTestId("msg").count();

      const input = page.getByTestId("chatInput");
      await input.fill("new message");
      await page.getByTestId("sendButton").click();

      await expect(input).toHaveValue("");
      await expect(page.getByTestId("msg")).toHaveCount(initialMsgCount + 1);
    });

    test("allows user to send messages by pressing enter", async ({ page }) => {
      await expect
        .poll(async () => await page.getByTestId("msg").count(), {
          timeout: 5000,
          message: "Expected messages to load.",
        })
        .toBeGreaterThan(0);
      const initialMsgCount = await page.getByTestId("msg").count();

      const input = page.getByTestId("chatInput");
      await input.fill("new message");
      await input.press("Enter");

      await expect(input).toHaveValue("");
      await expect(page.getByTestId("msg")).toHaveCount(initialMsgCount + 1);
    });
  });

  test("triggers an update to the chatList when a message is sent to a new chat", async ({ page }) => {
    await expect(page.getByTestId("userListBtn").nth(0)).toBeVisible();
    const userWithNoChat = page.getByTestId("userListBtn").nth(6);

    await userWithNoChat.click();
    const input = page.getByTestId("chatInput");
    await input.fill("new message");
    await page.getByTestId("sendButton").click();

    page.waitForResponse(
      (response) => response.url().includes("/api/v1/users/chats") && response.request().method() === "GET"
    );
    await expect(page.getByTestId("chatListBtn").nth(0)).toBeVisible();

    expect(await page.getByTestId("chatListBtn").nth(0).textContent()).toMatch(
      await userWithNoChat.textContent()
    );
  });
});
