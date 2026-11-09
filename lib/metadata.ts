import type { Metadata } from "next";

import { defaultSocialImage, type SocialImage } from "@/lib/og-images";
import { siteConfig } from "@/lib/site-config";

/** An image as Open Graph and Twitter cards describe it. */
export function socialImageDescriptor({ image, alt }: SocialImage) {
  return { url: image.src, width: image.width, height: image.height, alt };
}

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultSocialImage,
}: {
  title: string;
  description: string;
  path: string;
  /** The preview image; pages without one share the landing card. */
  image?: SocialImage;
}): Metadata {
  const url = new URL(path, siteConfig.origin).toString();
  const images = [socialImageDescriptor(image)];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
