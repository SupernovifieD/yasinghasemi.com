import { describe, expect, it } from "vitest";

import { easeToward } from "@/lib/ease";

describe("easeToward", () => {
  it("closes about 63% of the gap after one time constant", () => {
    const next = easeToward(1, 0.1, 0.35, 0.35);
    expect(next).toBeCloseTo(0.1 + 0.9 * Math.exp(-1), 6);
  });

  it("approaches the target monotonically without overshooting", () => {
    for (const [from, to] of [
      [1, 0.1],
      [0.1, 1],
    ] as const) {
      let value: number = from;
      for (let i = 0; i < 300; i++) {
        const next = easeToward(value, to, 1 / 60, 0.35);
        expect(Math.abs(next - to)).toBeLessThanOrEqual(Math.abs(value - to));
        expect(next >= Math.min(from, to) && next <= Math.max(from, to)).toBe(
          true,
        );
        value = next;
      }
      expect(value).toBe(to);
    }
  });

  it("does not depend on the frame rate", () => {
    let fast = 1;
    for (let i = 0; i < 120; i++)
      fast = easeToward(fast, 0.1, 1 / 120, 0.35, 0);
    let slow = 1;
    for (let i = 0; i < 30; i++) slow = easeToward(slow, 0.1, 1 / 30, 0.35, 0);
    expect(fast).toBeCloseTo(slow, 6);
  });

  it("holds still for a non-positive time step", () => {
    expect(easeToward(0.5, 1, 0, 0.35)).toBe(0.5);
    expect(easeToward(0.5, 1, -1, 0.35)).toBe(0.5);
  });
});
