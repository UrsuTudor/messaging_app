import { test, expect } from "@playwright/test";

test.describe("userList tests", () => {
  let userList

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001");
    let input = page.getByRole("textbox", { name: "Search for a fellow hiker" }).nth(0);
    await input.fill("U");

    userList = page.getByTestId("userList");
  });

  test.describe("handles pagination", () => {
    test("loads a list of users", async ({ page }) => {
      await expect(
        userList.locator(':scope > *', { hasText: 'User' })
      ).toHaveCount(20);

      page.getByTestId("userList");
    });

    test("requests more users when the container is scrolled down", async ({ page }) => {
      let users = userList.locator(':scope > *', { hasText: 'User' })

      await expect(users).toHaveCount(20);

      await userList.evaluate((el) => {
        el.scrollBy({ top: 600, behavior: "smooth" });
      });

      await expect(async () => {
        const count = await users.count();
        expect(count).toBeGreaterThan(20);
      }).toPass();
    });
  });

  test.describe("supports user interaction", () => {
    test("displays user profiles on hover", async ({ page }) => {
      let child = userList.locator(':scope > *', { hasText: 'User' }).nth(0)
      await child.hover()
    
      expect(await page.getByTestId("profileUserName").textContent()).toMatch(
        await child.textContent()
      );  

      let fifthChild = userList.locator(':scope > *', { hasText: 'User' }).nth(4)
      await fifthChild.hover()
    
      expect(await page.getByTestId("profileUserName").textContent()).toMatch(
        await fifthChild.textContent()
      );  
    });

    test("keeps profile open and hides list on click", async ({ page }) => {
      expect(userList).not.toHaveClass(/hidden/)
      let child = userList.locator(':scope > *', { hasText: 'User' }).nth(0)
      await child.click()

      expect(userList).toHaveClass(/hidden/)
    });
  });
});
