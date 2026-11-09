/** The page background; every logo color is checked against it. */
export const PAGE_BLACK = "#000000";

/** WCAG's minimum contrast for graphical objects such as logos. */
export const MIN_LOGO_CONTRAST = 3;

type Rgb = readonly [number, number, number];

export function parseHex(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!match) throw new RangeError(`Not a hex color: ${hex}`);

  const digits =
    match[1].length === 3
      ? [...match[1]].map((digit) => digit + digit).join("")
      : match[1];
  const value = Number.parseInt(digits, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function toHex([r, g, b]: Rgb) {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string) {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const unit = channel / 255;
    return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors, 1 to 21. */
export function contrastRatio(a: string, b: string) {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
}

/**
 * The color itself if it already reads on the black page, otherwise the
 * smallest step toward white that does. Brand colors are kept whenever they
 * can be; only ones that would sink into the background are lightened.
 */
export function readableOnBlack(hex: string, minimum = MIN_LOGO_CONTRAST) {
  if (contrastRatio(hex, PAGE_BLACK) >= minimum) return toHex(parseHex(hex));

  const base = parseHex(hex);
  for (let step = 1; step <= 20; step++) {
    const mixed = base.map(
      (channel) => channel + ((255 - channel) * step) / 20,
    ) as unknown as Rgb;
    const candidate = toHex(mixed);
    if (contrastRatio(candidate, PAGE_BLACK) >= minimum) return candidate;
  }
  return "#ffffff";
}
