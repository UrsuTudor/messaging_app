import { test, expect } from "@playwright/test"

test.describe("eventList tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3001")
  })

  test("loads on home page by default", async ({ page }) => {
    await expect(page.getByText("Events")).toBeVisible()
  })

  test("renders event creation button", async ({ page }) => {
    await expect(page.getByText("Create your own")).toBeVisible()
  })

  test("renders event creation form", async ({ page }) => {
    let createEventBtn = page.getByText("Create your own")

    await expect(createEventBtn).toBeVisible()
    await createEventBtn.click()

    expect(page.getByLabel("Title")).toBeVisible()
  })

  test.describe("handles event display", () => {
    test.beforeEach(async ({ request, page }) => {
      await request.delete("/api/v1/test/delete_events")
      await request.post("/api/v1/test/future_events")
      await request.post("/api/v1/test/past_events")
      await page.reload()
    })

    test("loads a paginated list of events", async ({ page }) => {
      await expect(page.getByText(/Test Event/)).toHaveCount(20)

      page.getByTestId("userList")

      await page.getByTestId("banner-list").evaluate((el) => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      })

      await expect(page.getByText(/Test Event/)).toHaveCount(25)
    })

    test("doesn't load old events", async ({ page, request }) => {
      await page.reload()

      await expect(page.getByText(/Test Event/)).not.toBeVisible()
    })
  })
})
