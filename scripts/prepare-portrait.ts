/**
 * Preprocess a profile photo for an ASCII portrait.
 *
 *   pnpm exec tsx scripts/prepare-portrait.ts <home|about> <source-photo>
 *
 * Targets (see TARGETS below):
 *   home   assets/portrait/portrait.webp        the home /about hover preview
 *   about  assets/portrait/portrait-about.webp  the portrait on the /about page
 *
 * Output is a small grayscale image where the photo's background has been
 * suppressed to black (the site is black, so the subject should emerge from
 * it), contrast and edges are enhanced, and the shoulders fade out below the
 * neck. The portrait component samples it to decide which glyph and tone each
 * ASCII cell gets. Originals are not stored in the repository.
 */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import sharp, { type Sharp } from "sharp";

const SIZE = 640;

type Ellipse = { cx: number; cy: number; rx: number; ry: number };

type Target = {
  output: string;
  /**
   * Square crop. `left` and `size` are fractions of the upright image's
   * width, `top` a fraction of its height.
   */
  crop: { left: number; top: number; size: number };
  /** Fully visible above `start` (fractions of the crop), black at `end`. */
  fade: { start: number; end: number };
  /** Soft oval around the subject; everything outside it fades to black. */
  oval: Ellipse;
  /**
   * Fixed tonal stretch (0-255) of the enhanced subject, or percentile
   * auto-levels for photos whose skin is darker.
   */
  levels: { black: number; white: number } | "auto";
  /** Midtone lift applied after the stretch: below 1 brightens. */
  gamma: number;
  /**
   * Below `row` (a fraction of the crop's height), copy the `from` side of the
   * body onto the other side wherever the other side kept less (mirrored about
   * the crop's centre line). For a white shirt on a white wall, where the
   * matte can only tell one shoulder from the wall.
   */
  mirror?: { row: number; from: "left" | "right" };
  matte:
    | { kind: "backdrop" }
    | {
        kind: "skin";
        /** Always subject: the face interior (eyes and teeth are not skin). */
        core: Ellipse;
        /** Colour matching is trusted only inside this head-and-neck prior. */
        prior: Ellipse;
      };
};

const TARGETS: Record<string, Target> = {
  // A studio photo on a smooth light wall: flood-fill the wall.
  home: {
    output: "assets/portrait/portrait.webp",
    crop: { left: 0.107, top: 0.0845, size: 0.745 },
    fade: { start: 0.8, end: 0.94 },
    oval: { cx: 0.5, cy: 0.46, rx: 0.4, ry: 0.78 },
    levels: { black: 20, white: 225 },
    gamma: 1,
    mirror: { row: 0.7, from: "left" },
    matte: { kind: "backdrop" },
  },
  // An outdoor photo on yellow foliage: skin and hair are orange-red and dark,
  // the foliage is yellow, so separate them by hue.
  about: {
    output: "assets/portrait/portrait-about.webp",
    crop: { left: 0.3015, top: 0.2791, size: 0.354 },
    fade: { start: 0.84, end: 1 },
    oval: { cx: 0.5, cy: 0.504, rx: 0.386, ry: 0.568 },
    levels: "auto",
    // Darker skin and black hair would sink into the black page otherwise.
    gamma: 0.62,
    matte: {
      kind: "skin",
      core: { cx: 0.5, cy: 0.45, rx: 0.28, ry: 0.36 },
      prior: { cx: 0.5, cy: 0.504, rx: 0.364, ry: 0.523 },
    },
  },
};

// Backdrop flood fill (the "backdrop" matte). The wall is a very smooth,
// bright gradient (about 225-245, +/-1 between neighbours). It is flooded
// from the top and upper side edges: a pixel joins it only if it is at least
// this bright and within this step of its neighbour.
const BACKDROP_MIN = 220;
const BACKDROP_STEP = 2;
const BACKDROP_FEATHER_SIGMA = 2.2;
// Sharpening leaves a bright halo just outside the hair that the strict flood
// misses. Grow the backdrop a few pixels, but only through bright pixels.
const BACKDROP_GROW_STEPS = 4;
const BACKDROP_GROW_MIN = 190;

