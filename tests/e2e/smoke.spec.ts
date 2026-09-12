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

test("serves tested security headers without breaking hydration", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /content security policy/i.test(message.text())
    ) {
      violations.push(message.text());
    }
  });

  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response?.headers()["permissions-policy"]).toBe(
    "camera=(), geolocation=(), microphone=()",
  );
  expect(response?.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");

  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await input.fill("pwd");
  await input.press("Enter");
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toContainText("/");
  expect(violations).toEqual([]);
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

test("moves keyboard focus from the skip link to main content", async ({
  browserName,
  page,
}) => {
  await page.goto("/");
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
  await expect(
    page.getByText(/Shell commands require JavaScript/),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Website navigation command" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "/blog" }).click();
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
  for (const [hash, slug] of [
    ["/docs/0-thebeginning", "the-story-of-this-blog"],
    ["/docs/1-NetRadar/1-howitstarted", "how-netradar-was-started"],
    [
      "/docs/2-MineralProspectivityMapping/why",
      "why-i-started-mineral-prospectivity-mapping",
    ],
    [
      "/docs/2-MineralProspectivityMapping/May-20",
      "when-mpm-becomes-a-decision-marathon",
    ],
    [
      "/docs/Journal/06-09-2026",
      "three-fast-weeks-and-a-first-taste-of-paid-programming",
    ],
  ] as const) {
    await page.goto(`/#${hash}`);
    await expect(page).toHaveURL(new RegExp(`/blog/${slug}$`));
  }

  await page.goto("/#%2Fdocs%2FJournal%2F06-09-2026%2F");
  await expect(page).toHaveURL(
    /\/blog\/three-fast-weeks-and-a-first-taste-of-paid-programming$/,
  );

  for (const hash of [
    "/docs",
    "/docs/1-NetRadar",
    "/docs/1-NetRadar/2026-05-03",
    "/docs/2-MineralProspectivityMapping",
    "/docs/Journal",
  ]) {
    await page.goto(`/#${hash}`);
    await expect(page).toHaveURL(/\/blog$/);
  }
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
  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toHaveAttribute("tabindex", "0");

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

test("serializes rapid terminal navigation submissions", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await input.fill("cd /blog");
  await input.evaluate((element) => {
    const form = element.closest("form");
    form?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    form?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });

  await expect(page).toHaveURL(/\/blog$/);
  const transcript = page.getByRole("region", {
    name: "Terminal command output",
  });
  await expect(transcript).toContainText("cd /blog");
  await expect(transcript.getByText(/cd \/blog/)).toHaveCount(1);
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

test("tracks browser history in the prompt and previous directory", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "/about" }).click();
  await expect(
    page.getByText("visitor@yasinghasemi.com: /about $"),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("visitor@yasinghasemi.com: / $")).toBeVisible();

  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await input.fill("cd -");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/about$/);

  await page.goBack();
  await page.goForward();
  await expect(
    page.getByText("visitor@yasinghasemi.com: /about $"),
  ).toBeVisible();
});

test("recovers from an unknown direct route through the shell", async ({
  page,
}) => {
  await page.goto("/not-a-public-route");
  await expect(
    page.getByText("visitor@yasinghasemi.com: /not-a-public-route $"),
  ).toBeVisible();

  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await input.fill("cd /");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Hello, I'm Yasin Ghasemi." }),
  ).toBeVisible();
});

test("clear preserves recall history and the current route", async ({
  page,
}) => {
  await page.goto("/about");
  const input = page.getByRole("textbox", {
    name: "Website navigation command",
  });
  await input.fill("pwd");
  await input.press("Enter");
  await input.fill("clear");
  await input.press("Enter");

  await expect(
    page.getByRole("region", { name: "Terminal command output" }),
  ).toHaveCount(0);
  await expect(page).toHaveURL(/\/about$/);
  await input.press("ArrowUp");
  await expect(input).toHaveValue("clear");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("pwd");
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

for (const viewport of [
  { width: 320, height: 760 },
  { width: 390, height: 844 },
  { width: 768, height: 420 },
]) {
  test(`keeps the terminal contained at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto(
      "/blog/three-fast-weeks-and-a-first-taste-of-paid-programming",
    );
    const input = page.getByRole("textbox", {
      name: "Website navigation command",
    });
    await input.fill("x".repeat(1024));
    await input.press("Enter");

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const transcript = page.getByRole("region", {
      name: "Terminal command output",
    });
    await expect(transcript).toBeVisible();
    expect((await transcript.boundingBox())?.height).toBeLessThanOrEqual(
      Math.min(224, viewport.height * 0.35) + 1,
    );
  });
}

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

test("visitor endpoint is minimal, uncached, and cookieless by default", async ({
  request,
}) => {
  const response = await request.get("/api/visitor");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ip: null });
  expect(response.headers()["cache-control"]).toBe(
    "private, no-store, max-age=0",
  );
  expect(response.headers()["set-cookie"]).toBeUndefined();
  expect(response.headers()["access-control-allow-origin"]).toBeUndefined();
});

test("privacy policy describes implemented and unverified data handling", async ({
  page,
}) => {
  await page.goto("/privacy");

  await expect(page.getByText(/no user accounts/)).toBeVisible();
  await expect(page.getByText(/only in memory/)).toBeVisible();
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

test("cookie management reflects the storage audit without fake controls", async ({
  page,
}) => {
  await page.goto("/cookies");

  await expect(page.getByText(/does not set cookies/)).toBeVisible();
  await expect(page.getByText(/no optional cookies/)).toBeVisible();
  await expect(
    page.getByText(/hosting chain has not been verified/),
  ).toBeVisible();
  await expect(page.locator("main button, main input, main form")).toHaveCount(
    0,
  );
});

test("hydrates a validated first-party visitor identity without persistence", async ({
  page,
  context,
}) => {
  await page.route("**/api/visitor", (route) =>
    route.fulfill({ json: { ip: "2001:db8::42" } }),
  );
  await page.goto("/");

  await expect(page.getByText(/2001:db8::42@yasinghasemi\.com/)).toBeVisible();
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    })),
  ).toEqual({ local: {}, session: {} });
});

test("keeps the visitor fallback for an invalid endpoint response", async ({
  page,
}) => {
  await page.route("**/api/visitor", (route) =>
    route.fulfill({ json: { ip: "not-an-ip", extra: "not allowed" } }),
  );
  await page.goto("/");

  await expect(page.getByText(/visitor@yasinghasemi\.com/)).toBeVisible();
});
