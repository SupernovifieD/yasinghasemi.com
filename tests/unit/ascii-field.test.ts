import { describe, expect, it } from "vitest";

import {
  DEFAULT_FIELD_PARAMS,
  ParticleField,
  type FieldGrid,
} from "@/lib/ascii/field";

const CELL_W = 4;
const CELL_H = 8;

/** A fully filled grid of cols x rows particles. */
function createField(cols = 40, rows = 20) {
  const restX = new Float32Array(cols * rows);
  const restY = new Float32Array(cols * rows);
  const cellToParticle = new Int32Array(cols * rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      restX[index] = col * CELL_W + CELL_W / 2;
      restY[index] = row * CELL_H + CELL_H / 2;
      cellToParticle[index] = index;
    }
  }

  const grid: FieldGrid = {
    cols,
    rows,
    cellWidth: CELL_W,
    cellHeight: CELL_H,
    originX: 0,
    originY: 0,
    cellToParticle,
  };
  return { field: new ParticleField(restX, restY, grid), cols, rows };
}

function run(field: ParticleField, seconds: number) {
  for (let t = 0; t < seconds; t += 1 / 60) field.step(1 / 60);
}

describe("ParticleField", () => {
  it("starts asleep and does no work", () => {
    const { field } = createField();
    expect(field.awakeCount).toBe(0);
    expect(field.step(1 / 60)).toBe(false);
  });

  it("pushes particles away from the pointer", () => {
    const { field, cols } = createField();
    // Pointer just left of column 20, middle row.
    field.movePointer(20 * CELL_W - 1, 10 * CELL_H, 0);
    run(field, 0.4);

    const right = 10 * cols + 21;
    const left = 10 * cols + 18;
    expect(field.dx[right]).toBeGreaterThan(1);
    expect(field.dx[left]).toBeLessThan(-1);
  });

  it("leaves particles beyond the radius asleep", () => {
    // 80 columns wide: column 2 is ~150px from the pointer, well outside the
    // 72px radius.
    const { field, cols } = createField(80, 20);
    field.movePointer(40 * CELL_W, 10 * CELL_H, 0);
    run(field, 0.4);

    const far = 10 * cols + 2;
    expect(field.dx[far]).toBe(0);
    expect(field.dy[far]).toBe(0);
  });

  it("springs every particle back to rest after the pointer leaves", () => {
    const { field } = createField();
    field.movePointer(80, 80, 0);
    run(field, 0.5);
    expect(field.awakeCount).toBeGreaterThan(0);

    field.releasePointer();
    run(field, 4);

    expect(field.awakeCount).toBe(0);
    expect(Math.max(...Array.from(field.dx).map(Math.abs))).toBe(0);
    expect(Math.max(...Array.from(field.dy).map(Math.abs))).toBe(0);
  });

  it("scatters particles only when the pointer moves fast", () => {
    const slow = createField();
    slow.field.movePointer(80, 80, DEFAULT_FIELD_PARAMS.scatterFloor - 1);
    const slowSpread = new Set<number>();
    run(slow.field, 0.05);
    for (let i = 0; i < slow.field.count; i++) {
      slowSpread.add(
        Math.round(Math.atan2(slow.field.dy[i], slow.field.dx[i]) * 4),
      );
    }

    const fast = createField();
    fast.field.movePointer(80, 80, 2000);
    run(fast.field, 0.05);
    let moved = 0;
    for (let i = 0; i < fast.field.count; i++) {
      if (Math.hypot(fast.field.dx[i], fast.field.dy[i]) > 0.5) moved++;
    }
    expect(moved).toBeGreaterThan(0);
    // Fast movement displaces more of the field than slow movement.
    let slowMoved = 0;
    for (let i = 0; i < slow.field.count; i++) {
      if (Math.hypot(slow.field.dx[i], slow.field.dy[i]) > 0.5) slowMoved++;
    }
    expect(moved).toBeGreaterThanOrEqual(slowMoved);
  });

  it("keeps displacement bounded while the pointer stays put", () => {
    const { field } = createField();
    field.movePointer(80, 80, 0);
    run(field, 3);

    let largest = 0;
    for (let i = 0; i < field.count; i++) {
      largest = Math.max(largest, Math.hypot(field.dx[i], field.dy[i]));
    }
    expect(largest).toBeLessThan(DEFAULT_FIELD_PARAMS.radius * 1.5);
    expect(Number.isFinite(largest)).toBe(true);
  });
});
