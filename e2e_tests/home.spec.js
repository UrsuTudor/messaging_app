import { test, expect } from "@playwright/test";

test.describe("home tests", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("requires login before showing home page", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const email_field = page.getByRole("textbox", { name: "Email" });
    await email_field.focus();
    expect(email_field).toBeFocused();

    await page.getByRole("textbox", { name: "Email" }).fill("dave@mail.com");
    await page.getByRole("textbox", { name: "Password" }).fill("dave123");
    await page.getByRole("button", { name: "Log in" }).click();

    const title = page.getByRole("heading", { name: "Hiker's Hub" });
    await expect(title).toBeVisible();
  });
});
