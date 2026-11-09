import type { StaticImageData } from "next/image";

import amasghari from "@/assets/projects/amasghari.webp";
import birlik from "@/assets/projects/birlik.webp";
import blulexi from "@/assets/projects/blulexi.webp";
import earthcatalogue from "@/assets/projects/earthcatalogue.webp";
import naar from "@/assets/projects/naar.webp";

/**
 * Screenshots by project slug (see scripts/capture-project-screenshots.ts).
 * A project missing here renders a placeholder tile and panel. To add one:
 * capture it as assets/projects/<slug>.webp, import it, and register it below.
 */
export const projectShots: Readonly<Record<string, StaticImageData>> = {
  amasghari,
  birlik,
  blulexi,
  earthcatalogue,
  naar,
};
