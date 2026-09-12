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

test("legacy html article URLs redirect once to canonical posts", async ({
  request,
}) => {
  for (const [source, destination] of [
    [
      "/mydocuments/0-thebeginning/howitcametobe.html",
      "/blog/the-story-of-this-blog",
    ],
    [
      "/mydocuments/1-NetRadar/1-howitstarted/howitstarted.html",
      "/blog/how-netradar-was-started",
    ],
    [
      "/mydocuments/2-MineralProspectivityMapping/why/why.html",
      "/blog/why-i-started-mineral-prospectivity-mapping",
    ],
    [
      "/mydocuments/2-MineralProspectivityMapping/May-20/mpm-and-its-challenges.html",
      "/blog/when-mpm-becomes-a-decision-marathon",
    ],
    [
      "/mydocuments/Journal/06-09-2026/a-bit-of-bordom.html",
      "/blog/three-fast-weeks-and-a-first-taste-of-paid-programming",
    ],
  ]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
});

test("recovers known legacy hash bookmarks with history replacement", async ({
  page,
}) => {
  await page.goto("/#/docs/0-thebeginning");
  await expect(page).toHaveURL(/\/blog\/the-story-of-this-blog$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "The Story of This Blog, aka The Beginning",
    }),
  ).toBeVisible();

  await page.goto("/#%2Fdocs%2FJournal%2F06-09-2026%2F");
  await expect(page).toHaveURL(
    /\/blog\/three-fast-weeks-and-a-first-taste-of-paid-programming$/,
  );

  await page.goto("/#/docs/1-NetRadar/2026-05-03");
  await expect(page).toHaveURL(/\/blog$/);
});

test("leaves modern anchors alone and explains unknown legacy hashes", async ({
  page,
}) => {
  await page.goto("/#main-content");
  await expect(page).toHaveURL(/\/#main-content$/);
  await expect(page.getByText(/old document bookmark/i)).toHaveCount(0);

  await page.goto("/#/docs/not-in-the-audit");
  await expect(page).toHaveURL(/\/#\/docs\/not-in-the-audit$/);
  await expect(page.getByText(/old document bookmark/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "all posts" })).toHaveAttribute(
    "href",
    "/blog",
  );
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

test("runs terminal information and navigation commands safely", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await expect(input).not.toBeFocused();

  await input.fill("pwd");
  await input.press("Enter");
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toContainText("/");

  await input.fill("cd blog");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/blog$/);
  await expect(
    page.getByText("visitor@yasinghasemi.com: /blog $"),
  ).toBeVisible();
  await expect(input).toBeFocused();

  await input.fill("ls");
  await input.press("Enter");
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toContainText("the-story-of-this-blog/");

  await input.fill("clear");
  await input.press("Enter");
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toHaveCount(0);
  await expect(page).toHaveURL(/\/blog$/);
});

test("keeps failed terminal navigation on the current route", async ({
  page,
}) => {
  await page.goto("/about");
  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await input.fill("cd blog");
  await input.press("Enter");

  await expect(page).toHaveURL(/\/about$/);
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toContainText("Try cd /blog.");
});

test("recalls terminal history and restores the in-progress draft", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  for (const command of ["pwd", "help"]) {
    await input.fill(command);
    await input.press("Enter");
  }

  await input.fill("unfinished draft");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("help");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("pwd");
  await input.press("ArrowDown");
  await expect(input).toHaveValue("help");
  await input.press("ArrowDown");
  await expect(input).toHaveValue("unfinished draft");
  await input.press("Escape");
  await expect(input).toHaveValue("");
});

test("uses link navigation for cd - history without forcing command focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "/about" }).click();
  await expect(page).toHaveURL(/\/about$/);

  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await expect(input).not.toBeFocused();
  await input.fill("cd -");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await input.fill("cd -");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/about$/);
});

test("rejects multiline paste and composition Enter", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });

  await input.evaluate((element) => {
    const data = new DataTransfer();
    data.setData("text", "pwd\ncd /blog");
    element.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData: data }),
    );
  });
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toContainText("submit one single-line command");
  await expect(page).toHaveURL(/\/$/);

  await input.fill("cd /blog");
  await input.dispatchEvent("compositionstart");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await input.dispatchEvent("compositionend");
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
