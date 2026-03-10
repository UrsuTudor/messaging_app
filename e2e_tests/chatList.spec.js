import { chromium, test, expect } from "@playwright/test";

test.describe("chatList tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001");
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
    await page.waitForTimeout(200);
    expect(await page.getByTestId("chatUserName").textContent()).toMatch(await chatList.nth(0).textContent());

    await chatList.nth(5).click();
    await expect(page.getByTestId("chatContainer")).toBeVisible();
    await page.waitForTimeout(200);
    expect(await page.getByTestId("chatUserName").textContent()).toMatch(await chatList.nth(5).textContent());
  });

  test.describe("notification updates", () => {
    test.beforeEach(async ({ page }) => {
      await expect(page.getByRole("img", { name: "message notification" })).toHaveCount(0);

      const browser = page.context().browser();
      const user2Context = await browser.newContext({ storageState: "playwright/.auth/user2.json" });
      const user2Page = await user2Context.newPage();
      await user2Page.goto("http://localhost:3001");

      await expect(user2Page.getByText("Dave2")).toBeVisible();
      await user2Page.getByText("Test Chat").click();

      const input = user2Page.getByTestId("chatInput");
      await input.fill("new message");
      await user2Page.getByTestId("sendButton").click();
    });

    test("displays notification icon when logged user receives a message", async ({ page }) => {
      await expect(page.getByRole("img", { name: "message notification" })).toBeVisible();
    });

    test("hides notification message when user opens the chat", async ({ page }) => {
      await expect(page.getByRole("img", { name: "message notification" })).toBeVisible();

      await page.getByTestId("chatListBtn").first().click();

      await expect(page.getByRole("img", { name: "message notification" })).toHaveCount(0);
    });

    test("if chat is already open, hides notification message when receiver sends a message", async ({ page }) => {
      await expect(page.getByRole("img", { name: "message notification" })).toBeVisible();
      await page.getByTestId("chatListBtn").first().click();
      await expect(page.getByRole("img", { name: "message notification" })).toHaveCount(0);

      const browser = page.context().browser();
      const user2Context = await browser.newContext({ storageState: "playwright/.auth/user2.json" });
      const user2Page = await user2Context.newPage();
      await user2Page.goto("http://localhost:3001");

      await expect(user2Page.getByText("Dave2")).toBeVisible();
      await user2Page.getByText("Test Chat").click();

      const page2Input = user2Page.getByTestId("chatInput");
      await page2Input.fill("new message");
      await user2Page.getByTestId("sendButton").click();

      await expect(page.getByRole("img", { name: "message notification" })).toBeVisible();

      const loggedUserChatInput = page.getByTestId("chatInput");
      await loggedUserChatInput.fill("new message");
      await page.getByTestId("sendButton").click();
      
      await expect(page.getByRole("img", { name: "message notification" })).toHaveCount(0);
    });
  });

  test("opens group form", async({page}) => {
    await page.getByAltText("Create a group").click()

    expect(page.locator(".dimmed")).toBeVisible()
  })

  test.describe("search bar display", () => {
    test("displays search button on smaller screens", async({page}) => {
      page.setViewportSize({width: 1300, height: 900})

      expect(page.getByAltText("search")).toBeVisible()
    })

    test("shows search bar when button is clicked on smaller screens", async({page}) => {
      page.setViewportSize({width: 1300, height: 900})

      const searchBtn = page.getByAltText("search")
      await searchBtn.click()

      expect(searchBtn).not.toBeVisible()
      expect(page.getByRole('textbox', { name: 'Search for a fellow hiker' }).nth(1)).toBeVisible()
    })

    test("hides search bar when focus is lost", async({page}) => {
      page.setViewportSize({width: 1300, height: 900})
      await page.getByAltText("search").click()

      const searchBar = page.getByRole('textbox', { name: 'Search for a fellow hiker' }).nth(1)

      await searchBar.blur()

      expect(searchBar).not.toBeVisible()
      expect(page.getByAltText("search")).toBeVisible()
    })
  })
});