// Skin matte: hue in degrees, saturation and value in 0..1.
const SKIN_HUE_FULL = 21; // up to here (and from 330 up) is skin/hair/sweater
const SKIN_HUE_NONE = 27; // from here on it is foliage
const SKIN_SAT_MIN = [0.18, 0.28] as const;
const DARK_VALUE = [0.26, 0.36] as const; // hair, sunglasses, shadows
const MATTE_MEDIAN = 5;
const MATTE_BLUR_SIGMA = 1.8;

const AUTO_LEVELS_PERCENTILES = [0.03, 0.995] as const;

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

/** 1 inside the ellipse's `inner` fraction, easing to 0 at its edge. */
function ellipseWeight(
  x: number,
  y: number,
  { cx, cy, rx, ry }: Ellipse,
  inner: number,
) {
  const distance = Math.hypot((x / SIZE - cx) / rx, (y / SIZE - cy) / ry);
  return 1 - smoothstep(inner, 1, distance);
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
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
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

/** Subject coverage 0..1 for a smooth bright wall (1 = subject). */
async function backdropMatte(gray: Uint8Array) {
  const backdrop = findBackdrop(gray, SIZE);
  growBackdrop(backdrop, gray, SIZE);

  const mask = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < mask.length; i++) mask[i] = backdrop[i] ? 255 : 0;
  const soft = await singleChannel(
    sharp(Buffer.from(mask), {
      raw: { width: SIZE, height: SIZE, channels: 1 },
    }).blur(BACKDROP_FEATHER_SIGMA),
  );

  return Float64Array.from(soft, (value) => 1 - value / 255);
}

function hueSatValue(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  return {
    hue: (hue * 60 + 360) % 360,
    saturation: max ? delta / max : 0,
    value: max / 255,
  };
}

/**
 * Subject coverage 0..1 for a coloured background: hair and dark things by
 * value, skin and clothing by hue, both trusted only inside a head-and-neck
 * prior, plus an always-on face core (eyes and teeth are not skin coloured).
 */
async function skinMatte(rgb: Uint8Array, core: Ellipse, prior: Ellipse) {
  const matte = new Uint8Array(SIZE * SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const index = y * SIZE + x;
      const { hue, saturation, value } = hueSatValue(
        rgb[index * 3],
        rgb[index * 3 + 1],
        rgb[index * 3 + 2],
      );

      const dark = 1 - smoothstep(DARK_VALUE[0], DARK_VALUE[1], value);
      // Warm red/orange hues (skin, hair, sweater) versus yellow foliage.
      const warm =
        hue >= 330 || hue <= SKIN_HUE_FULL
          ? 1
          : 1 - smoothstep(SKIN_HUE_FULL, SKIN_HUE_NONE, hue);
      const colour =
        warm * smoothstep(SKIN_SAT_MIN[0], SKIN_SAT_MIN[1], saturation);

      const trusted = Math.max(dark, colour) * ellipseWeight(x, y, prior, 0.9);
      const coreWeight = ellipseWeight(x, y, core, 0.8);
      matte[index] = Math.round(255 * Math.max(trusted, coreWeight));
    }
  }

  // Median removes foliage specks that slipped through; the blur feathers.
  const clean = await singleChannel(
    sharp(Buffer.from(matte), {
      raw: { width: SIZE, height: SIZE, channels: 1 },
    })
      .median(MATTE_MEDIAN)
      .blur(MATTE_BLUR_SIGMA),
  );
  return Float64Array.from(clean, (value) => value / 255);
}

/**
 * Make the body below row `row` (a fraction of the crop) left-right symmetric:
 * wherever the `from` side has more subject than its mirror image, the mirror
 * image takes its coverage and tone. The other side is never changed, so a
 * stray fragment on it cannot spread back.
 */
