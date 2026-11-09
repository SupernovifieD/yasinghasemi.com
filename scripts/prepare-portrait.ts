/**
 * Preprocess the profile photo for the home /about ASCII portrait.
 *
 *   pnpm exec tsx scripts/prepare-portrait.ts <source-photo>
 *
 * Output: assets/portrait/portrait.webp, a small grayscale image where the
 * light backdrop has been suppressed to black (the site is black, so the
 * subject should emerge from it), contrast and edges are enhanced, and the
 * shirt fades out toward the bottom. The component samples this image to
 * decide which glyph and tone each ASCII cell gets.
 *
 * The original photo is not stored in the repository.
 */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import sharp, { type Sharp } from "sharp";

const OUTPUT = resolve(process.cwd(), "assets/portrait/portrait.webp");
const SIZE = 640;

// Square crop of the source, as fractions of its width: tight on the head, so
// the face gets as many ASCII cells as possible.
const CROP = { left: 0.17, top: 0.09, size: 0.62 };

// The backdrop is a very smooth, bright gradient (about 225-245, +/-1 between
// neighbours). It is flood-filled from the top and upper side edges: a pixel
// joins it only if it is at least this bright and within this step of its
// neighbour. Skin is darker and hair, ears, and the shirt edge step more.
const BACKDROP_MIN = 220;
const BACKDROP_STEP = 2;
// Never flood below this fraction of the height: past the shoulders the shirt
// is as bright as the backdrop and is handled by the fades below instead.
const BACKDROP_MAX_Y = 1;
const BACKDROP_FEATHER_SIGMA = 2.2;
// Sharpening leaves a bright halo just outside the hair that the strict flood
// misses. Grow the backdrop a few pixels, but only through bright pixels.
const BACKDROP_GROW_STEPS = 4;
const BACKDROP_GROW_MIN = 190;

// Tonal stretch of the enhanced subject so skin sits mid-gray, not dim.
const LEVELS = { black: 20, white: 225, gamma: 1 };

// Vertical fade of the shirt: fully visible above FADE_START, black at the end.
const FADE_START = 0.6;
const FADE_END = 0.84;

// Soft oval around the face; everything outside it fades to black.
const OVAL = { cx: 0.5, cy: 0.42, rx: 0.5, ry: 0.72 };

/** Raw 8-bit pixels of one channel, asserting the buffer really is SIZE². */
async function singleChannel(image: Sharp) {
  const buffer = await image.extractChannel(0).raw().toBuffer();
  if (buffer.length !== SIZE * SIZE) {
    throw new Error(`Expected ${SIZE * SIZE} pixels, got ${buffer.length}`);
  }
  return new Uint8Array(buffer);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Mark pixels reachable from the top and upper side edges via smooth steps. */
function findBackdrop(gray: Uint8Array, size: number) {
  const backdrop = new Uint8Array(size * size);
  const stack: number[] = [];
  const seed = (x: number, y: number) => {
    const index = y * size + x;
    if (!backdrop[index]) {
      backdrop[index] = 1;
      stack.push(index);
    }
  };

  const maxY = Math.floor(size * BACKDROP_MAX_Y);
  for (let x = 0; x < size; x++) seed(x, 0);
  for (let y = 0; y < size * 0.5; y++) {
    seed(0, Math.floor(y));
    seed(size - 1, Math.floor(y));
  }

  while (stack.length) {
    const index = stack.pop() as number;
    const x = index % size;
    const y = (index - x) / size;
    const value = gray[index];

    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= size || ny > maxY) continue;
      const next = ny * size + nx;
      if (
        !backdrop[next] &&
        gray[next] >= BACKDROP_MIN &&
        Math.abs(gray[next] - value) <= BACKDROP_STEP
      ) {
        backdrop[next] = 1;
        stack.push(next);
      }
    }
  }

  return backdrop;
}

function growBackdrop(backdrop: Uint8Array, gray: Uint8Array, size: number) {
  for (let step = 0; step < BACKDROP_GROW_STEPS; step++) {
    const additions: number[] = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = y * size + x;
        if (backdrop[index] || gray[index] < BACKDROP_GROW_MIN) continue;

        const touches =
          (x > 0 && backdrop[index - 1]) ||
          (x < size - 1 && backdrop[index + 1]) ||
          (y > 0 && backdrop[index - size]) ||
          (y < size - 1 && backdrop[index + size]);
        if (touches) additions.push(index);
      }
    }
    for (const index of additions) backdrop[index] = 1;
  }
}

async function main() {
  const source = process.argv[2];
  if (!source) throw new Error("Usage: prepare-portrait.ts <source-photo>");

  const meta = await sharp(source).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error("Unreadable source image");

  const cropSize = Math.round(CROP.size * width);
  const base = sharp(source)
    .extract({
      left: Math.round(CROP.left * width),
      top: Math.round(CROP.top * height),
      width: cropSize,
      height: cropSize,
    })
    .resize(SIZE, SIZE)
    .greyscale();

  const gray = await singleChannel(base.clone());

  // Backdrop mask, feathered so edges stay soft.
  const mask = new Uint8Array(SIZE * SIZE);
  const backdrop = findBackdrop(gray, SIZE);
  growBackdrop(backdrop, gray, SIZE);
  for (let i = 0; i < mask.length; i++) mask[i] = backdrop[i] ? 255 : 0;
  const softMask = await singleChannel(
    sharp(Buffer.from(mask), {
      raw: { width: SIZE, height: SIZE, channels: 1 },
    }).blur(BACKDROP_FEATHER_SIGMA),
  );

  // Local contrast, then a unsharp pass for crisp edges (eyes, mouth, hair).
  const enhanced = await singleChannel(
    base
      .clone()
      .blur(0.7)
      .clahe({ width: 16, height: 16, maxSlope: 2 })
      .sharpen({ sigma: 1.4, m1: 0.8, m2: 2 })
      .gamma(1.15),
  );

  const output = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    const vertical = 1 - smoothstep(FADE_START, FADE_END, y / SIZE);

    for (let x = 0; x < SIZE; x++) {
      const index = y * SIZE + x;
      const nx = (x / SIZE - OVAL.cx) / OVAL.rx;
      const ny = (y / SIZE - OVAL.cy) / OVAL.ry;
      const oval = 1 - smoothstep(0.4, 1, Math.hypot(nx, ny));
      const subject = 1 - softMask[index] / 255;
      const stretched = Math.min(
        1,
        Math.max(
          0,
          (enhanced[index] - LEVELS.black) / (LEVELS.white - LEVELS.black),
        ),
      );
      const tone = stretched ** LEVELS.gamma;

      output[index] = Math.round(255 * tone * subject * vertical * oval);
    }
  }

  await mkdir(resolve(OUTPUT, ".."), { recursive: true });
  const info = await sharp(Buffer.from(output), {
    raw: { width: SIZE, height: SIZE, channels: 1 },
  })
    .webp({ quality: 84, effort: 6 })
    .toFile(OUTPUT);

  console.log(`${OUTPUT} ${info.width}x${info.height} ${info.size} bytes`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
