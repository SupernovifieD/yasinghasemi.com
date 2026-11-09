/** Ink coverage (0..1) measured for one glyph in the actual font. */
export type GlyphCoverage = { char: string; coverage: number };

/**
 * Choose `levels` glyphs whose coverage is evenly spaced from blank to the
 * densest glyph available, so luminance maps to ink linearly. Level 0 is
 * always a space. Measuring the real font beats a hand-written ramp string,
 * because glyph density differs between typefaces.
 */
export function selectRamp(
  measured: readonly GlyphCoverage[],
  levels: number,
): GlyphCoverage[] {
  if (levels < 2) throw new RangeError("A ramp needs at least two levels");

  const sorted = measured
    .filter(({ char }) => char.trim() !== "")
    .toSorted((a, b) => a.coverage - b.coverage);
  const densest = sorted.at(-1)?.coverage ?? 0;
  const ramp: GlyphCoverage[] = [{ char: " ", coverage: 0 }];
  const used = new Set<string>();

  for (let level = 1; level < levels; level++) {
    const target = (level / (levels - 1)) * densest;
    let best: GlyphCoverage | undefined;

    for (const candidate of sorted) {
      if (used.has(candidate.char)) continue;
      if (
        !best ||
        Math.abs(candidate.coverage - target) < Math.abs(best.coverage - target)
      ) {
        best = candidate;
      }
    }
    if (!best) break;

    used.add(best.char);
    ramp.push(best);
  }

  return ramp;
}

/**
 * Box-average a square grayscale image into `cols` x `rows` luminance values
 * in 0..1. Cells are not square (glyphs are taller than wide), so each cell
 * averages a source region of `size/cols` x `size/rows` pixels.
 */
export function sampleLuminanceGrid(
  gray: ArrayLike<number>,
  size: number,
  cols: number,
  rows: number,
): Float32Array {
  const grid = new Float32Array(cols * rows);

  for (let row = 0; row < rows; row++) {
    const y0 = Math.floor((row * size) / rows);
    const y1 = Math.max(y0 + 1, Math.floor(((row + 1) * size) / rows));

    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor((col * size) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((col + 1) * size) / cols));
      let sum = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) sum += gray[y * size + x];
      }
      grid[row * cols + col] = sum / ((y1 - y0) * (x1 - x0) * 255);
    }
  }

  return grid;
}

/**
 * Stretch luminance between `black` and `white` with a smooth S-curve. Glyph
 * shapes add texture of their own, so the gentle tonal steps of a photo (eye
 * against skin) vanish in ASCII unless the contrast is pushed first.
 */
export function stretchContrast(
  luminance: number,
  black: number,
  white: number,
) {
  const t = Math.min(1, Math.max(0, (luminance - black) / (white - black)));
  return t * t * (3 - 2 * t);
}

/** One drawable (glyph, tone) combination and the brightness it reads as. */
export type ToneEntry = { level: number; tone: number; brightness: number };

/**
 * Drawable glyph/tone combinations ordered by how bright they look (ink
 * coverage times tone). Density and tone are kept moving together: a
 * combination is only allowed when its glyph's rank among the glyphs is within
 * `maxRankGap` (0..1) of its tone's rank among the tones. Without that,
 * neighbouring cells of near-equal brightness pick unrelated pairs (a dim
 * dense glyph beside a bright sparse one) and the result reads as noise
 * instead of a smooth tonal ramp.
 */
export function createTonePalette(
  coverage: readonly number[],
  tones: readonly number[],
  maxRankGap = 0.3,
): ToneEntry[] {
  const densest = Math.max(...coverage, Number.EPSILON);
  const glyphSteps = Math.max(1, coverage.length - 2);
  const toneSteps = Math.max(1, tones.length - 1);
  const entries: ToneEntry[] = [];

  for (let level = 1; level < coverage.length; level++) {
    for (let tone = 0; tone < tones.length; tone++) {
      const gap = Math.abs((level - 1) / glyphSteps - tone / toneSteps);
      if (gap > maxRankGap + 1e-9) continue;

      entries.push({
        level,
        tone,
        brightness: (coverage[level] / densest) * tones[tone],
      });
    }
  }

  return entries.toSorted((a, b) => a.brightness - b.brightness);
}

/**
 * The entry whose brightness is closest to `luminance`, or null for blank
 * (anything darker than half the dimmest entry stays empty).
 */
export function pickTone(
  palette: readonly ToneEntry[],
  luminance: number,
): ToneEntry | null {
  const target = Math.min(1, Math.max(0, luminance));
  if (palette.length === 0 || target < palette[0].brightness / 2) return null;

  let low = 0;
  let high = palette.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (palette[middle].brightness < target) low = middle + 1;
    else high = middle;
  }

  const previous = palette[Math.max(0, low - 1)];
  const next = palette[low];
  return Math.abs(previous.brightness - target) <=
    Math.abs(next.brightness - target)
    ? previous
    : next;
}
