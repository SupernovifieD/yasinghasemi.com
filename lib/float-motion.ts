/** One sinusoidal component: amplitude, period in seconds, phase in radians. */
export type Wave = { amplitude: number; period: number; phase: number };

/**
 * How one object floats. Every component is its own slow sine wave with its
 * own period and phase, and rotation is split over all three axes, so objects
 * given different specs drift out of sync. Sines only: velocity is continuous,
 * so the motion is graceful and never jerks.
 */
export type FloatSpec = {
  bob: Wave;
  drift: Wave;
  rotateX: Wave;
  rotateY: Wave;
  rotateZ: Wave;
};

export type FloatPose = {
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
};

export function sampleWave(
  { amplitude, period, phase }: Wave,
  seconds: number,
) {
  return amplitude * Math.sin((2 * Math.PI * seconds) / period + phase);
}

/** The pose at `seconds` (positions in scene units, rotations in radians). */
export function floatPose(spec: FloatSpec, seconds: number): FloatPose {
  return {
    x: sampleWave(spec.drift, seconds),
    y: sampleWave(spec.bob, seconds),
    rotationX: sampleWave(spec.rotateX, seconds),
    rotationY: sampleWave(spec.rotateY, seconds),
    rotationZ: sampleWave(spec.rotateZ, seconds),
  };
}

/**
 * Slow but clearly visible: about 0.25 units of bob (a sixth of a logo), up
 * to ~35 degrees of sway, and periods between 6 and 15 seconds. The periods
 * are deliberately unrelated so the three never fall back into step.
 */
export const floatSpecs = {
  github: {
    bob: { amplitude: 0.26, period: 7.3, phase: 0 },
    drift: { amplitude: 0.1, period: 11.1, phase: 1.2 },
    rotateX: { amplitude: 0.28, period: 12.3, phase: 2.1 },
    rotateY: { amplitude: 0.6, period: 9.7, phase: 0.4 },
    rotateZ: { amplitude: 0.12, period: 14.9, phase: 0.8 },
  },
  email: {
    bob: { amplitude: 0.28, period: 8.9, phase: 2.2 },
    drift: { amplitude: 0.12, period: 13.7, phase: 3.5 },
    rotateX: { amplitude: 0.35, period: 10.1, phase: 0.2 },
    rotateY: { amplitude: 0.5, period: 7.9, phase: 2.9 },
    rotateZ: { amplitude: 0.18, period: 11.7, phase: 4 },
  },
  linkedin: {
    bob: { amplitude: 0.24, period: 6.7, phase: 4.1 },
    drift: { amplitude: 0.09, period: 9.3, phase: 0.3 },
    rotateX: { amplitude: 0.22, period: 8.3, phase: 3.3 },
    rotateY: { amplitude: 0.62, period: 11.3, phase: 5 },
    rotateZ: { amplitude: 0.15, period: 13.3, phase: 1.5 },
  },
} satisfies Record<string, FloatSpec>;
