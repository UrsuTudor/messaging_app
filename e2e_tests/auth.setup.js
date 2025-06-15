// @ts-check
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');
console.log(authFile)

setup('authenticate', async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.getByRole("textbox", { name: "Email" }).fill("dave@mail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("dave123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Hiker's Hub" })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
