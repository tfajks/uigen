import { test, expect } from "@playwright/test";

test("clicking Code tab switches to code editor view", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const previewBtn = page.getByRole("button", { name: "Preview" });
  const codeBtn = page.getByRole("button", { name: "Code" });
  await expect(previewBtn).toBeVisible();
  await expect(codeBtn).toBeVisible();

  // Preview is active by default — welcome message is visible
  await expect(page.getByText("Welcome to UI Generator")).toBeVisible();

  // Click Code tab
  await codeBtn.click();

  // Preview message disappears, code editor empty state appears
  await expect(page.getByText("Welcome to UI Generator")).not.toBeVisible();
  await expect(page.getByText("Select a file to edit")).toBeVisible();
});

test("clicking Preview tab after Code tab switches back to preview", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const previewBtn = page.getByRole("button", { name: "Preview" });
  const codeBtn = page.getByRole("button", { name: "Code" });

  // Switch to Code
  await codeBtn.click();
  await expect(page.getByText("Welcome to UI Generator")).not.toBeVisible();

  // Switch back to Preview
  await previewBtn.click();
  await expect(page.getByText("Welcome to UI Generator")).toBeVisible();
});
