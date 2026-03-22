import { test, expect } from "@playwright/test"

test.describe("navbar tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001")
  })

  test("opens profile and returns home", async ({ page }) => {
    const profileBtn = page.getByTestId("profileBtn")
    await profileBtn.click()

    const homeBtn = page.getByRole("button", { name: "Home" })
    await expect(homeBtn).toBeInViewport()
    await homeBtn.click()

    await expect(profileBtn).toBeInViewport()
  })

  test("logs user out", async ({ page }) => {
    await page.getByRole("button", { name: "Log Out" }).click()

    await expect(page.getByRole("button", { name: "Log in" })).toBeInViewport()
  })

  test("displays events that the user has been invited to", async ({
    page,
    request,
  }) => {
    await request.post("/api/v1/test/event_membership")
    await page.reload()
    await page.getByAltText("View your invites").click()

    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible()
  })
})
