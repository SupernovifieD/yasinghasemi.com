import portrait from "@/assets/portrait/portrait.webp";
import { AsciiPortraitCanvas } from "@/components/portrait/ascii-portrait-canvas";
import type { PreviewProps } from "@/components/home/previews/types";

/** Warm the browser cache for the portrait ahead of the first hover. */
export function preloadPortrait() {
  const image = new Image();
  image.src = portrait.src;
}

/** The /about hover preview: the home portrait as pointer-reactive ASCII. */
export default function AboutPreview({ active }: PreviewProps) {
  return (
    <AsciiPortraitCanvas
      image={portrait}
      label="ASCII portrait of Yasin Ghasemi"
      active={active}
    />
  );
}
