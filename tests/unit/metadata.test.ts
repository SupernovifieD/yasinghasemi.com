import { describe, expect, it, vi } from "vitest";

// Vitest turns an image import into a URL string; Next gives an object with
// its size. Stand in for the real card.
vi.mock("@/lib/og-images", () => ({
  defaultSocialImage: {
    image: { src: "/cards/default.png", width: 1200, height: 630 },
    alt: "The default card",
  },
}));

import { createPageMetadata } from "@/lib/metadata";

describe("createPageMetadata", () => {
  const base = { title: "Page", description: "About it.", path: "/page" };

  it("keeps the title, description, canonical URL and Open Graph basics", () => {
    const metadata = createPageMetadata(base);

    expect(metadata.title).toBe("Page");
    expect(metadata.description).toBe("About it.");
    expect(metadata.alternates?.canonical).toBe(
      "https://yasinghasemi.com/page",
    );
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      siteName: "yasinghasemi.com",
      title: "Page",
      description: "About it.",
      url: "https://yasinghasemi.com/page",
    });
  });

  it("shares the default card with every page that has no image", () => {
    const metadata = createPageMetadata(base);
    const card = {
      url: "/cards/default.png",
      width: 1200,
      height: 630,
      alt: "The default card",
    };

    expect(metadata.openGraph?.images).toEqual([card]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [card],
    });
  });

  it("uses a page's own image instead, for Open Graph and Twitter", () => {
    const metadata = createPageMetadata({
      ...base,
      image: {
        image: { src: "/shots/own.png", width: 480, height: 270 },
        alt: "Its own",
      },
    });
    const own = {
      url: "/shots/own.png",
      width: 480,
      height: 270,
      alt: "Its own",
    };

    expect(metadata.openGraph?.images).toEqual([own]);
    expect(metadata.twitter).toMatchObject({ images: [own] });
  });
});
