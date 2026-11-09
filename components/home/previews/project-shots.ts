import type { StaticImageData } from "next/image";

import amasghari from "@/assets/projects/amasghari.webp";
import birlik from "@/assets/projects/birlik.webp";
import blulexi from "@/assets/projects/blulexi.webp";
import earthcatalogue from "@/assets/projects/earthcatalogue.webp";
import mahamIot from "@/assets/projects/maham-iot.webp";
import minexpy from "@/assets/projects/minexpy.webp";
import naar from "@/assets/projects/naar.webp";
import samiraarts from "@/assets/projects/samiraarts.webp";

/**
 * Screenshots by project slug (see scripts/capture-project-screenshots.ts).
 * A project missing here renders a placeholder tile and panel (Karmania has no
 * website yet). To add one: capture it as assets/projects/<slug>.webp, import
 * it, and register it below.
 */
export const projectShots: Readonly<Record<string, StaticImageData>> = {
  amasghari,
  birlik,
  blulexi,
  earthcatalogue,
  "maham-iot": mahamIot,
  minexpy,
  naar,
  samiraarts,
};
