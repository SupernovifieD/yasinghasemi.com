import type { StaticImageData } from "next/image";

import defaultCard from "@/assets/og/default.png";
import howNetradarWasStarted from "@/assets/og/posts/how-netradar-was-started.png";
import theStoryOfThisBlog from "@/assets/og/posts/the-story-of-this-blog.png";
import threeFastWeeks from "@/assets/og/posts/three-fast-weeks-and-a-first-taste-of-paid-programming.png";
import whenMpmBecomesADecisionMarathon from "@/assets/og/posts/when-mpm-becomes-a-decision-marathon.png";
import whyIStartedMineralProspectivityMapping from "@/assets/og/posts/why-i-started-mineral-prospectivity-mapping.png";

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

/**
 * One card per published post, keyed by slug: `pnpm exec tsx
 * scripts/generate-og-images.ts posts`, then import the new file here. A unit
 * test fails for a published post that is missing.
 */
export const postCards: Readonly<Record<string, StaticImageData>> = {
  "how-netradar-was-started": howNetradarWasStarted,
  "the-story-of-this-blog": theStoryOfThisBlog,
  "three-fast-weeks-and-a-first-taste-of-paid-programming": threeFastWeeks,
  "when-mpm-becomes-a-decision-marathon": whenMpmBecomesADecisionMarathon,
  "why-i-started-mineral-prospectivity-mapping":
    whyIStartedMineralProspectivityMapping,
};

/** A post's card, or the landing card should one be missing. */
export function postSocialImage(post: {
  slug: string;
  title: string;
}): SocialImage {
  const card = postCards[post.slug];
  if (!card) return defaultSocialImage;

  return { image: card, alt: `${post.title}, a post on yasinghasemi.com` };
}
