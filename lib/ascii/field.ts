export type FieldParams = {
  /** Distance in px within which the pointer pushes particles. */
  radius: number;
  /** Peak repulsion acceleration (px/s^2) at the pointer. */
  repel: number;
  /** Spring pulling a particle back to its rest position (1/s^2). */
  stiffness: number;
  /** Velocity damping (1/s). Below critical, so the return has a soft overshoot. */
  damping: number;
  /** Velocity kick per px/s of pointer speed above `scatterFloor`. */
  scatter: number;
  /** Pointer speed (px/s) below which moving the pointer does not scatter. */
  scatterFloor: number;
  /** Displacement (px) and speed (px/s) under which a particle goes to sleep. */
  rest: number;
};

export const DEFAULT_FIELD_PARAMS: FieldParams = {
  radius: 72,
  repel: 3400,
  stiffness: 60,
  damping: 9,
  scatter: 0.16,
  scatterFloor: 160,
  rest: 0.04,
};

export type FieldGrid = {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  /** Top-left of cell (0, 0) in the same px space as the rest positions. */
  originX: number;
  originY: number;
  /** Particle index for each cell, or -1 where the cell is blank. */
  cellToParticle: Int32Array;
};

/**
 * Spring-and-repulsion simulation for the ASCII portrait. Every glyph is a
 * particle that wants to sit at its rest position; the pointer pushes nearby
 * particles away like a magnet repelling, and fast pointer movement also
 * scatters them. Particles at rest are asleep and cost nothing, so a still
 * portrait does no work.
 */
export class ParticleField {
  readonly count: number;
  readonly restX: Float32Array;
  readonly restY: Float32Array;
  readonly dx: Float32Array;
  readonly dy: Float32Array;
  /** Indices of awake particles; only the first `awakeCount` are valid. */
  readonly awakeIndices: Int32Array;
  awakeCount = 0;

  private readonly vx: Float32Array;
  private readonly vy: Float32Array;
  private readonly angle: Float32Array;
  private readonly isAwake: Uint8Array;
  private pointerX = 0;
  private pointerY = 0;
  private pointerActive = false;

  constructor(
    restX: Float32Array,
    restY: Float32Array,
    private readonly grid: FieldGrid,
    private readonly params: FieldParams = DEFAULT_FIELD_PARAMS,
  ) {
    this.count = restX.length;
    this.restX = restX;
    this.restY = restY;
    this.dx = new Float32Array(this.count);
    this.dy = new Float32Array(this.count);
    this.vx = new Float32Array(this.count);
    this.vy = new Float32Array(this.count);
    this.angle = new Float32Array(this.count);
    this.isAwake = new Uint8Array(this.count);
    this.awakeIndices = new Int32Array(this.count);

    // A fixed pseudo-random direction per particle for scatter kicks.
    let seed = 0x9e3779b9;
    for (let i = 0; i < this.count; i++) {
      seed = Math.imul(seed ^ (seed >>> 15), 0x2c1b3c6d);
      seed = Math.imul(seed ^ (seed >>> 12), 0x297a2d39);
      this.angle[i] =
        (((seed ^ (seed >>> 15)) >>> 0) / 4294967296) * Math.PI * 2;
    }
  }

  /** Track the pointer. Moving it fast also scatters nearby particles. */
  movePointer(x: number, y: number, speed: number) {
    this.pointerX = x;
    this.pointerY = y;
    this.pointerActive = true;
    this.wakeAround();

    const excess = speed - this.params.scatterFloor;
    if (excess > 0) this.scatterNearby(excess * this.params.scatter);
  }

  /** The pointer left: stop pushing and let everything spring back. */
  releasePointer() {
    this.pointerActive = false;
  }

