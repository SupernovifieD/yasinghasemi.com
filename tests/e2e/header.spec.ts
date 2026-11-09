import { expect, test, type Page } from "@playwright/test";

const NAV_LABELS = ["/projects", "/blog", "/about", "/contact"];

const overflows = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

test.describe("desktop header", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows the site name left and four links right on inner pages", async ({
    page,
  }) => {
    await page.goto("/about");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const wordmark = header.getByRole("link", { name: "yasinghasemi.com" });
    await expect(wordmark).toHaveAttribute("href", "/");

    const nav = header.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.getByRole("link")).toHaveText(NAV_LABELS);

    // Site name on the left half, links on the right half.
    const [wordmarkBox, navBox] = await Promise.all([
      wordmark.boundingBox(),
      nav.boundingBox(),
    ]);
    expect(wordmarkBox!.x + wordmarkBox!.width).toBeLessThan(720);
    expect(navBox!.x).toBeGreaterThan(720);

    await expect(header.locator("summary")).toBeHidden();
    expect(await overflows(page)).toBe(false);
  });

  test("has no header on the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("header")).toBeHidden();
    // Navigation still reaches every section from the page body.
    await expect(
      page.getByRole("navigation", { name: "Sections" }).getByRole("link"),
    ).toHaveText(NAV_LABELS);
  });

  test("the site name links home from an inner page", async ({ page }) => {
    await page.goto("/blog");
    await page
      .locator("header")
      .getByRole("link", { name: "yasinghasemi.com" })
      .click();

    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("mobile header", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows the site name and a hamburger on every page, home included", async ({
    page,
  }) => {
    for (const path of ["/", "/projects", "/blog", "/about", "/contact"]) {
      await page.goto(path);

      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect(
        header.getByRole("link", { name: "yasinghasemi.com" }),
      ).toBeVisible();
      await expect(header.locator("summary")).toBeVisible();
      // The desktop link row is not shown; the menu holds the links.
      await expect(
        header.locator("nav").first().getByRole("link", { name: "/projects" }),
      ).toBeHidden();
    }
  });

  test("opens a menu with the four links centered", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await header.locator("summary").click();

    const links = header.locator("nav").getByRole("link");
    await expect(links).toHaveText(NAV_LABELS);

    const viewportCenter = 390 / 2;
    for (const link of await links.all()) {
      const box = (await link.boundingBox())!;
      expect(Math.abs(box.x + box.width / 2 - viewportCenter)).toBeLessThan(2);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await overflows(page)).toBe(false);
  });

  test("closes on Escape, on an outside press, and after choosing a link", async ({
    page,
  }) => {
    await page.goto("/");
    const details = page.locator("header details");
    const summary = details.locator("summary");

    await summary.click();
    await expect(details).toHaveJSProperty("open", true);
    await page.keyboard.press("Escape");
    await expect(details).toHaveJSProperty("open", false);
    await expect(summary).toBeFocused();

    await summary.click();
    await expect(details).toHaveJSProperty("open", true);
    await page.locator("main").click({ position: { x: 5, y: 400 } });
    await expect(details).toHaveJSProperty("open", false);

    await summary.click();
    await details.getByRole("link", { name: "/about" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("header details")).toHaveJSProperty(
      "open",
      false,
    );
  });

  test("marks the current page in the menu", async ({ page }) => {
    await page.goto("/blog");
    await page.locator("header summary").click();

    await expect(
      page.locator("header nav").getByRole("link", { name: "/blog" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("home keeps plain links and shows no preview", async ({ page }) => {
    await page.goto("/");

    const link = page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: "/blog", exact: true });
    await link.hover();
    await link.click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator("[data-preview]")).toHaveCount(0);
  });
});

test.describe("reflow", () => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of ["/", "/projects", "/blog", "/about", "/contact"]) {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        expect(await overflows(page), `${path} at ${width}px`).toBe(false);
      }
    });
  }

  test("switches layout at exactly 64rem (1024px)", async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 900 });
    await page.goto("/about");
    await expect(page.locator("header summary")).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(page.locator("header summary")).toBeHidden();
    await expect(
      page
        .locator("header")
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link"),
    ).toHaveCount(4);
  });
});
