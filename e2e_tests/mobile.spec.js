import { test, expect } from "@playwright/test"

test.describe("mobile tests", () => {
  test.use({ viewport: { width: 650, height: 1200 } })

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001")
  })

  test.describe("chat functionality", () => {
    test("displays button to open chatList", async ({ page }) => {
      await expect(page.getByAltText("chat list icon")).toBeVisible()
    })

    test("opens chatList on click", async ({ page }) => {
      let button = page.getByAltText("chat list icon")

      await button.click()

      await expect(page.getByTestId("chatList")).toBeVisible()
    })

    test("opens chat from chatList", async ({ page }) => {
      let button = page.getByAltText("chat list icon")

      await button.click()

      await page.getByText("Test Chat").click()

      await expect(page.getByTestId("chatList")).not.toBeVisible()
      await expect(page.getByTestId("chatContainer")).toBeVisible()
    })
  })

  test.describe("user list functionality", () => {
    test("displays button to open search bar", async ({ page }) => {
      await expect(page.getByTestId("user list search icon")).toBeVisible()
    })

    test("displays search bar on click", async ({ page }) => {
      let button = page.getByTestId("user list search icon")

      await button.click()

      await expect(page.getByTestId("user list search bar")).toBeVisible()
    })

    test("closes search bar on blur", async ({ page }) => {
      let button = page.getByTestId("user list search icon")

      await button.click()

      let searchBar = page.getByTestId("user list search bar")
      await expect(searchBar).toBeVisible()

      // blurs the searchBar
      await page.locator("body").click()

      await expect(searchBar).not.toBeVisible()
    })

    test("displays search results on input", async ({ page }) => {
      let button = page.getByTestId("user list search icon")

      await button.click()

      await page
        .getByTestId("user list search bar")
        .getByText("Search for a fellow hiker")
        .fill("A")

      await expect(page.getByText("Ash")).toBeVisible()
    })

    test("displays user profile on click", async ({ page }) => {
      let button = page.getByTestId("user list search icon")

      await button.click()

      await page
        .getByTestId("user list search bar")
        .getByText("Search for a fellow hiker")
        .fill("A")

      await page.getByText("Ash").click()

      await expect(page.getByTestId("profileUserName")).toBeVisible()
    })
  })
})
