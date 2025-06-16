import { test, expect } from "@playwright/test";
import path from "path";

test.describe("profile tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByTestId("profileBtn").click();
  });

  test.describe("allows the logged user to edit their profile", () => {
    test("changes description", async ({ page }) => {
      await page.getByRole("button", { name: "Change description" }).click();
      await page.getByLabel("Update description").fill("New user description");
      const updateDescrBtn = page.getByRole("button", { name: "Update description" });
      await updateDescrBtn.click();

      await expect(updateDescrBtn).not.toBeVisible();
      await expect(page.getByText("New user description")).toBeVisible();
    });

    test("changes avatar", async ({ page }) => {
      const oldSrc = await page.getByTestId("userAvatar").getAttribute("src");

      await page.getByRole("button", { name: "Change profile picture" }).click();
      await page.getByLabel("Upload File").setInputFiles(path.join(process.cwd(), "public", "icon.png"));
      await page.getByRole("button", { name: "Update profile picture" }).click();

      await page.waitForTimeout(750);

      const newSrc = await page.getByTestId("userAvatar").getAttribute("src");

      expect(newSrc).not.toBe(oldSrc);
    });
  });

  test.describe("doesn't send a fetch request on wrong avatar input", () => {
    const checkRequests = (page, requestArray) => {
      page.on("request", (request) => {
        if (request.resourceType() === "fetch") {
          requestArray.push(request);
        }
      });

      return requestArray;
    };

    const handleAvatarInput = async (page, uploadFile, file = {}) => {
      await page.getByRole("button", { name: "Change profile picture" }).click();

      if (uploadFile) {
        await page.getByLabel("Upload File").setInputFiles(file);
      }

      await page.getByRole("button", { name: "Update profile picture" }).click();
    };

    test("on missing file", async ({ page }) => {
      const requests = [];
      checkRequests(page, requests);

      await handleAvatarInput(page, false);

      expect(requests.length).toBe(0);
    });

    test("on wrong file type", async ({ page }) => {
      const requests = [];
      checkRequests(page, requests);

      await handleAvatarInput(page, true, {
        name: "fakegif.gif",
        mimeType: "image/gif",
        buffer: Buffer.alloc(5 * 1024 * 1024),
      });

      expect(requests.length).toBe(0);
    });

    test("on wrong file size", async ({ page }) => {
      const requests = [];
      checkRequests(page, requests);

      await handleAvatarInput(page, true, {
        name: "fakeimage.png",
        mimeType: "image/png",
        buffer: Buffer.alloc(5 * 2048 * 1024),
      });

      expect(requests.length).toBe(0);
    });
  });
});
