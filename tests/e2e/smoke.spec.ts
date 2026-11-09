import { expect, test } from "@playwright/test";

test("serves the root page with the welcome note and four links", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("main")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hello, I'm Yasin Ghasemi." }),
  ).toBeVisible();

  const links = page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link");
  await expect(links).toHaveText(["/projects", "/blog", "/about", "/contact"]);
  await expect(links).toHaveCount(4);
});

for (const [path, heading] of [
  ["/projects", "/projects"],
  ["/about", "/about"],
  ["/contact", "/contact"],
  ["/blog", "/blog"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
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

  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "/blog", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("moves keyboard focus from the skip link to main content", async ({
  browserName,
  page,
}) => {
  await page.goto("/about");
  // Safari only tabs to links when Option is held.
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("keeps core reading and navigation available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link", { name: "/blog", exact: true })
    .click();
  await expect(page).toHaveURL(/\/blog$/);
  await page
    .getByRole("link", {
      name: "Three Fast Weeks and a First Taste of Paid Programming",
    })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Three Fast Weeks and a First Taste of Paid Programming",
    }),
  ).toBeVisible();

  await context.close();
});

test("disables smooth scrolling when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
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

for (const width of [320, 1440, 1920]) {
  test(`centers the blog results on the article column at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/blog/why-i-started-mineral-prospectivity-mapping");
    await page.evaluate(() => document.fonts.ready);
    const article = (await page.locator("main").boundingBox())!;
    const articleHeader = (await page.locator("header").boundingBox())!;
    await page.goto("/blog");
    await page.evaluate(() => document.fonts.ready);
    const index = (await page.locator("main").boundingBox())!;
    const indexHeader = (await page.locator("header").boundingBox())!;
    const heading = page.getByRole("heading", { level: 1, name: "/blog" });
    await expect(heading).toBeVisible();
    expect(Math.abs(index.x - article.x)).toBeLessThan(1);
    expect(Math.abs(index.width - article.width)).toBeLessThan(1);
    // The header has the same height on every page; compare the gap below it.
    const articleGap = article.y - (articleHeader.y + articleHeader.height);
    const indexGap = index.y - (indexHeader.y + indexHeader.height);
    expect(Math.abs(indexGap - articleGap)).toBeLessThan(1);
    for (const element of [
      heading,
      ...(await page.locator("main article").all()),
    ]) {
      expect(Math.abs((await element.boundingBox())!.x - index.x)).toBeLessThan(
        1,
      );
    }
    await expect(page.locator("main article p").first()).toHaveCSS(
      "font-size",
      "15px",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("serves canonical page and article metadata", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveTitle("About | Yasin Ghasemi");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://yasinghasemi.com/about",
  );

  await page.goto("/blog/the-story-of-this-blog");
  await expect(page).toHaveTitle(
    "The Story of This Blog, aka The Beginning | Yasin Ghasemi",
  );
  await expect(
    page.locator('meta[property="article:published_time"]'),
  ).toHaveAttribute("content", "2026-05-06");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
});

test("renders every published article directly with one title", async ({
  page,
}) => {
  for (const { slug, title, date, paragraphs, finalText } of [
    {
      slug: "the-story-of-this-blog",
      title: "The Story of This Blog, aka The Beginning",
      date: "2026-05-06",
      paragraphs: 7,
      finalText: "Feel free to use the blog code",
    },
    {
      slug: "how-netradar-was-started",
      title: "How NetRadar Was Started",
      date: "2026-05-09",
      paragraphs: 10,
      finalText: "Let's be a judge of this over time.",
    },
    {
      slug: "why-i-started-mineral-prospectivity-mapping",
      title:
        "Why Did I Start Working on a Mineral Prospectivity Mapping Project?",
      date: "2026-05-12",
      paragraphs: 7,
      finalText: "before I become comepletely uninterested in this project.",
    },
    {
      slug: "when-mpm-becomes-a-decision-marathon",
      title: "When MPM Becomes a Decision Marathon",
      date: "2026-05-20",
      paragraphs: 7,
      finalText: "Hopefully, AI is here to save the day.",
    },
    {
      slug: "three-fast-weeks-and-a-first-taste-of-paid-programming",
      title: "Three Fast Weeks and a First Taste of Paid Programming",
      date: "2026-06-09",
      paragraphs: 6,
      finalText:
        "This is the first time I'm earning money directly with programming.",
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
    await expect(page.locator("article > div p")).toHaveCount(paragraphs);
    await expect(page.getByText(finalText, { exact: false })).toBeVisible();
  }
});

test("every post ends with a divider and three other posts to read", async ({
  page,
}) => {
  await page.goto("/blog");
  const all = await page
    .locator("main article h2 a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  expect(all.length).toBeGreaterThan(3);

  for (const href of all) {
    await page.goto(href);
    const more = page.getByRole("region", { name: "Keep reading" });
    const links = more.getByRole("link");
    await expect(links).toHaveCount(3);

    const targets = await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")!),
    );
    expect(new Set(targets).size).toBe(3);
    expect(targets).not.toContain(href);
    for (const target of targets) expect(all).toContain(target);

    // After the article, with a decorative divider above the heading.
    const [article, section] = [
      (await page.locator("main article").boundingBox())!,
      (await more.boundingBox())!,
    ];
    expect(section.y).toBeGreaterThan(article.y + article.height);
    await expect(more.locator('[aria-hidden="true"]')).toHaveCount(1);
    await expect(more.getByRole("heading", { level: 2 })).toHaveText(
      "Keep reading",
    );

    // Each row is a title and the post's excerpt.
    for (const link of await links.all()) {
      expect((await link.innerText()).split("\n").length).toBeGreaterThan(1);
    }
  }
});

test("unknown post slugs return not found", async ({ page }) => {
  const response = await page.goto("/blog/not-a-published-post");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(
    page.getByRole("link", { name: "View all posts" }),
  ).toHaveAttribute("href", "/blog");
});

test("long article content does not overflow the page", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/blog/why-i-started-mineral-prospectivity-mapping");

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page.locator("article p")).toHaveCount(7);
});

test("the footer strip is centered on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");

  const footer = page.getByRole("contentinfo");
  const items = [
    footer.getByText("All rights reserved"),
    ...(await footer.getByRole("link", { name: /Privacy|Terms/ }).all()),
  ];
  const rows: number[] = [];
  for (const item of items) {
    const box = (await item.boundingBox())!;
    rows.push(Math.round(box.y));
  }
  // The copyright line and the policy links stack, each row centered.
  const copyright = (await items[0].boundingBox())!;
  expect(Math.abs(copyright.x + copyright.width / 2 - 195)).toBeLessThan(12);
  const policy = (await footer.getByRole("navigation").boundingBox())!;
  expect(Math.abs(policy.x + policy.width / 2 - 195)).toBeLessThan(2);
  expect(policy.y).toBeGreaterThan(copyright.y + copyright.height - 1);
});

test("header and footer text is one notch smaller", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");

  // The footer element inherits the body size; its strip and links set 13px.
  for (const selector of ["header a", "footer a"]) {
    await expect(page.locator(selector).first()).toHaveCSS("font-size", "13px");
  }
  expect((await page.locator("header").boundingBox())!.height).toBeLessThan(70);
});

test("footer exposes the policy routes", async ({ page }) => {
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
  await expect(footer.getByRole("link")).toHaveCount(3);
});

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`aligns short pages with the article column at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/blog/why-i-started-mineral-prospectivity-mapping");
    await page.evaluate(() => document.fonts.ready);
    const article = (await page.locator("main").boundingBox())!;
    for (const route of ["/about", "/contact"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const main = (await page.locator("main").boundingBox())!;
      const content = (await page.locator("main > div").boundingBox())!;
      const heading = (await page.locator("h1").boundingBox())!;
      expect(Math.abs(main.x - article.x)).toBeLessThan(1);
      expect(Math.abs(main.width - article.width)).toBeLessThan(1);
      expect(Math.abs(main.x + main.width / 2 - width / 2)).toBeLessThan(1);
      expect(Math.abs(heading.x - article.x)).toBeLessThan(1);
      await expect(page.locator("main > div")).toHaveCSS("font-size", "15px");
      // Centered on phones too (the block grows the page if it is taller).
      expect(
        Math.abs(content.y + content.height / 2 - (main.y + main.height / 2)),
      ).toBeLessThan(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}

for (const viewport of [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
]) {
  test(`mobile home is centered and does not scroll at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollHeight <=
          document.documentElement.clientHeight,
      ),
    ).toBe(true);

    const main = (await page.locator("main").boundingBox())!;
    const heading = (await page
      .getByRole("heading", { level: 1 })
      .boundingBox())!;
    const lastLink = (await page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link")
      .last()
      .boundingBox())!;
    const blockCenter = (heading.y + lastLink.y + lastLink.height) / 2;
    expect(Math.abs(blockCenter - (main.y + main.height / 2))).toBeLessThan(12);
  });
}

test("top-aligns short pages on short screens", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 420 });
  for (const route of ["/about", "/contact"]) {
    await page.goto(route);
    const main = (await page.locator("main").boundingBox())!;
    const content = (await page.locator("main > div").boundingBox())!;
    expect(Math.abs(content.y - main.y)).toBeLessThan(1);
    const footer = (await page.locator("footer").boundingBox())!;
    expect(footer.y).toBeGreaterThanOrEqual(content.y + content.height);
  }
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
  ).toHaveAttribute("href", "mailto:y@yasinghasemi.com");
});

for (const route of ["/blog", "/contact"]) {
  test(`${route} has a short subtitle under its title`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const subtitle = page.locator("main h1 + p");
    await expect(subtitle).toHaveCount(1);
    const text = await subtitle.innerText();
    expect(text.length).toBeGreaterThan(20);
    expect(text).not.toMatch(/categor(y|ies)/i);
    await expect(subtitle.getByRole("link")).toHaveCount(0);

    // Directly under the title, left-aligned with it, and short enough to sit
    // on one or two lines.
    const [title, sub] = [
      (await page.locator("h1").boundingBox())!,
      (await subtitle.boundingBox())!,
    ];
    expect(sub.y).toBeGreaterThanOrEqual(title.y + title.height);
    expect(sub.y - (title.y + title.height)).toBeLessThan(24);
    expect(Math.abs(sub.x - title.x)).toBeLessThan(1);
    expect(sub.height).toBeLessThan(60);
  });
}

test("privacy policy describes implemented and unverified data handling", async ({
  page,
}) => {
  await page.goto("/privacy");

  await expect(page.getByText(/no user accounts/)).toBeVisible();
  await expect(
    page.getByText(/in memory for the current browser tab/),
  ).toBeVisible();
  await expect(page.getByText(/may keep operational logs/)).toBeVisible();
  await expect(page.getByText(/have not been verified here/)).toBeVisible();
});

test("terms describe a personal publishing site without product terms", async ({
  page,
}) => {
  await page.goto("/terms");

  await expect(page.getByText(/personal blog and publishing/)).toBeVisible();
  await expect(page.getByText(/not a promise of future results/)).toBeVisible();
  await expect(page.getByText(/repository license/)).toBeVisible();
  await expect(
    page.getByText(/subscription|payment|refund|account/i),
  ).toHaveCount(0);
});
