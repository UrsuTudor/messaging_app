import { test, expect } from "@playwright/test";

test.describe("chat tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001");
  });

  test.describe("displays data correctly", () => {
    test.beforeEach(async ({ page }) => {
      const chatList = page.getByTestId("chatListBtn");
      await expect(chatList.nth(0)).toBeVisible();

      await page.getByText("Test Chat", { exact: true }).click();
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

    test("handles real time messaging", async ({ page }) => {
      const browser = page.context().browser();
      const user2Context = await browser.newContext({ storageState: "playwright/.auth/user2.json" });
      const user2Page = await user2Context.newPage();
      await user2Page.goto("http://localhost:3001");

      const chatList = user2Page.getByTestId("chatListBtn");
      await expect(chatList.nth(0)).toBeVisible();

      await user2Page.getByText("Test Chat", { exact: true }).click();
      await expect(user2Page.getByTestId("msg").nth(0)).toBeVisible();

      let msgNumberCount = await user2Page.getByTestId("msg").count();

      const input = page.getByTestId("chatInput");
      await input.fill("new message");
      await page.getByTestId("sendButton").click();

      const msgLocator = user2Page.getByTestId("msg");
      await expect(msgLocator).toHaveCount(msgNumberCount + 1);
    });

    test("allows the user to open a menu list", async({page}) => {
      const menu = page.locator(".menuBtn")
      await menu.click();

      expect(page.getByRole("button", {name:"Add User"})).toBeVisible()
      expect(page.getByRole("button", {name:/Members/})).toBeVisible()
    })

    test("displays member list from menu", async({page}) => {
      await page.locator(".menuBtn").click()
      await page.getByText(/Members/).click()
      
      expect(page.locator(".memberList")).toBeVisible()
    })

    test("displays group form from menu", async({page}) => {
      await page.locator(".menuBtn").click()
      await page.getByText(/Add User/).click()
      
      // using dimmed as a sign the group form has been rendered
      // multiple group forms may be rendered on the screen in the future, for whatever reason, but
      // dimming the page should be somehting only a single, central form does
      expect(page.locator(".dimmed")).toBeVisible()
    })

    test("hides menu if it is already open and the user clicks the button again", async({page}) => {
      const menu = page.locator(".menuBtn")
      await menu.click();

      expect(page.getByRole("button", {name:"Add User"})).toBeVisible()

      await menu.click();
      expect(page.getByRole("button", {name:"Add User"})).not.toBeVisible()
    })

    test("hides the menu user list when the menu button is clicked again", async({page}) => {
      await page.locator(".menuBtn").click()
      await page.getByText(/Members/).click()
      
      expect(page.locator(".memberList")).toBeVisible()

      await page.locator(".menuBtn").click()
    
      expect(page.locator(".memberList")).not.toBeVisible()
    })
  });
});
