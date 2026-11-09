import { describe, expect, it } from "vitest";

import { projects } from "@/lib/projects";

describe("projects", () => {
  it("has unique slugs usable as screenshot file names", () => {
    const slugs = projects.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("links every project over https", () => {
    for (const { url } of projects) {
      expect(new URL(url).protocol).toBe("https:");
    }
  });
});
