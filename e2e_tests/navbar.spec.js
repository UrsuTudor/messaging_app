// @ts-check
import { test, expect } from '@playwright/test';

test('opens profile and returns home', async({page}) => {
  await page.goto("http://localhost:3000")

  const profileBtn = page.getByTestId("profileBtn")
  await profileBtn.click();

  const homeBtn = page.getByRole("button", {name: "Home"})
  await expect(homeBtn).toBeInViewport();
  await homeBtn.click();

  await expect(profileBtn).toBeInViewport();
});

test('logs user out', async({page}) => {
  await page.goto("http://localhost:3000")

  await page.getByRole("button", {name: "Log Out"}).click();

  await expect(page.getByRole("button", {name: "Log in"})).toBeInViewport();
});
