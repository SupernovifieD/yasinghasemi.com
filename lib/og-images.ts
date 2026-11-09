import type { StaticImageData } from "next/image";

import defaultCard from "@/assets/og/default.png";

/** What a social preview needs of an image: where it is and how big. */
export type ImageSource = Pick<StaticImageData, "src" | "width" | "height">;

export type SocialImage = {
  image: ImageSource;
  alt: string;
};

/** The card (see scripts/generate-og-images.ts) for pages with no image of their own. */
export const defaultSocialImage: SocialImage = {
  image: defaultCard,
  alt: "Yasin Ghasemi, software and web development. yasinghasemi.com",
};
