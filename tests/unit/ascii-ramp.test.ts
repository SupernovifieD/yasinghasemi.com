import { describe, expect, it } from "vitest";

import {
  createTonePalette,
  pickTone,
  sampleLuminanceGrid,
  selectRamp,
  stretchContrast,
} from "@/lib/ascii/ramp";

describe("selectRamp", () => {
  const measured = [
    { char: ".", coverage: 0.05 },
    { char: ":", coverage: 0.1 },
    { char: "+", coverage: 0.2 },
    { char: "*", coverage: 0.3 },
    { char: "#", coverage: 0.5 },
    { char: "@", coverage: 0.6 },
    { char: " ", coverage: 0 },
  ];

  it("starts with a space and ends with the densest glyph", () => {
    const ramp = selectRamp(measured, 4).map(({ char }) => char);
    expect(ramp).toHaveLength(4);
    expect(ramp[0]).toBe(" ");
    expect(ramp.at(-1)).toBe("@");
  });

  it("never repeats a glyph and rises in density", () => {
    const ramp = selectRamp(measured, 6);
    expect(new Set(ramp.map(({ char }) => char)).size).toBe(ramp.length);
    const coverages = ramp.map(({ coverage }) => coverage);
    expect(coverages).toEqual(coverages.toSorted((a, b) => a - b));
  });

  it("stops early when there are fewer glyphs than levels", () => {
    expect(selectRamp(measured, 20).length).toBeLessThanOrEqual(7);
  });

  it("rejects a ramp with fewer than two levels", () => {
    expect(() => selectRamp(measured, 1)).toThrow(RangeError);
  });
});

describe("sampleLuminanceGrid", () => {
  it("averages source regions into cells", () => {
    // 4x4 image: left half black, right half white.
    const gray = new Uint8Array([
      0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    ]);
    const grid = sampleLuminanceGrid(gray, 4, 2, 2);
    expect(Array.from(grid)).toEqual([0, 1, 0, 1]);
  });

  it("supports non-square cells", () => {
    const gray = new Uint8Array(16).fill(255);
    const grid = sampleLuminanceGrid(gray, 4, 4, 1);
    expect(grid).toHaveLength(4);
    expect(Array.from(grid).every((value) => value === 1)).toBe(true);
  });
});

describe("tone palette", () => {
  // Level 0 is blank; levels 1-3 are increasingly dense.
  const coverage = [0, 0.1, 0.25, 0.5];
  const tones = [0.3, 0.6, 1];

  it("keeps glyph density and tone moving together by default", () => {
    const palette = createTonePalette(coverage, tones);
    // Only the (level, tone) diagonal is within the default rank gap.
    expect(palette.map(({ level, tone }) => [level, tone])).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
    ]);
  });

  it("allows every pairing when the rank gap is wide", () => {
    expect(createTonePalette(coverage, tones, 1)).toHaveLength(9);
  });

  const palette = createTonePalette(coverage, tones, 1);

  it("lists entries in ascending brightness up to 1", () => {
    const brightness = palette.map((entry) => entry.brightness);
    expect(brightness).toEqual(brightness.toSorted((a, b) => a - b));
    expect(palette.at(-1)).toMatchObject({ level: 3, tone: 2, brightness: 1 });
  });

  it("picks the closest brightness", () => {
    expect(pickTone(palette, 1)?.brightness).toBe(1);
    for (const target of [0.1, 0.3, 0.55, 0.8]) {
      const picked = pickTone(palette, target);
      const best = Math.min(
        ...palette.map((entry) => Math.abs(entry.brightness - target)),
      );
      expect(Math.abs((picked?.brightness ?? 99) - target)).toBeCloseTo(best);
    }
  });

  it("leaves dark cells blank", () => {
    expect(pickTone(palette, 0)).toBeNull();
    expect(pickTone(palette, 0.01)).toBeNull();
  });

  it("clamps luminance outside 0..1", () => {
    expect(pickTone(palette, 5)?.brightness).toBe(1);
    expect(pickTone(palette, -1)).toBeNull();
  });

  it("returns null for an empty palette", () => {
    expect(pickTone([], 0.5)).toBeNull();
  });
});

describe("stretchContrast", () => {
  it("clamps to 0 below black and 1 above white", () => {
    expect(stretchContrast(0.05, 0.1, 0.9)).toBe(0);
    expect(stretchContrast(0.95, 0.1, 0.9)).toBe(1);
  });

  it("is monotonic and passes through the midpoint", () => {
    expect(stretchContrast(0.5, 0.1, 0.9)).toBeCloseTo(0.5);
    let previous = -1;
    for (let l = 0; l <= 1; l += 0.05) {
      const value = stretchContrast(l, 0.1, 0.9);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it("separates mid-tones more than the identity does", () => {
    const gap = stretchContrast(0.6, 0.1, 0.9) - stretchContrast(0.4, 0.1, 0.9);
    expect(gap).toBeGreaterThan(0.2);
  });
});
