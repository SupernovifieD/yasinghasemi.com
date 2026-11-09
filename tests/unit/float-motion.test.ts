import { describe, expect, it } from "vitest";

import {
  floatPose,
  floatSpecs,
  sampleWave,
  type FloatSpec,
} from "@/lib/float-motion";

const specs = Object.entries(floatSpecs) as [string, FloatSpec][];

describe("float motion", () => {
  it("never exceeds each component's amplitude", () => {
    for (const [, spec] of specs) {
      for (let t = 0; t < 120; t += 0.37) {
        const pose = floatPose(spec, t);
        expect(Math.abs(pose.y)).toBeLessThanOrEqual(spec.bob.amplitude + 1e-9);
        expect(Math.abs(pose.x)).toBeLessThanOrEqual(
          spec.drift.amplitude + 1e-9,
        );
        expect(Math.abs(pose.rotationY)).toBeLessThanOrEqual(
          spec.rotateY.amplitude + 1e-9,
        );
      }
    }
  });

  it("is smooth: poses a frame apart differ only slightly", () => {
    const frame = 1 / 60;
    for (const [, spec] of specs) {
      let previous = floatPose(spec, 0);
      for (let t = frame; t < 60; t += frame) {
        const pose = floatPose(spec, t);
        expect(Math.abs(pose.y - previous.y)).toBeLessThan(0.01);
        expect(Math.abs(pose.rotationY - previous.rotationY)).toBeLessThan(
          0.01,
        );
        previous = pose;
      }
    }
  });

  it("repeats exactly after one period", () => {
    const wave = floatSpecs.github.bob;
    expect(sampleWave(wave, 3)).toBeCloseTo(sampleWave(wave, 3 + wave.period));
  });

  it("keeps the logos out of sync: distinct periods, phases, and poses", () => {
    const periods = specs.flatMap(([, spec]) =>
      [spec.bob, spec.drift, spec.rotateX, spec.rotateY, spec.rotateZ].map(
        ({ period }) => period,
      ),
    );
    expect(new Set(periods).size).toBe(periods.length);

    const phases = specs.map(([, spec]) => spec.bob.phase);
    expect(new Set(phases).size).toBe(specs.length);

    // Curves may cross for an instant, but no pair should move in lockstep.
    for (let a = 0; a < specs.length; a++) {
      for (let b = a + 1; b < specs.length; b++) {
        let samples = 0;
        let close = 0;
        for (let t = 0; t < 300; t += 0.5) {
          samples++;
          const gap = Math.abs(
            floatPose(specs[a][1], t).y - floatPose(specs[b][1], t).y,
          );
          if (gap < 0.03) close++;
        }
        expect(close / samples).toBeLessThan(0.2);
      }
    }
  });

  it("moves slowly but clearly: visible amplitude, long periods", () => {
    for (const [, spec] of specs) {
      expect(spec.bob.amplitude).toBeGreaterThanOrEqual(0.2);
      for (const wave of [spec.bob, spec.drift, spec.rotateY]) {
        expect(wave.period).toBeGreaterThanOrEqual(6);
        expect(wave.period).toBeLessThanOrEqual(15);
      }
    }
  });
});