function fillByMirror(
  subject: Float64Array,
  tone: Uint8Array,
  row: number,
  from: "left" | "right",
) {
  for (let y = Math.round(row * SIZE); y < SIZE; y++) {
    for (let x = 0; x < SIZE / 2; x++) {
      const side = y * SIZE + x;
      const other = y * SIZE + (SIZE - 1 - x);
      const [source, target] = from === "left" ? [side, other] : [other, side];

      if (subject[source] > subject[target]) {
        subject[target] = subject[source];
        tone[target] = tone[source];
      }
    }
  }
}

/** The level below which `fraction` of the subject's pixels fall. */
function percentile(
  values: Uint8Array,
  subject: Float64Array,
  fraction: number,
) {
  const histogram = new Uint32Array(256);
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    if (subject[i] > 0.5) {
      histogram[values[i]]++;
      total++;
    }
  }

  let seen = 0;
  for (let level = 0; level < 256; level++) {
    seen += histogram[level];
    if (seen >= total * fraction) return level;
  }
  return 255;
}

async function main() {
  const [name, source] = process.argv.slice(2);
  const target = TARGETS[name ?? ""];
  if (!target || !source) {
    throw new Error(
      `Usage: prepare-portrait.ts <${Object.keys(TARGETS).join("|")}> <source-photo>`,
    );
  }

  // The crop is expressed on the upright image, so account for EXIF rotation.
  const meta = await sharp(source).metadata();
  const sideways = (meta.orientation ?? 1) >= 5;
  const width = (sideways ? meta.height : meta.width) ?? 0;
  const height = (sideways ? meta.width : meta.height) ?? 0;
  if (!width || !height) throw new Error("Unreadable source image");

  const { crop, fade, oval, levels, gamma, matte } = target;
  const base = sharp(source)
    .rotate()
    .extract({
      left: Math.round(crop.left * width),
      top: Math.round(crop.top * height),
      width: Math.round(crop.size * width),
      height: Math.round(crop.size * width),
    })
    .resize(SIZE, SIZE);

  const gray = await singleChannel(base.clone().greyscale());

  const subject =
    matte.kind === "backdrop"
      ? await backdropMatte(gray)
      : await skinMatte(
          new Uint8Array(await base.clone().removeAlpha().raw().toBuffer()),
          matte.core,
          matte.prior,
        );

  // Local contrast, then an unsharp pass for crisp edges (eyes, mouth, hair).
  const enhanced = await singleChannel(
    base
      .clone()
      .greyscale()
      .blur(0.7)
      .clahe({ width: 16, height: 16, maxSlope: 2 })
      .sharpen({ sigma: 1.4, m1: 0.8, m2: 2 })
      .gamma(1.15),
  );

  if (target.mirror) {
    fillByMirror(subject, enhanced, target.mirror.row, target.mirror.from);
  }

  const range =
    levels === "auto"
      ? {
          black: percentile(enhanced, subject, AUTO_LEVELS_PERCENTILES[0]),
          white: percentile(enhanced, subject, AUTO_LEVELS_PERCENTILES[1]),
        }
      : levels;

  const output = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    const vertical = 1 - smoothstep(fade.start, fade.end, y / SIZE);

    for (let x = 0; x < SIZE; x++) {
      const index = y * SIZE + x;
      const stretched = Math.min(
        1,
        Math.max(
          0,
          (enhanced[index] - range.black) / (range.white - range.black),
        ),
      );
      const tone = stretched ** gamma;

      output[index] = Math.round(
        255 * tone * subject[index] * vertical * ellipseWeight(x, y, oval, 0.4),
      );
    }
  }

  const path = resolve(process.cwd(), target.output);
  await mkdir(resolve(path, ".."), { recursive: true });
  const info = await sharp(Buffer.from(output), {
    raw: { width: SIZE, height: SIZE, channels: 1 },
  })
    .webp({ quality: 84, effort: 6 })
    .toFile(path);

  console.log(
    `${path} ${info.width}x${info.height} ${info.size} bytes (levels ${range.black}-${range.white})`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
