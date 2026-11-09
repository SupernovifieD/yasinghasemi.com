import {
  DEFAULT_FIELD_PARAMS,
  ParticleField,
  type FieldGrid,
} from "@/lib/ascii/field";
import {
  createTonePalette,
  pickTone,
  sampleLuminanceGrid,
  selectRamp,
  stretchContrast,
  type GlyphCoverage,
} from "@/lib/ascii/ramp";

const TARGET_COLS = 220;
const MIN_CELL_WIDTH = 2.4;
// Glyphs are about twice as tall as wide.
const CELL_ASPECT = 2;
const LEVELS = 10;
// Black, gray, and white: dim glyphs for shadow, bright ones for highlights.
const TONES = [72, 112, 160, 212, 255] as const;
// Contrast stretch applied to the portrait before matching glyph and tone.
const CONTRAST_BLACK = 0.06;
const CONTRAST_WHITE = 0.96;
const FONT_WEIGHT = 500;
const MEASURE_FONT_PX = 48;
const MAX_DPR = 2;
// Glyphs are stretched vertically so their ink fills the (taller than wide)
// cell; otherwise the gaps between rows read as scanlines.
const GLYPH_STRETCH = 1.35;
const BASELINE = 0.84;

// A small set of clean, visually consistent glyphs: the gray tones supply the
// fine gradation, so the glyphs only need to differ in how much ink they carry.
const CANDIDATES = [..."`.,:;-~=+*#%@"];

export type PortraitSource = { gray: Uint8Array; size: number };

export type PortraitRenderer = {
  /** Rebuild for the canvas's current CSS size. */
  resize(): void;
  /** Inactive renderers release the pointer so glyphs spring back. */
  setActive(active: boolean): void;
  destroy(): void;
};

/** Decode the preprocessed portrait into a square grayscale pixel array. */
export async function loadPortraitSource(src: string): Promise<PortraitSource> {
  const image = new Image();
  image.src = src;
  await image.decode();

  const size = image.naturalWidth;
  const scratch = document.createElement("canvas");
  scratch.width = scratch.height = size;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is unavailable");

  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, size, size);
  const gray = new Uint8Array(size * size);
  for (let i = 0; i < gray.length; i++) gray[i] = data[i * 4];

  return { gray, size };
}

const coverageCache = new Map<string, GlyphCoverage[]>();

/** Ink coverage of each candidate glyph in the page's actual font. */
function measureCoverage(fontFamily: string) {
  const cached = coverageCache.get(fontFamily);
  if (cached) return cached;

  const side = MEASURE_FONT_PX + 16;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = side;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is unavailable");

  context.font = `${FONT_WEIGHT} ${MEASURE_FONT_PX}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#fff";

  const measured = CANDIDATES.map((char) => {
    context.clearRect(0, 0, side, side);
    context.fillText(char, side / 2, side * 0.72);
    const { data } = context.getImageData(0, 0, side, side);
    let ink = 0;
    for (let i = 3; i < data.length; i += 4) ink += data[i];
    return { char, coverage: ink / 255 / (side * side) };
  });

  coverageCache.set(fontFamily, measured);
  return measured;
}

type Layout = {
  dpr: number;
  cssWidth: number;
  cssHeight: number;
  spriteWidth: number;
  spriteHeight: number;
  atlas: HTMLCanvasElement;
  base: HTMLCanvasElement;
  /** Atlas sprite per particle. */
  sprites: Uint16Array;
  field: ParticleField;
  halfCellWidth: number;
  halfCellHeight: number;
};

function buildAtlas(
  ramp: readonly GlyphCoverage[],
  fontFamily: string,
  cellWidth: number,
  cellHeight: number,
  dpr: number,
) {
  const spriteWidth = Math.ceil(cellWidth * dpr);
  const spriteHeight = Math.ceil(cellHeight * dpr);
  const atlas = document.createElement("canvas");
  atlas.width = spriteWidth * ramp.length;
  atlas.height = spriteHeight * TONES.length;
  const context = atlas.getContext("2d");
  if (!context) throw new Error("2D canvas is unavailable");

  // A monospace glyph is ~0.6em wide; fit the cell width, then stretch it
  // vertically to fill the cell height.
  const fontPx = (cellWidth * dpr) / 0.6;
  context.setTransform(1, 0, 0, GLYPH_STRETCH, 0, 0);
  context.font = `${FONT_WEIGHT} ${fontPx}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";

  for (let level = 1; level < ramp.length; level++) {
    for (let tone = 0; tone < TONES.length; tone++) {
      const gray = TONES[tone];
      context.fillStyle = `rgb(${gray} ${gray} ${gray})`;
      context.fillText(
        ramp[level].char,
        level * spriteWidth + spriteWidth / 2,
        (tone * spriteHeight + spriteHeight * BASELINE) / GLYPH_STRETCH,
      );
    }
  }

  return { atlas, spriteWidth, spriteHeight };
}