  /** Advance by `dt` seconds. Returns whether any particle is still moving. */
  step(dt: number) {
    const { radius, repel, stiffness, damping, rest } = this.params;
    const radiusSquared = radius * radius;
    const decay = Math.exp(-damping * dt);
    let kept = 0;

    if (this.pointerActive) this.wakeAround();

    for (let n = 0; n < this.awakeCount; n++) {
      const i = this.awakeIndices[n];
      let ax = -stiffness * this.dx[i];
      let ay = -stiffness * this.dy[i];

      if (this.pointerActive) {
        const offsetX = this.restX[i] + this.dx[i] - this.pointerX;
        const offsetY = this.restY[i] + this.dy[i] - this.pointerY;
        const distanceSquared = offsetX * offsetX + offsetY * offsetY;

        if (distanceSquared < radiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const falloff = 1 - distance / radius;
          const push = repel * falloff * falloff;

          if (distance > 1e-3) {
            ax += (offsetX / distance) * push;
            ay += (offsetY / distance) * push;
          } else {
            ax += Math.cos(this.angle[i]) * push;
            ay += Math.sin(this.angle[i]) * push;
          }
        }
      }

      this.vx[i] = (this.vx[i] + ax * dt) * decay;
      this.vy[i] = (this.vy[i] + ay * dt) * decay;
      this.dx[i] += this.vx[i] * dt;
      this.dy[i] += this.vy[i] * dt;

      const settled =
        Math.abs(this.dx[i]) < rest &&
        Math.abs(this.dy[i]) < rest &&
        Math.abs(this.vx[i]) < rest &&
        Math.abs(this.vy[i]) < rest;

      if (settled && !this.isWithinReach(i)) {
        this.dx[i] = this.dy[i] = this.vx[i] = this.vy[i] = 0;
        this.isAwake[i] = 0;
      } else {
        this.awakeIndices[kept++] = i;
      }
    }

    this.awakeCount = kept;
    return kept > 0;
  }

  /** Whether the pointer is active and close enough to move particle `i`. */
  private isWithinReach(i: number) {
    if (!this.pointerActive) return false;
    const { radius } = this.params;
    return (
      Math.hypot(this.restX[i] - this.pointerX, this.restY[i] - this.pointerY) <
      radius
    );
  }

  private wake(i: number) {
    if (this.isAwake[i]) return;
    this.isAwake[i] = 1;
    this.awakeIndices[this.awakeCount++] = i;
  }

  /** Wake sleeping particles whose rest cell is within reach of the pointer. */
  private wakeAround() {
    this.forEachCellNear(this.params.radius, (particle) => this.wake(particle));
  }

  private scatterNearby(strength: number) {
    const { radius } = this.params;
    this.forEachCellNear(radius, (i) => {
      const offsetX = this.restX[i] + this.dx[i] - this.pointerX;
      const offsetY = this.restY[i] + this.dy[i] - this.pointerY;
      const distance = Math.hypot(offsetX, offsetY);
      if (distance >= radius) return;

      // Rotate each particle's kick direction so repeated wiggles keep
      // scattering instead of nudging along one line.
      this.angle[i] += 2.399963;
      const weight = (1 - distance / radius) * strength;
      this.vx[i] += Math.cos(this.angle[i]) * weight;
      this.vy[i] += Math.sin(this.angle[i]) * weight;
    });
  }

  private forEachCellNear(reach: number, visit: (particle: number) => void) {
    const { cols, rows, cellWidth, cellHeight, originX, originY } = this.grid;
    const firstCol = Math.max(
      0,
      Math.floor((this.pointerX - reach - originX) / cellWidth),
    );
    const lastCol = Math.min(
      cols - 1,
      Math.floor((this.pointerX + reach - originX) / cellWidth),
    );
    const firstRow = Math.max(
      0,
      Math.floor((this.pointerY - reach - originY) / cellHeight),
    );
    const lastRow = Math.min(
      rows - 1,
      Math.floor((this.pointerY + reach - originY) / cellHeight),
    );

    for (let row = firstRow; row <= lastRow; row++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const particle = this.grid.cellToParticle[row * cols + col];
        if (particle >= 0) visit(particle);
      }
    }
  }
}
