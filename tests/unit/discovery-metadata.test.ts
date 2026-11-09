import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("publishing discovery metadata", () => {
  it("includes canonical pages and every published post only", () => {
    const urls = sitemap().map(({ url }) => url);

    // 7 pages (home, about, contact, blog, projects, privacy, terms), 9
    // project pages, and every published post.
    expect(urls).toHaveLength(21);
    expect(urls).toContain("https://yasinghasemi.com/projects");
    expect(urls).toContain("https://yasinghasemi.com/projects/blulexi");
    expect(urls).toContain("https://yasinghasemi.com/projects/karmania");
    expect(urls).toContain("https://yasinghasemi.com/");
    expect(urls).toContain("https://yasinghasemi.com/blog");
    expect(urls).toContain(
      "https://yasinghasemi.com/blog/three-fast-weeks-and-a-first-taste-of-paid-programming",
    );
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
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
