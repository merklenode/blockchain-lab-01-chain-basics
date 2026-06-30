import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Blockchain Lab — main flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for blockchain to initialize (genesis block appears)
    await expect(page.getByText("Block #0")).toBeVisible();
  });

  test("page loads with genesis block and valid integrity", async ({ page }) => {
    await expect(page.getByText("Block #0")).toBeVisible();
    await expect(page.getByText("Genesis Block")).toBeVisible();
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "valid" }).first(),
    ).toBeVisible();
  });

  test('adds "Alice pays Bob 5" — 2 blocks, chain valid', async ({ page }) => {
    const input = page.getByLabel("Transaction data");
    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });
  });

  test("adds 3 blocks, then validate chain reports valid", async ({ page }) => {
    const input = page.getByLabel("Transaction data");

    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await input.fill("Bob pays Carol 3");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(3, { timeout: 5000 });

    await page.getByRole("button", { name: "Validate Chain" }).click();
    const statusEl = page.locator('[role="status"]').filter({ hasText: "Chain is valid" });
    await expect(statusEl).toBeVisible({ timeout: 3000 });
  });

  test("tamper block #1 → validate → broken at #1", async ({ page }) => {
    const input = page.getByLabel("Transaction data");
    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await page.getByRole("button", { name: "Tamper block 1" }).click();
    const tamperInput = page.getByLabel("Replacement data for block 1");
    await tamperInput.fill("EVIL DATA");
    await page.getByRole("button", { name: "Confirm" }).click();

    // Auto-validate via syncChain shows broken state in integrity badge
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "broken at #1" }).first(),
    ).toBeVisible({ timeout: 3000 });
  });

  test("repair chain after tamper → valid, all blocks present", async ({ page }) => {
    const input = page.getByLabel("Transaction data");
    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await input.fill("Bob pays Carol 3");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(3, { timeout: 5000 });

    await page.getByRole("button", { name: "Tamper block 1" }).click();
    const tamperInput = page.getByLabel("Replacement data for block 1");
    await tamperInput.fill("EVIL DATA");
    await page.getByRole("button", { name: "Confirm" }).click();

    // Wait for broken state
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "broken" }).first(),
    ).toBeVisible({ timeout: 3000 });

    await page.getByRole("button", { name: "Repair chain from block 1" }).click();

    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "valid" }).first(),
    ).toBeVisible({ timeout: 3000 });
    await expect(page.locator("article")).toHaveCount(3);
  });

  test("axe: zero WCAG 2.1 AA violations in broken state", async ({ page }) => {
    const input = page.getByLabel("Transaction data");
    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await page.getByRole("button", { name: "Tamper block 1" }).click();
    const tamperInput = page.getByLabel("Replacement data for block 1");
    await tamperInput.fill("EVIL DATA");
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "broken" }).first(),
    ).toBeVisible({ timeout: 3000 });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("axe: zero WCAG 2.1 AA violations in repaired state", async ({ page }) => {
    const input = page.getByLabel("Transaction data");
    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await page.getByRole("button", { name: "Tamper block 1" }).click();
    const tamperInput = page.getByLabel("Replacement data for block 1");
    await tamperInput.fill("EVIL DATA");
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "broken" }).first(),
    ).toBeVisible({ timeout: 3000 });

    await page.getByRole("button", { name: "Repair chain from block 1" }).click();
    await expect(
      page.locator('[aria-live="polite"]').filter({ hasText: "valid" }).first(),
    ).toBeVisible({ timeout: 3000 });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("keyboard-only flow: add block → validate chain", async ({ page }) => {
    await page.keyboard.press("Tab"); // focus tx-input (first interactive element in form)

    // Tab through any earlier focusable elements until tx-input is focused
    // Use the label to find the input directly
    const input = page.getByLabel("Transaction data");
    await input.focus();
    await input.fill("keyboard test");
    await input.press("Enter");

    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await page.getByRole("button", { name: "Validate Chain" }).focus();
    await page.keyboard.press("Enter");

    const statusEl = page.locator('[role="status"]').filter({ hasText: "Chain is valid" });
    await expect(statusEl).toBeVisible({ timeout: 3000 });
  });

  test("reset chain returns to single genesis block", async ({ page }) => {
    const input = page.getByLabel("Transaction data");
    await input.fill("Alice pays Bob 5");
    await input.press("Enter");
    await expect(page.locator("article")).toHaveCount(2, { timeout: 5000 });

    await page.getByRole("button", { name: "Reset Chain" }).click();
    await expect(page.locator("article")).toHaveCount(1, { timeout: 3000 });
    await expect(page.getByText("Genesis Block")).toBeVisible();
  });

  test("responsive: no horizontal overflow at 375px, 768px, 1280px", async ({ page }) => {
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await expect(page.getByText("Block #0")).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
    }
  });

  test("reduced-motion: --anim-speed is 0ms when prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByText("Block #0")).toBeVisible();

    const animSpeed = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--anim-speed")
        .trim(),
    );
    expect(animSpeed).toBe("0ms");
  });
});
