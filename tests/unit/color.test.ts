import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  MIN_LOGO_CONTRAST,
  PAGE_BLACK,
  parseHex,
  readableOnBlack,
  relativeLuminance,
} from "@/lib/color";

describe("color helpers", () => {
  it("parses 6- and 3-digit hex, with or without #", () => {
    expect(parseHex("#ff8000")).toEqual([255, 128, 0]);
    expect(parseHex("f80")).toEqual([255, 136, 0]);
  });

  it("rejects anything that is not a hex color", () => {
    expect(() => parseHex("orange")).toThrow(RangeError);
    expect(() => parseHex("#12345")).toThrow(RangeError);
  });

  it("computes WCAG luminance and contrast", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 6);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 4);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 4);
  });

  it("keeps a color that already reads on black", () => {
    expect(readableOnBlack("#4169e1")).toBe("#4169e1");
  });

  it("lightens a color that would sink into black, as little as needed", () => {
    const lightened = readableOnBlack("#092e20");
    expect(lightened).not.toBe("#092e20");
    expect(contrastRatio(lightened, PAGE_BLACK)).toBeGreaterThanOrEqual(
      MIN_LOGO_CONTRAST,
    );
    // Even pure black ends up readable.
    expect(
      contrastRatio(readableOnBlack("#000000"), PAGE_BLACK),
    ).toBeGreaterThanOrEqual(MIN_LOGO_CONTRAST);
  });
});