export function createPortraitRenderer(options: {
  canvas: HTMLCanvasElement;
  source: PortraitSource;
  fontFamily: string;
  /** False for reduced motion: draw once, no pointer interaction. */
  interactive: boolean;
}): PortraitRenderer {
  const { canvas, source, fontFamily, interactive } = options;
  const maybeContext = canvas.getContext("2d");
  if (!maybeContext) throw new Error("2D canvas is unavailable");
  // Annotated so the narrowing also holds inside the hoisted functions below.
  const context: CanvasRenderingContext2D = maybeContext;

  let layout: Layout | null = null;
  let frame = 0;
  let lastTime = 0;
  let lastPointer: { x: number; y: number; time: number } | null = null;

  function build() {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const cssWidth = bounds.width;
    const cssHeight = bounds.height;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    const cellWidth = Math.max(MIN_CELL_WIDTH, cssWidth / TARGET_COLS);
    const cellHeight = cellWidth * CELL_ASPECT;
    const cols = Math.floor(cssWidth / cellWidth);
    const rows = Math.floor(cssHeight / cellHeight);
    const originX = (cssWidth - cols * cellWidth) / 2;
    const originY = (cssHeight - rows * cellHeight) / 2;

    const ramp = selectRamp(measureCoverage(fontFamily), LEVELS);
    const palette = createTonePalette(
      ramp.map(({ coverage }) => coverage),
      TONES.map((gray) => gray / 255),
    );
    const { atlas, spriteWidth, spriteHeight } = buildAtlas(
      ramp,
      fontFamily,
      cellWidth,
      cellHeight,
      dpr,
    );
    const luminance = sampleLuminanceGrid(source.gray, source.size, cols, rows);

    // One particle per non-blank cell.
    const cellToParticle = new Int32Array(cols * rows).fill(-1);
    const restX: number[] = [];
    const restY: number[] = [];
    const spriteIds: number[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const entry = pickTone(
          palette,
          stretchContrast(
            luminance[row * cols + col],
            CONTRAST_BLACK,
            CONTRAST_WHITE,
          ),
        );
        if (!entry) continue;

        cellToParticle[row * cols + col] = restX.length;
        restX.push(originX + (col + 0.5) * cellWidth);
        restY.push(originY + (row + 0.5) * cellHeight);
        spriteIds.push(entry.level * TONES.length + entry.tone);
      }
    }

    const grid: FieldGrid = {
      cols,
      rows,
      cellWidth,
      cellHeight,
      originX,
      originY,
      cellToParticle,
    };
    const scale = cssWidth / 544;
    const field = new ParticleField(
      Float32Array.from(restX),
      Float32Array.from(restY),
      grid,
      {
        ...DEFAULT_FIELD_PARAMS,
        radius: DEFAULT_FIELD_PARAMS.radius * scale,
        repel: DEFAULT_FIELD_PARAMS.repel * scale,
      },
    );

    const next: Layout = {
      dpr,
      cssWidth,
      cssHeight,
      spriteWidth,
      spriteHeight,
      atlas,
      base: document.createElement("canvas"),
      sprites: Uint16Array.from(spriteIds),
      field,
      halfCellWidth: cellWidth / 2,
      halfCellHeight: cellHeight / 2,
    };
    next.base.width = canvas.width;
    next.base.height = canvas.height;

    const baseContext = next.base.getContext("2d");
    if (!baseContext) throw new Error("2D canvas is unavailable");
    for (let i = 0; i < field.count; i++) {
      drawSprite(baseContext, next, i, field.restX[i], field.restY[i]);
    }

    layout = next;
    draw();
  }

  /** Draw particle `i`'s glyph centred on (x, y), in CSS px. */
  function drawSprite(
    target: CanvasRenderingContext2D,
    current: Layout,
    i: number,
    x: number,
    y: number,
  ) {
    const id = current.sprites[i];
    const level = Math.floor(id / TONES.length);
    const tone = id % TONES.length;
    target.drawImage(
      current.atlas,
      level * current.spriteWidth,
      tone * current.spriteHeight,
      current.spriteWidth,
      current.spriteHeight,
      Math.round((x - current.halfCellWidth) * current.dpr),
      Math.round((y - current.halfCellHeight) * current.dpr),
      current.spriteWidth,
      current.spriteHeight,
    );
  }

  /** Blit the resting portrait, then redraw only the displaced glyphs. */
  function draw() {
    if (!layout) return;
    const current = layout;
    const { field } = current;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(current.base, 0, 0);

    for (let n = 0; n < field.awakeCount; n++) {
      const i = field.awakeIndices[n];
      context.clearRect(
        Math.round((field.restX[i] - current.halfCellWidth) * current.dpr),
        Math.round((field.restY[i] - current.halfCellHeight) * current.dpr),
        current.spriteWidth,
        current.spriteHeight,
      );
    }
    for (let n = 0; n < field.awakeCount; n++) {
      const i = field.awakeIndices[n];
      drawSprite(
        context,
        current,
        i,
        field.restX[i] + field.dx[i],
        field.restY[i] + field.dy[i],
      );
    }
  }

  function tick(now: number) {
    frame = 0;
    if (!layout) return;

    const dt = lastTime ? Math.min(0.033, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;

    const moving = layout.field.step(dt);
    draw();

    if (moving) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function wake() {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function onPointerMove(event: PointerEvent) {
    if (!layout || event.pointerType === "touch") return;

    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const time = performance.now();
    const speed =
      lastPointer && time > lastPointer.time
        ? (Math.hypot(x - lastPointer.x, y - lastPointer.y) /
            (time - lastPointer.time)) *
          1000
        : 0;

    lastPointer = { x, y, time };
    layout.field.movePointer(x, y, speed);
    wake();
  }

  function onPointerLeave() {
    lastPointer = null;
    layout?.field.releasePointer();
    wake();
  }

  if (interactive) {
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointercancel", onPointerLeave);
  }

  return {
    resize: build,
    setActive(active) {
      if (!active && interactive) onPointerLeave();
    },
    destroy() {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointercancel", onPointerLeave);
      layout = null;
    },
  };
}
