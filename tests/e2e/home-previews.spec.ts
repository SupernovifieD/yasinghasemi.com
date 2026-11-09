import { createHash } from "node:crypto";

import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const PREVIEWS = ["projects", "blog", "about", "contact"] as const;

const homeLink = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link", { name, exact: true });

const layer = (page: Page, id: string) =>
  page.locator(`[data-preview="${id}"]`);

const glow = (page: Page) => page.locator("[data-armed]");

/**
 * Hover a home link and wait for its preview to activate. The first hover can
 * land before React has hydrated (the handlers are not attached yet and
 * `pointerenter` fires only once), so leave and re-enter until it takes.
 */
async function hoverLink(page: Page, name: string) {
  const id = name.slice(1);

  await expect(async () => {
    await page.mouse.move(2, 2);
    await homeLink(page, name).hover();
    await expect(layer(page, id)).toHaveAttribute("data-active", "", {
      timeout: 1500,
    });
  }).toPass({ timeout: 20_000 });
}

async function hash(locator: Locator) {
  return createHash("md5")
    .update(await locator.screenshot())
    .digest("hex");
}

test("shows nothing until a link is hovered", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-preview]")).toHaveCount(0);
  await expect(glow(page)).toHaveCount(0);
});

test("each link shows its own preview inside one same-size glow", async ({
  page,
}) => {
  await page.goto("/");

  const sizes: { width: number; height: number }[] = [];
  for (const id of PREVIEWS) {
    await hoverLink(page, `/${id}`);
    await expect(layer(page, id)).toHaveAttribute("data-active", "");
    await expect(glow(page)).toHaveCount(1);
    await page.waitForTimeout(100);

    const box = (await glow(page).boundingBox())!;
    sizes.push({ width: box.width, height: box.height });
  }

  for (const size of sizes) {
    expect(Math.abs(size.width - sizes[0].width)).toBeLessThan(1);
    expect(Math.abs(size.height - sizes[0].height)).toBeLessThan(1);
  }
});

test("the preview and glow stay after the pointer leaves", async ({ page }) => {
  await page.goto("/");

  await hoverLink(page, "/projects");
  await expect(layer(page, "projects")).toHaveAttribute("data-active", "");

  await page.mouse.move(700, 40);
  await page.waitForTimeout(600);

  await expect(layer(page, "projects")).toHaveAttribute("data-active", "");
  await expect(glow(page)).toHaveCount(1);
  // The 700ms fade-in may still be finishing; it must settle fully on.
  await expect
    .poll(() => glow(page).evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
});

test("only hovering another link changes the preview", async ({ page }) => {
  await page.goto("/");

  await hoverLink(page, "/projects");
  await hoverLink(page, "/blog");

  await expect(layer(page, "blog")).toHaveAttribute("data-active", "");
  await expect(layer(page, "projects")).not.toHaveAttribute("data-active");
});

test("keyboard focus shows the preview too", async ({ page }) => {
  await page.goto("/");

  await homeLink(page, "/about").focus();

  await expect(layer(page, "about")).toHaveAttribute("data-active", "");
});

test("the projects preview loops two opposing, faded bands", async ({
  page,
}) => {
  await page.goto("/");
  await hoverLink(page, "/projects");

  const tracks = layer(page, "projects").locator("[data-direction]");
  await expect(tracks).toHaveCount(2);
  await expect(tracks.nth(0)).toHaveAttribute("data-direction", "up");
  await expect(tracks.nth(1)).toHaveAttribute("data-direction", "down");

  const styles = await tracks.evaluateAll((elements) =>
    elements.map((element) => {
      const track = getComputedStyle(element);
      const band = getComputedStyle(element.parentElement as Element);
      return {
        name: track.animationName,
        direction: track.animationDirection,
        iteration: track.animationIterationCount,
        mask: band.maskImage || band.getPropertyValue("-webkit-mask-image"),
      };
    }),
  );
  expect(styles[0].direction).toBe("normal");
  expect(styles[1].direction).toBe("reverse");
  for (const style of styles) {
    expect(style.name).not.toBe("none");
    expect(style.iteration).toBe("infinite");
    expect(style.mask).toContain("linear-gradient");
  }
});

test("screenshots share one aspect ratio defined by a single CSS variable", async ({
  page,
}) => {
  await page.goto("/");
  await hoverLink(page, "/projects");

  const bands = layer(page, "projects").locator("> div");
  expect(
    await bands.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--shot-aspect").trim(),
    ),
  ).toBe("16 / 9");

  for (const tile of await layer(page, "projects").locator("img").all()) {
    const box = (await tile.boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
  }
});

test("the blog preview picks one post, keeps it, and links to it", async ({
  page,
}) => {
  await page.goto("/");
  await hoverLink(page, "/blog");

  const link = layer(page, "blog").getByRole("link");
  await expect(link).toHaveAttribute("href", /^\/blog\/[a-z0-9-]+$/);
  const title = await link.getByRole("heading", { level: 2 }).innerText();
  const href = await link.getAttribute("href");

  // Moving away and back never re-rolls the pick.
  await hoverLink(page, "/about");
  await hoverLink(page, "/blog");
  await page.mouse.move(700, 40);
  await expect(link.getByRole("heading", { level: 2 })).toHaveText(title);

  // The excerpt is a short plain-text opening that fades out.
  const excerpt = link.locator("p");
  expect((await excerpt.innerText()).length).toBeGreaterThan(20);
  expect((await excerpt.innerText()).length).toBeLessThanOrEqual(241);
  expect(
    await excerpt.evaluate(
      (el) =>
        getComputedStyle(el).maskImage ||
        getComputedStyle(el).getPropertyValue("-webkit-mask-image"),
    ),
  ).toContain("linear-gradient");

  // Clicking opens that post's own page.
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: title }),
  ).toBeVisible();
});

