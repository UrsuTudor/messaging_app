// @ts-check
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');
const authFile2 = path.join(__dirname, '../playwright/.auth/user2.json')

setup('authenticate', async ({ page }) => {
  await page.goto("http://localhost:3001");
  await page.getByRole("textbox", { name: "Email" }).fill("dave@mail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("dave123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Chats" })).toBeVisible();

  await page.context().storageState({ path: authFile });
});

setup('authenticate2ndUser', async ({ page }) => {
  await page.goto("http://localhost:3001");
  await page.getByRole("textbox", { name: "Email" }).fill("dave2@mail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("dave2123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Chats" })).toBeVisible();

  await page.context().storageState({ path: authFile2 });
});
