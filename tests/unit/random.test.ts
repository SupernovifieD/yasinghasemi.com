import { describe, expect, it } from "vitest";

import { pickRandomIndex } from "@/lib/random";

describe("pickRandomIndex", () => {
  it("maps the random unit interval onto valid indexes", () => {
    expect(pickRandomIndex(5, () => 0)).toBe(0);
    expect(pickRandomIndex(5, () => 0.5)).toBe(2);
    expect(pickRandomIndex(5, () => 0.999999)).toBe(4);
  });

  it("never returns an out-of-range index", () => {
    expect(pickRandomIndex(3, () => 1)).toBe(2);
  });

  it("rejects an empty or invalid length", () => {
    expect(() => pickRandomIndex(0)).toThrow(RangeError);
    expect(() => pickRandomIndex(1.5)).toThrow(RangeError);
  });
});
