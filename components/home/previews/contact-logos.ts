import {
  bootstrapGlyphs,
  GLYPH_SIZE,
} from "@/components/icons/bootstrap-icons";
import { siteConfig } from "@/lib/site-config";

// The glyph outlines (Bootstrap Icons, MIT) and their licence notice live in
// components/icons/bootstrap-icons.ts. The logos remain trademarks of their
// respective owners; they are used here only to link to the owner's own
// profiles.
export { GLYPH_SIZE };

const glyphs = bootstrapGlyphs;

export type ContactLogoId = "github" | "email" | "linkedin";

export type ContactLogo = {
  id: ContactLogoId;
  label: string;
  href: string;
  /** Glyph outline, a path in a 16 x 16 box. */
  path: string;
  /**
   * Resting position on the stage in -1..1 coordinates (x right, y up). The
   * 3D scene and the no-WebGL fallback both place logos from these numbers.
   */
  at: { x: number; y: number };
};

export const contactLogos: readonly ContactLogo[] = [
  {
    id: "github",
    label: "GitHub",
    href: siteConfig.social.github,
    path: glyphs.github,
    at: { x: -0.36, y: 0.52 },
  },
  {
    id: "email",
    label: `Email ${siteConfig.email.label}`,
    href: siteConfig.email.href,
    path: glyphs.email,
    at: { x: 0.4, y: 0.02 },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: siteConfig.social.linkedin,
    path: glyphs.linkedin,
    at: { x: -0.28, y: -0.52 },
  },
];
