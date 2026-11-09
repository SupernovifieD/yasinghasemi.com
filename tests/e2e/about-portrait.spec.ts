import { createHash } from "node:crypto";

import { expect, test, type Locator } from "@playwright/test";

const canvasOf = (page: import("@playwright/test").Page) =>
  page.locator("main canvas");

async function hash(locator: Locator) {
  return createHash("md5")
    .update(await locator.screenshot())
    .digest("hex");
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1440, height: 900 },
]) {
  test(`the about portrait sits below the text at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/about");

    const canvas = canvasOf(page);
    await expect(canvas).toHaveAttribute("data-ready", "", { timeout: 20_000 });

    const lastParagraph = (await page.locator("main p").last().boundingBox())!;
    const box = (await canvas.boundingBox())!;
    expect(box.y).toBeGreaterThan(lastParagraph.y + lastParagraph.height);
    expect(Math.abs(box.width - box.height)).toBeLessThan(1);
    expect(box.width).toBeGreaterThan(Math.min(300, viewport.width - 60));
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);

    // Centered in the page, on the same gray glow as the home previews.
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(
      2,
    );
    const glow = canvas.locator("xpath=preceding-sibling::div[1]");
    expect(
      await glow.evaluate((el) => getComputedStyle(el).backgroundImage),
    ).toContain("radial-gradient");

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });
}

test("the about portrait is accessible and drawn with glyphs", async ({
  page,
}) => {
  await page.goto("/about");
  const canvas = canvasOf(page);
  await expect(canvas).toHaveAttribute("data-ready", "", { timeout: 20_000 });

  await expect(
    page.getByRole("img", { name: "ASCII portrait of Yasin Ghasemi" }),
  ).toBeVisible();
  // Not blank: the portrait paints thousands of pixels.
  const lit = await canvas.evaluate((el) => {
    const canvasEl = el as HTMLCanvasElement;
    const { data } = canvasEl
      .getContext("2d")!
      .getImageData(0, 0, canvasEl.width, canvasEl.height);
    let count = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++;
    return count;
  });
  expect(lit).toBeGreaterThan(5_000);
});

test("the about portrait scatters under the pointer and springs back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/about");

  const canvas = canvasOf(page);
  await expect(canvas).toHaveAttribute("data-ready", "", { timeout: 20_000 });
  await page.waitForTimeout(500);

  const box = (await canvas.boundingBox())!;
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
  // The simulation advances in clamped steps, so a loaded browser that renders
  // few frames takes longer in wall-clock time to settle.
  await expect.poll(() => hash(canvas), { timeout: 20_000 }).toBe(rest);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the about portrait is drawn once and ignores the pointer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/about");

    const canvas = canvasOf(page);
    await expect(canvas).toHaveAttribute("data-ready", "", { timeout: 20_000 });
    await page.waitForTimeout(500);

    const rest = await hash(canvas);
    const box = (await canvas.boundingBox())!;
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(box.x + 120 + i * 12, box.y + 220 + i * 5, {
        steps: 2,
      });
    }
    await page.waitForTimeout(300);
    expect(await hash(canvas)).toBe(rest);
  });
});
