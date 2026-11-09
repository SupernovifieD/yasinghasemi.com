import { expect, test, type Page } from "@playwright/test";

import { projectsInCategory, projects } from "@/lib/projects";
import { getTech } from "@/lib/tech";

const SOFTWARE = "Software & Apps";
const WEB = "Web Development";

const toggle = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const projectLink = (page: Page, name: string) =>
  page.getByRole("link", { name: `/${name}` });
const shotPanel = (page: Page) =>
  page.locator('[aria-hidden="true"][class*="shotPanel"]');

/** Open a category and wait for its list to finish growing. */
async function open(page: Page, name: string) {
  await toggle(page, name).click();
  await expect(toggle(page, name)).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name })).toBeVisible();
  await page.waitForTimeout(450);
}

async function hover(page: Page, name: string) {
  const box = (await projectLink(page, name).boundingBox())!;
  await page.mouse.move(box.x + 24, box.y + box.height / 2, { steps: 5 });
}

test.describe("projects page", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("has a centered title and a one-line subtitle", async ({ page }) => {
    await page.goto("/projects");

    const heading = page.getByRole("heading", { level: 1, name: "/projects" });
    await expect(heading).toBeVisible();
    const box = (await heading.boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(2);
    await expect(
      page.getByText(/software and web development/i).first(),
    ).toBeVisible();
  });

  test("shows two category toggles side by side with icon and name only", async ({
    page,
  }) => {
    await page.goto("/projects");

    const [software, web] = [toggle(page, SOFTWARE), toggle(page, WEB)];
    const [a, b] = [
      (await software.boundingBox())!,
      (await web.boundingBox())!,
    ];
    expect(a.x).toBeLessThan(b.x);
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);

    for (const button of [software, web]) {
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(button).toHaveAttribute("aria-controls", /.+/);
      // Same size as the home contact icons: 4.4rem.
      const icon = button.locator("svg").first();
      const size = (await icon.boundingBox())!;
      expect(Math.abs(size.width - 70.4)).toBeLessThan(1.5);
      expect(Math.abs(size.height - 70.4)).toBeLessThan(1.5);
    }
    await expect(software).toHaveText(SOFTWARE);
    await expect(web).toHaveText(WEB);
  });

  test("lists the projects in order when a category opens", async ({
    page,
  }) => {
    await page.goto("/projects");

    await expect(page.getByRole("link", { name: /^\/BluLexi/ })).toHaveCount(0);

    await open(page, SOFTWARE);
    await expect(
      page.getByRole("region", { name: SOFTWARE }).getByRole("link"),
    ).toHaveText(
      projectsInCategory("software").map(({ name }) => new RegExp(`^/${name}`)),
    );

    await open(page, WEB);
    await expect(
      page.getByRole("region", { name: WEB }).getByRole("link"),
    ).toHaveText(
      projectsInCategory("web").map(({ name }) => new RegExp(`^/${name}`)),
    );
  });

  test("clicking the open category collapses it; the other one switches", async ({
    page,
  }) => {
    await page.goto("/projects");
    const [software, web] = [toggle(page, SOFTWARE), toggle(page, WEB)];

    await software.click();
    await expect(software).toHaveAttribute("aria-expanded", "true");
    await expect(web).toHaveAttribute("aria-expanded", "false");

    await web.click();
    await expect(software).toHaveAttribute("aria-expanded", "false");
    await expect(web).toHaveAttribute("aria-expanded", "true");

    await web.click();
    await expect(web).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("main a:visible")).toHaveCount(0);
  });

  test("toggles work with the keyboard and keep closed lists out of reach", async ({
    page,
    browserName,
  }) => {
    // WebKit only tabs to buttons with Option held.
    const tab = () =>
      page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await page.goto("/projects");
    const software = toggle(page, SOFTWARE);

    await software.focus();
    await page.keyboard.press("Enter");
    await expect(software).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(software).toHaveAttribute("aria-expanded", "false");

    // While closed, Tab skips the (inert) list and goes to the next toggle.
    await tab();
    await expect(toggle(page, WEB)).toBeFocused();

    // Open again: the project links are now tab stops.
    await software.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(450);
    await tab();
    await tab();
    await expect(page.getByRole("link", { name: /^\/BluLexi/ })).toBeFocused();
  });

  test("a category grows smoothly instead of jumping", async ({ page }) => {
    await page.goto("/projects");

    const heights = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const panel = document.querySelector<HTMLElement>("[role='region']")!;
          const button = document.querySelector<HTMLElement>(
            "button[aria-expanded]",
          )!;
          const samples: number[] = [];
          button.click();
          const start = performance.now();
          const tick = () => {
            samples.push(Math.round(panel.getBoundingClientRect().height));
            if (performance.now() - start < 600) requestAnimationFrame(tick);
            else resolve(samples);
          };
          requestAnimationFrame(tick);
        }),
    );

    const final = heights.at(-1)!;
    expect(final).toBeGreaterThan(150);
    expect(heights[0]).toBeLessThan(final / 2);
    // Several in-between heights (not a jump), never decreasing. The count of
    // frames depends on machine load, so only require a few of them.
    const between = heights.filter((h) => h > heights[0] && h < final);
    expect(new Set(between).size).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i]).toBeGreaterThanOrEqual(heights[i - 1] - 1);
    }
  });

  test("hovering a project opens its description and slides the rest down", async ({
    page,
  }) => {
    await page.goto("/projects");
    await open(page, SOFTWARE);

    const tops = () =>
      page
        .getByRole("region", { name: SOFTWARE })
        .locator("li")
        .evaluateAll((items) =>
          items.map((item) => Math.round(item.getBoundingClientRect().top)),
        );
    const rest = await tops();

    const project = projects.find(({ slug }) => slug === "earthcatalogue")!;
    await hover(page, project.name);
    await expect(
      page.getByText(project.tagline, { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(450);

    const hovered = await tops();
    // The hovered item and those above stay put; everything below moves down by
    // the same amount.
    expect(hovered[0]).toBe(rest[0]);
    expect(hovered[1]).toBe(rest[1]);
    const shift = hovered[2] - rest[2];
    expect(shift).toBeGreaterThan(15);
    for (let i = 2; i < rest.length; i++) {
      expect(hovered[i] - rest[i]).toBe(shift);
    }

    // Only one description is open at a time.
    const others = projectsInCategory("software").filter(
      ({ slug }) => slug !== "earthcatalogue",
    );
    for (const other of others) {
      await expect(page.getByText(other.tagline, { exact: true })).toBeHidden();
    }

    // Leaving slides everything back.
    await page.mouse.move(40, 40, { steps: 4 });
    await expect(page.getByText(project.tagline, { exact: true })).toBeHidden();
    await page.waitForTimeout(450);
    expect(await tops()).toEqual(rest);
  });

  test("hover shows the project's screenshot in the shared size and ratio", async ({
    page,
  }) => {
    await page.goto("/projects");
    await open(page, SOFTWARE);

    await hover(page, "BluLexi");
    const panel = shotPanel(page);
    await expect(panel.locator("> div[data-active]")).toHaveCount(1);
    await expect(panel.locator("> div[data-active] img")).toBeVisible();

    const size = (await panel.boundingBox())!;
    expect(Math.abs(size.width - 184)).toBeLessThan(1); // --shot-width: 11.5rem
    expect(Math.abs(size.width / size.height - 16 / 9)).toBeLessThan(0.02);

    // It sits to the right of the list, clear of it.
    const list = (await projectLink(page, "BluLexi").boundingBox())!;
    expect(size.x).toBeGreaterThan(list.x + 300);

    await hover(page, "Naar");
    await expect(panel.locator("> div[data-active]")).toHaveCount(1);
    await expect(panel.locator("> div[data-active] img")).toHaveAttribute(
      "src",
      /naar/,
    );

    await page.mouse.move(40, 40, { steps: 4 });
    await expect(panel.locator("> div[data-active]")).toHaveCount(0);
  });

  test("Karmania shows a WIP badge and a work-in-progress panel", async ({
    page,
  }) => {
    await page.goto("/projects");
    await open(page, SOFTWARE);

    const link = projectLink(page, "Karmania Map Viewer");
    await expect(link.getByText("WIP", { exact: true })).toBeVisible();
    await expect(link).toHaveAccessibleName(/work in progress/i);

    await hover(page, "Karmania Map Viewer");
    const panel = shotPanel(page);
    const active = panel.locator("> div[data-active]");
    await expect(active).toContainText("Work in progress");
    await expect(active).toContainText("Launching late November 2026");
    await expect(active.locator("img")).toHaveCount(0);
  });

  test("hovering a project does not toggle anything on keyboard focus loss", async ({
    page,
  }) => {
    await page.goto("/projects");
    await open(page, WEB);

    // Keyboard focus opens the description just like hover.
    await projectLink(page, "maham-iot.ir").focus();
    const tagline = projects.find(({ slug }) => slug === "maham-iot")!.tagline;
    await expect(page.getByText(tagline, { exact: true })).toBeVisible();
  });

  test("clicking a project opens its page", async ({ page }) => {
    await page.goto("/projects");
    await open(page, SOFTWARE);

    await projectLink(page, "Naar").click();
    await expect(page).toHaveURL(/\/projects\/naar$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Naar" }),
    ).toBeVisible();
  });

  test("the main navigation marks /projects as current on project pages", async ({
    page,
  }) => {
    await page.goto("/projects/blulexi");

    await expect(
      page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "/projects", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test.describe("projects page on a phone", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("shows every description inline, no screenshot, and navigates on tap", async ({
    page,
  }) => {
    await page.goto("/projects");
    await toggle(page, SOFTWARE).tap();
    await expect(page.getByRole("region", { name: SOFTWARE })).toBeVisible();
    await page.waitForTimeout(450);

    for (const { tagline } of projectsInCategory("software")) {
      await expect(page.getByText(tagline, { exact: true })).toBeVisible();
    }
    await expect(shotPanel(page)).toBeHidden();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);

    await projectLink(page, "MinexPy").tap();
    await expect(page).toHaveURL(/\/projects\/minexpy$/);
  });
});

test.describe("projects page on the narrowest phone", () => {
  // A context of its own: Firefox hangs when a mobile context is resized.
  test.use({
    viewport: { width: 320, height: 700 },
    hasTouch: true,
    isMobile: true,
  });

  test("the toggles stay side by side at 320px without overflow", async ({
    page,
  }) => {
    await page.goto("/projects");
    await toggle(page, SOFTWARE).tap();
    await toggle(page, WEB).tap();
    await page.waitForTimeout(450);

    const [a, b] = [
      (await toggle(page, SOFTWARE).boundingBox())!,
      (await toggle(page, WEB).boundingBox())!,
    ];
    expect(a.x).toBeLessThan(b.x);
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });

  test("the icons do not drift and nothing animates open or closed", async ({
    page,
  }) => {
    await page.goto("/projects");

    const icon = toggle(page, SOFTWARE).locator("svg").first();
    expect(
      await icon.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");

    await toggle(page, SOFTWARE).click();
    const panel = page.getByRole("region", { name: SOFTWARE });
    expect(
      await panel.evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe("0s");
    await expect(panel).toBeVisible();
    const full = (await panel.boundingBox())!.height;
    expect(full).toBeGreaterThan(150);
  });
});

test.describe("project pages", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const project of projects) {
    test(`/projects/${project.slug} has its content, tech row and metadata`, async ({
      page,
    }) => {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status()).toBe(200);

      await expect(
        page.getByRole("heading", { level: 1, name: project.name }),
      ).toBeVisible();
      await expect(page).toHaveTitle(`${project.name} | Yasin Ghasemi`);

      // Same back link as the blog posts.
      await expect(
        page.getByRole("link", { name: "← Back to /projects" }),
      ).toHaveAttribute("href", "/projects");

      // Technology row: every technology, a logo for each that has one.
      const row = page.getByRole("list", { name: "Technologies" });
      await expect(row.getByRole("listitem")).toHaveText(
        project.tech.map((id) => getTech(id).label),
      );
      const logos = project.tech.filter((id) => getTech(id).icon).length;
      await expect(row.locator("svg")).toHaveCount(logos);

      // Sections come from the data, with headings.
      for (const { heading, paragraphs } of project.sections) {
        await expect(
          page.getByRole("heading", { level: 2, name: heading }),
        ).toBeVisible();
        await expect(
          page.getByText(paragraphs[0], { exact: true }),
        ).toBeVisible();
      }

      // Links open the live site, documentation, package, or source.
      const hrefs = [
        ...(project.url ? [project.url] : []),
        ...project.links.map(({ href }) => href),
      ];
      for (const href of hrefs) {
        await expect(page.locator(`main a[href="${href}"]`)).toHaveAttribute(
          "rel",
          /noopener/,
        );
      }

      if (project.status) {
        await expect(page.getByRole("note")).toContainText("Work in progress");
        await expect(page.getByRole("note")).toContainText(project.status.note);
      } else {
        await expect(page.getByRole("note")).toHaveCount(0);
      }

      // Metadata: description, Open Graph, canonical.
      const meta = (selector: string) =>
        page.locator(selector).getAttribute("content");
      expect(await meta('meta[name="description"]')).toBe(project.summary);
      expect(await meta('meta[property="og:title"]')).toBe(project.name);
      expect(await meta('meta[property="og:description"]')).toBe(
        project.summary,
      );
      expect(await meta('meta[property="og:url"]')).toBe(
        `https://yasinghasemi.com/projects/${project.slug}`,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://yasinghasemi.com/projects/${project.slug}`,
      );
    });
  }

  test("logos are readable on the black page, not just brand colors", async ({
    page,
  }) => {
    await page.goto("/projects/blulexi");

    const colors = await page
      .getByRole("list", { name: "Technologies" })
      .locator("svg")
      .evaluateAll((icons) =>
        icons.map((icon) => getComputedStyle(icon).color),
      );
    // Next.js is black in its brand, so it is white here; Django is its light green.
    expect(colors).toContain("rgb(255, 255, 255)");
    expect(colors).toContain("rgb(68, 183, 139)");
    expect(colors).not.toContain("rgb(0, 0, 0)");
  });

  test("an unknown project is not found", async ({ page }) => {
    const response = await page.goto("/projects/not-a-project");
    expect(response?.status()).toBe(404);
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`project pages do not overflow horizontally at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const { slug } of projects) {
        await page.goto(`/projects/${slug}`);
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          `${slug} at ${width}px`,
        ).toBe(true);
      }
    });
  }
});
