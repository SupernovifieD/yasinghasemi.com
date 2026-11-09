/**
 * Render the Open Graph (social sharing) cards.
 *
 *   pnpm exec tsx scripts/generate-og-images.ts default
 *     assets/og/default.png: the landing card, shared by every page that has no
 *     image of its own.
 *
 * Each card is an HTML page drawn by headless Chromium with the site's own
 * JetBrains Mono (the woff2 files in app/fonts, embedded), so the type is exact
 * and long text wraps and clips by itself. The glow is the site's
 * `--glow-gradient`, read from app/globals.css. The output is committed;
 * nothing here runs in CI or at build time.
 */
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT_DIR = resolve(process.cwd(), "assets/og");
const FONTS = [
  { weight: 400, file: "app/fonts/JetBrainsMono-Regular.woff2" },
  { weight: 700, file: "app/fonts/JetBrainsMono-Bold.woff2" },
] as const;

const OWNER = "Yasin Ghasemi";
const SITE = "yasinghasemi.com";
const TAGLINE = "Software and web development.";

async function readGlow() {
  const css = await readFile(resolve(process.cwd(), "app/globals.css"), "utf8");
  const match = css.match(/--glow-gradient:\s*(radial-gradient\([^;]+\));/);
  if (!match) throw new Error("--glow-gradient not found in app/globals.css");
  return match[1];
}

async function fontFaces() {
  const faces = await Promise.all(
    FONTS.map(async ({ weight, file }) => {
      const data = await readFile(resolve(process.cwd(), file));
      return `@font-face {
        font-family: "JetBrains Mono";
        font-weight: ${weight};
        src: url(data:font/woff2;base64,${data.toString("base64")}) format("woff2");
      }`;
    }),
  );
  return faces.join("\n");
}

/** The page every card shares: black, the site's gray glow, one font. */
async function page(body: string, extraCss = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${await fontFaces()}
    * { box-sizing: border-box; }
    html, body { width: ${WIDTH}px; height: ${HEIGHT}px; margin: 0; }
    body {
      position: relative;
      overflow: hidden;
      background: #000;
      color: #f5f5f5;
      font-family: "JetBrains Mono", monospace;
    }
    .glow {
      position: absolute;
      right: -150px;
      top: -110px;
      width: 860px;
      height: 860px;
      background: ${await readGlow()};
    }
    .content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 76px 88px;
    }
    .site { color: #a3a3a3; font-size: 30px; line-height: 1; }
    ${extraCss}
  </style></head><body><div class="glow"></div><div class="content">${body}</div></body></html>`;
}

async function defaultCard() {
  return page(
    `<div class="site">${SITE}</div>
     <div>
       <div class="name">${OWNER}</div>
       <div class="tagline">${TAGLINE}</div>
     </div>
     <div class="site">&nbsp;</div>`,
    `.name { font-size: 104px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; }
     .tagline { margin-top: 24px; color: #d4d4d4; font-size: 38px; line-height: 1.3; }`,
  );
}

async function render(html: string, output: string) {
  const browser = await chromium.launch();

  try {
    const tab = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
    });
    await tab.setContent(html);
    await tab.evaluate(() => document.fonts.ready);
    // A silent fallback to another monospace font would still render, so check.
    const loaded = await tab.evaluate(
      () =>
        document.fonts.check('400 20px "JetBrains Mono"') &&
        document.fonts.check('700 20px "JetBrains Mono"'),
    );
    if (!loaded) throw new Error("JetBrains Mono did not load");

    const png = await tab.screenshot({ type: "png" });
    await mkdir(resolve(output, ".."), { recursive: true });
    const info = await sharp(png)
      .png({ palette: true, compressionLevel: 9, effort: 10 })
      .toFile(output);
    console.log(`${output} ${info.width}x${info.height} ${info.size} bytes`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const [mode] = process.argv.slice(2);

  if (mode === "default") {
    return render(await defaultCard(), resolve(OUTPUT_DIR, "default.png"));
  }
  throw new Error("Usage: generate-og-images.ts default");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