test("the blog pick follows Math.random, evaluated at hover time", async ({
  page,
}) => {
  const hrefs: string[] = [];

  for (const value of [0, 0.999]) {
    await page.addInitScript((random) => {
      Math.random = () => random;
    }, value);
    await page.goto("/");
    await hoverLink(page, "/blog");
    hrefs.push(
      (await layer(page, "blog").getByRole("link").getAttribute("href")) ?? "",
    );
  }

  // Lowest and highest draws land on different posts, so the choice is made in
  // the browser rather than frozen into the static HTML at build time.
  expect(hrefs[0]).toMatch(/^\/blog\/[a-z0-9-]+$/);
  expect(hrefs[1]).toMatch(/^\/blog\/[a-z0-9-]+$/);
  expect(hrefs[0]).not.toBe(hrefs[1]);
});

test("the about preview draws a portrait that scatters and springs back", async ({
  page,
}) => {
  await page.goto("/");
  await hoverLink(page, "/about");

  const canvas = layer(page, "about").locator("canvas");
  await expect(canvas).toHaveAttribute("data-ready", "");
  await page.waitForTimeout(500);

  const box = (await canvas.boundingBox())!;
  expect(box.width).toBeGreaterThan(200);

  const rest = await hash(canvas);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height * 0.45;
  await page.mouse.move(cx - 100, cy - 30);
  for (let i = 0; i < 30; i++) {
    const angle = i * 0.5;
    await page.mouse.move(
      cx + Math.cos(angle) * 80,
      cy + Math.sin(angle * 1.3) * 60,
      { steps: 2 },
    );
  }
  expect(await hash(canvas)).not.toBe(rest);

  await page.mouse.move(20, 20, { steps: 4 });
  // The simulation advances in clamped steps, so a heavily loaded browser that
  // renders few frames takes longer in wall-clock time to settle.
  await expect.poll(() => hash(canvas), { timeout: 20_000 }).toBe(rest);
});

test("the contact preview links each logo to the right place", async ({
  page,
}) => {
  await page.goto("/");
  await hoverLink(page, "/contact");

  // The preview is a lazily fetched chunk, so allow for slow loads under load.
  const links = layer(page, "contact").getByRole("link");
  await expect(links).toHaveCount(3, { timeout: 20_000 });

  await expect(layer(page, "contact").getByLabel("GitHub")).toHaveAttribute(
    "href",
    "https://github.com/SupernovifieD",
  );
  await expect(layer(page, "contact").getByLabel("LinkedIn")).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/yasinghasemi/",
  );
  await expect(
    layer(page, "contact").getByLabel("Email y@yasinghasemi.com"),
  ).toHaveAttribute("href", "mailto:y@yasinghasemi.com");
});

test("the contact logos stay visible and moving while contact is active", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "headless Firefox and WebKit may lack WebGL; they use the flat fallback",
  );
  test.setTimeout(90_000);
  await page.goto("/");
  await hoverLink(page, "/contact");

  const canvas = layer(page, "contact").locator("canvas");
  // Software-rendered WebGL is slow, so wait on the scene state, not on a
  // fade whose frames may be delayed.
  await expect(layer(page, "contact").locator("[data-mode]")).toHaveAttribute(
    "data-mode",
    "webgl",
    { timeout: 20_000 },
  );

  const first = await hash(canvas);
  await page.waitForTimeout(1500);
  await page.mouse.move(700, 40);
  await page.waitForTimeout(1500);
  expect(await hash(canvas)).not.toBe(first);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the projects bands do not scroll", async ({ page }) => {
    await page.goto("/");
    await hoverLink(page, "/projects");

    const tracks = layer(page, "projects").locator("[data-direction]");
    // The preview is a lazy chunk: wait for it to mount before reading styles.
    await expect(tracks).toHaveCount(2);

    const names = await tracks.evaluateAll((elements) =>
      elements.map((track) => getComputedStyle(track).animationName),
    );
    expect(names).toEqual(["none", "none"]);
  });

  test("the portrait is drawn once and ignores the pointer", async ({
    page,
  }) => {
    await page.goto("/");
    await hoverLink(page, "/about");

    const canvas = layer(page, "about").locator("canvas");
    await expect(canvas).toHaveAttribute("data-ready", "");
    await page.waitForTimeout(500);

    const rest = await hash(canvas);
    const box = (await canvas.boundingBox())!;
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(box.x + 100 + i * 12, box.y + 200 + i * 5, {
        steps: 2,
      });
    }
    await page.waitForTimeout(300);
    expect(await hash(canvas)).toBe(rest);
  });

  test("the glow and layers appear without fading", async ({ page }) => {
    await page.goto("/");
    await hoverLink(page, "/blog");

    expect(
      await glow(page).evaluate(
        (el) => getComputedStyle(el).transitionDuration,
      ),
    ).toBe("0s");
  });
});
