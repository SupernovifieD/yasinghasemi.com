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
  ["/contact", "/contact"],
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

test("lists every published post newest first without categories", async ({
  page,
}) => {
  await page.goto("/blog");

  const results = page.locator("main article");
  await expect(results).toHaveCount(5);
  await expect(results.locator("h2")).toHaveText([
    "Three Fast Weeks and a First Taste of Paid Programming",
    "When MPM Becomes a Decision Marathon",
    "Why Did I Start Working on a Mineral Prospectivity Mapping Project?",
    "How NetRadar Was Started",
    "The Story of This Blog, aka The Beginning",
  ]);
  expect(
    await results
      .locator("time")
      .evaluateAll((times) =>
        times.map((time) => (time as HTMLTimeElement).dateTime),
      ),
  ).toEqual([
    "2026-06-09",
    "2026-05-20",
    "2026-05-12",
    "2026-05-09",
    "2026-05-06",
  ]);
  await expect(page.getByText(/categor(y|ies)/i)).toHaveCount(0);
});

test("renders every published article directly with one title", async ({
  page,
}) => {
  for (const { slug, title, date } of [
    {
      slug: "the-story-of-this-blog",
      title: "The Story of This Blog, aka The Beginning",
      date: "2026-05-06",
    },
    {
      slug: "how-netradar-was-started",
      title: "How NetRadar Was Started",
      date: "2026-05-09",
    },
    {
      slug: "why-i-started-mineral-prospectivity-mapping",
      title:
        "Why Did I Start Working on a Mineral Prospectivity Mapping Project?",
      date: "2026-05-12",
    },
    {
      slug: "when-mpm-becomes-a-decision-marathon",
      title: "When MPM Becomes a Decision Marathon",
      date: "2026-05-20",
    },
    {
      slug: "three-fast-weeks-and-a-first-taste-of-paid-programming",
      title: "Three Fast Weeks and a First Taste of Paid Programming",
      date: "2026-06-09",
    },
  ]) {
    await page.goto(`/blog/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("article time")).toHaveAttribute(
      "datetime",
      date,
    );
    await expect(
      page.getByRole("link", { name: "← Back to /blog" }),
    ).toHaveAttribute("href", "/blog");
  }
});

test("unknown post slugs return not found", async ({ page }) => {
  const response = await page.goto("/blog/not-a-published-post");

  expect(response?.status()).toBe(404);
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

test("about preserves verified biography without the retired desktop framing", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(page.getByText(/M\.Sc\. in mining engineering/)).toBeVisible();
  await expect(page.getByText(/MinexPy/)).toBeVisible();
  await expect(page.getByText(/Windows 98/)).toHaveCount(0);
});

test("contact contains exactly the requested destinations", async ({
  page,
}) => {
  await page.goto("/contact");

  const mainLinks = page.locator("main a");
  await expect(mainLinks).toHaveCount(3);
  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/SupernovifieD",
  );
  await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/yasinghasemi/",
  );
  await expect(
    page.getByRole("link", { name: "y@yasinghasemi.com" }),
  ).toHaveAttribute("href", "mailto:y@yasinassemi.com");
});
