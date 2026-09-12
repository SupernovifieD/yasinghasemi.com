import { describe, expect, it } from "vitest";

import {
  parsePostFrontmatter,
  validatePostCollection,
} from "@/lib/posts/schema";

const validPost = {
  title: "A real post",
  slug: "a-real-post",
  publishedAt: "2026-05-06",
  excerpt: "A concise excerpt.",
  draft: false,
};

describe("post frontmatter", () => {
  it("accepts the flat published-post model", () => {
    expect(parsePostFrontmatter(validPost)).toEqual(validPost);
  });

  it.each([
    ["empty title", { ...validPost, title: " " }],
    ["impossible date", { ...validPost, publishedAt: "2026-02-30" }],
    ["unsafe slug", { ...validPost, slug: "../post" }],
    ["category field", { ...validPost, category: "projects" }],
    ["tag field", { ...validPost, tags: ["personal"] }],
  ])("rejects %s", (_name, value) => {
    expect(() => parsePostFrontmatter(value)).toThrow();
  });

  it("rejects duplicate slugs", () => {
    expect(() =>
      validatePostCollection([validPost, { ...validPost, title: "Duplicate" }]),
    ).toThrow("Duplicate post slug: a-real-post");
  });

  it("rejects an update date before publication", () => {
    expect(() =>
      parsePostFrontmatter({ ...validPost, updatedAt: "2026-05-05" }),
    ).toThrow();
  });

  it("validates leap days as real calendar dates", () => {
    expect(
      parsePostFrontmatter({ ...validPost, publishedAt: "2024-02-29" }),
    ).toMatchObject({ publishedAt: "2024-02-29" });
    expect(() =>
      parsePostFrontmatter({ ...validPost, publishedAt: "2025-02-29" }),
    ).toThrow();
  });
});
