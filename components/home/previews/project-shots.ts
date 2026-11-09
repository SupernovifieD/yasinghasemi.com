import type { StaticImageData } from "next/image";

import amasghari from "@/assets/projects/amasghari.webp";
import birlikkalkinma from "@/assets/projects/birlikkalkinma.webp";
import blulexi from "@/assets/projects/blulexi.webp";
import ec from "@/assets/projects/ec.webp";
import naar from "@/assets/projects/naar.webp";

/**
 * Screenshots by project slug (see scripts/capture-project-screenshots.ts).
 * A project missing here, such as samraarts until its site is reachable,
 * renders a placeholder tile. To add one: capture it, import it, and register
 * it below.
 */
export const projectShots: Readonly<Record<string, StaticImageData>> = {
  amasghari,
  birlikkalkinma,
  blulexi,
  ec,
  naar,
};
