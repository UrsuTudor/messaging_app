import { test, expect } from "@playwright/test"

test.describe("eventForm tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001")

    let createEventBtn = page.getByText("Create your own")

    await expect(createEventBtn).toBeVisible()
    await createEventBtn.click()

    await expect(page.getByLabel("Title")).toBeVisible()
  })

  // RETEST THIS MANUALLY TO SEE VALUE OF NTH
  test("renders current user as an organiser", async ({ page }) => {
    let count = await page.getByAltText("Dave's profile picture").count()
    expect(count).toBe(2)
  })

  test.describe("renders updates in real time", () => {
    test("updates title", async ({ page }) => {
      await page.getByLabel("Title").fill("Test Title")
      await expect(page.getByText("Test Title")).toBeVisible()
    })

    test("updates description", async ({ page }) => {
      await page.locator("textarea.descriptionInput").fill("Test Description")

      await expect(page.getByText("Test Description")).toHaveCount(2)
    })

    test("updates date", async ({ page }) => {
      await page.getByLabel("Date").fill("2026-03-21")
      await expect(page.getByText("2026-03-21")).toBeVisible()
    })

    test("updates organiser list", async ({ page }) => {
      await page.getByText("Invite other organisers").click()
      await page.getByText("Dave2").click()
      await expect(page.getByText("Submit")).toBeVisible()
      await page.getByText("Submit").click()

      await expect(page.getByAltText("Dave2's profile picture")).toBeVisible()
    })

    test("displays cover image", async ({ page }) => {
      await page.locator("input[type='file']").setInputFiles({
        name: "test-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake image content"),
      })

      await expect(page.getByAltText("cover image preview")).toBeVisible()
    })

    test("fetches location suggestions", async ({ page }) => {
      const requestPromise = page.waitForRequest(
        (req) =>
          req.url().includes("/api/v1/events/locations") &&
          req.method() === "GET",
      )

      await page.getByLabel("Location:").fill("London")

      const request = await requestPromise
      expect(request.url()).toContain("search=London")
    })
  })
})
