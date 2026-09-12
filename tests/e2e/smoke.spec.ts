import { expect, test } from "@playwright/test";

test("serves the root page", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hello, I'm Yasin Ghasemi." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Read the blog/ }),
  ).toHaveAttribute("href", "/blog");
});

for (const [path, heading] of [
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/blog", "Blog"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
  ["/cookies", "Cookie Management"],
] as const) {
  test(`serves ${path}`, async ({ page }) => {
    await page.goto(path);

    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
  });
}

test("marks the current primary navigation item", async ({ page }) => {
  await page.goto("/blog");

  await expect(page.getByRole("link", { name: "/blog" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("footer exposes every policy route", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText(
    "yasinghasemi.com · 2026 · © All rights reserved",
  );
  await expect(
    footer.getByRole("link", { name: "Privacy Policy" }),
  ).toHaveAttribute("href", "/privacy");
  await expect(
    footer.getByRole("link", { name: "Terms of Service" }),
  ).toHaveAttribute("href", "/terms");
  await expect(
    footer.getByRole("link", { name: "Cookie Management" }),
  ).toHaveAttribute("href", "/cookies");
});

test("keeps mobile navigation and the site identity on separate rows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/blog");

  const identity = page.getByRole("link", { name: "Home" });
  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const [identityBox, navigationBox] = await Promise.all([
    identity.boundingBox(),
    navigation.boundingBox(),
  ]);

  expect(identityBox).not.toBeNull();
  expect(navigationBox).not.toBeNull();
  expect(navigationBox!.y + navigationBox!.height).toBeLessThanOrEqual(
    identityBox!.y,
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
