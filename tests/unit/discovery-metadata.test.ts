import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("publishing discovery metadata", () => {
  it("includes canonical pages and every published post only", () => {
    const urls = sitemap().map(({ url }) => url);

    expect(urls).toHaveLength(12);
    expect(urls).toContain("https://yasinghasemi.com/");
    expect(urls).toContain("https://yasinghasemi.com/blog");
    expect(urls).toContain(
      "https://yasinghasemi.com/blog/three-fast-weeks-and-a-first-taste-of-paid-programming",
    );
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
    expect(urls.some((url) => url.includes("mydocuments"))).toBe(false);
    expect(urls.some((url) => url.includes("category"))).toBe(false);
  });

  it("allows the fully public static site", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://yasinghasemi.com/sitemap.xml",
    });
  });
});
