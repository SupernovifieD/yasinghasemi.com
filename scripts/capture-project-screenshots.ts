/**
 * Produce the small project screenshots used by the home /projects preview.
 *
 *   pnpm exec tsx scripts/capture-project-screenshots.ts url <slug> <url> [button]
 *     Screenshot a live site with headless Chromium, then optimize it. `button`
 *     is the accessible name of a consent/overlay button to click first (the
 *     browser is throwaway, so nothing persists).
 *   pnpm exec tsx scripts/capture-project-screenshots.ts file <slug> <image>
 *     Optimize an image captured elsewhere (e.g. on a host that can reach a
 *     site this machine cannot).
 *
 * Output: assets/projects/<slug>.webp, cropped to the aspect ratio declared by
 * `--shot-aspect` in the preview stylesheet and resized for a small tile.
 */
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const ASPECT_SOURCE = resolve(
  process.cwd(),
  "components/home/previews/projects-preview.module.css",
);
const OUTPUT_DIR = resolve(process.cwd(), "assets/projects");
const CAPTURE_WIDTH = 1280;
const OUTPUT_WIDTH = 480;
const WEBP_QUALITY = 78;

async function readAspect() {
  const css = await readFile(ASPECT_SOURCE, "utf8");
  const match = css.match(/--shot-aspect:\s*(\d+)\s*\/\s*(\d+)/);
  if (!match) throw new Error(`--shot-aspect not found in ${ASPECT_SOURCE}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

async function optimize(input: Buffer | string, slug: string) {
  const aspect = await readAspect();
  const height = Math.round((OUTPUT_WIDTH * aspect.height) / aspect.width);
  const outputPath = resolve(OUTPUT_DIR, `${slug}.webp`);

  await mkdir(OUTPUT_DIR, { recursive: true });
  const info = await sharp(input)
    .resize({
      width: OUTPUT_WIDTH,
      height,
      fit: "cover",
      position: "top",
    })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outputPath);

  console.log(`${outputPath} ${info.width}x${info.height} ${info.size} bytes`);
}

async function capture(slug: string, url: string, dismissButton?: string) {
  const aspect = await readAspect();
  const viewport = {
    width: CAPTURE_WIDTH,
    height: Math.round((CAPTURE_WIDTH * aspect.height) / aspect.width),
  };
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    if (dismissButton) {
      await page.getByRole("button", { name: dismissButton }).click();
    }
    await page.waitForTimeout(1500);
    await optimize(await page.screenshot({ type: "png" }), slug);
  } finally {
    await browser.close();
  }
}

async function main() {
  const [mode, slug, source, dismissButton] = process.argv.slice(2);

  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !source) {
    throw new Error("Usage: <url|file> <slug> <url-or-image-path> [button]");
  }
  if (mode === "url") return capture(slug, source, dismissButton);
  if (mode === "file") return optimize(resolve(source), slug);
  throw new Error(`Unknown mode: ${mode}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
