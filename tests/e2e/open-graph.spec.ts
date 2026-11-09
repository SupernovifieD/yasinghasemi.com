import { expect, test, type Page } from "@playwright/test";

import { projects } from "@/lib/projects";

/** Every URL the site lists in its sitemap, as a path. */
async function sitemapPaths(page: Page) {
  const response = await page.request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  );
}

const meta = (page: Page, selector: string) =>
  page.locator(selector).getAttribute("content");

test("every page in the sitemap has an Open Graph image that exists", async ({
  page,
}) => {
  const paths = await sitemapPaths(page);
  expect(paths.length).toBeGreaterThanOrEqual(21);

  for (const path of paths) {
    await page.goto(path);

    const image = await meta(page, 'meta[property="og:image"]');
    expect(image, path).toMatch(
      /^https:\/\/yasinghasemi\.com\/.+\.(png|webp)$/,
    );
    expect(await meta(page, 'meta[name="twitter:image"]'), path).toBe(image);
    expect(await meta(page, 'meta[name="twitter:card"]'), path).toBe(
      "summary_large_image",
    );
    expect(
      await meta(page, 'meta[property="og:image:alt"]'),
      path,
    ).toBeTruthy();
    expect(
      Number(await meta(page, 'meta[property="og:image:width"]')),
      path,
    ).toBeGreaterThan(0);

    // The tag points at the live origin; fetch the same file from this server.
    const file = await page.request.get(new URL(image!).pathname);
    expect(file.status(), `${path} ${image}`).toBe(200);
    expect(file.headers()["content-type"], path).toMatch(/^image\//);
  }
});

test("pages without their own image share the landing card, 1200 by 630", async ({
  page,
}) => {
  const images = new Set<string>();

  for (const path of [
    "/",
    "/about",
    "/blog",
    "/contact",
    "/projects",
    "/privacy",
    "/terms",
  ]) {
    await page.goto(path);
    images.add((await meta(page, 'meta[property="og:image"]'))!);
    expect(await meta(page, 'meta[property="og:image:width"]'), path).toBe(
      "1200",
    );
    expect(await meta(page, 'meta[property="og:image:height"]'), path).toBe(
      "630",
    );
  }
  expect(images.size).toBe(1);

  // Karmania has no screenshot yet, so it shares it too.
  await page.goto("/projects/karmania");
  expect(await meta(page, 'meta[property="og:image"]')).toBe([...images][0]);
});

test("projects with a website keep their own screenshot as the image", async ({
  page,
}) => {
  await page.goto("/");
  const landing = await meta(page, 'meta[property="og:image"]');

  for (const project of projects.filter(({ url }) => url)) {
    await page.goto(`/projects/${project.slug}`);
    const image = await meta(page, 'meta[property="og:image"]');
    expect(image, project.slug).not.toBe(landing);
    expect(image, project.slug).toContain(project.slug);
    expect(await meta(page, 'meta[property="og:image:alt"]')).toBe(
      `Screenshot of ${project.name}`,
    );
  }
});

test("each blog post has its own card and its excerpt as the description", async ({
  page,
}) => {
  await page.goto("/");
  const landing = await meta(page, 'meta[property="og:image"]');

  await page.goto("/blog");
  const posts = await page.locator("main article").evaluateAll((articles) =>
    articles.map((article) => ({
      href: article.querySelector("h2 a")!.getAttribute("href")!,
      title: article.querySelector("h2 a")!.textContent!,
      excerpt: article.querySelector("p")!.textContent!,
    })),
  );
  expect(posts.length).toBeGreaterThan(0);

  const seen = new Set<string>();
  for (const { href, title, excerpt } of posts) {
    await page.goto(href);
    const image = (await meta(page, 'meta[property="og:image"]'))!;

    expect(image, href).not.toBe(landing);
    expect(image, href).toContain(href.replace("/blog/", ""));
    seen.add(image);
    expect(await meta(page, 'meta[property="og:image:alt"]'), href).toBe(
      `${title}, a post on yasinghasemi.com`,
    );
    expect(await meta(page, 'meta[property="og:image:width"]'), href).toBe(
      "1200",
    );
    expect(await meta(page, 'meta[property="og:description"]'), href).toBe(
      excerpt,
    );
    expect(await meta(page, 'meta[property="og:type"]'), href).toBe("article");
  }
  expect(seen.size).toBe(posts.length);
});
