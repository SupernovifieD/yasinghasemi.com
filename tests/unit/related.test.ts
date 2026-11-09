import { describe, expect, it } from "vitest";

import { relatedPosts, type PostSummary } from "@/lib/posts/catalog";
import { itemsAfter } from "@/lib/related";
import { projects, projectsInCategory, relatedProjects } from "@/lib/projects";

describe("itemsAfter", () => {
  const items = ["a", "b", "c", "d", "e"];

  it("takes the next items in order, wrapping at the end", () => {
    expect(itemsAfter(items, 0)).toEqual(["b", "c", "d"]);
    expect(itemsAfter(items, 3)).toEqual(["e", "a", "b"]);
    expect(itemsAfter(items, 4)).toEqual(["a", "b", "c"]);
  });

  it("never includes the item itself, so a short list gives fewer", () => {
    expect(itemsAfter(["a", "b"], 0)).toEqual(["b"]);
    expect(itemsAfter(["a", "b", "c"], 1)).toEqual(["c", "a"]);
    expect(itemsAfter(items, 2, 10)).toEqual(["d", "e", "a", "b"]);
  });

  it("gives nothing for a single item, an empty list or a bad index", () => {
    expect(itemsAfter(["a"], 0)).toEqual([]);
    expect(itemsAfter([], 0)).toEqual([]);
    expect(itemsAfter(items, -1)).toEqual([]);
    expect(itemsAfter(items, 5)).toEqual([]);
    expect(itemsAfter(items, 1.5)).toEqual([]);
  });
});

describe("relatedProjects", () => {
  it("lists the next projects of the same category, in order", () => {
    expect(relatedProjects("blulexi").map(({ slug }) => slug)).toEqual([
      "earthcatalogue",
      "naar",
      "minexpy",
    ]);
    expect(relatedProjects("karmania").map(({ slug }) => slug)).toEqual([
      "blulexi",
      "earthcatalogue",
      "naar",
    ]);
    expect(relatedProjects("samiraarts").map(({ slug }) => slug)).toEqual([
      "amasghari",
      "maham-iot",
      "birlik",
    ]);
  });

  it("gives every project three others from its own category", () => {
    for (const project of projects) {
      const related = relatedProjects(project.slug);
      expect(related, project.slug).toHaveLength(3);
      expect(related.map(({ slug }) => slug)).not.toContain(project.slug);
      for (const other of related) {
        expect(other.category, project.slug).toBe(project.category);
      }
      expect(new Set(related.map(({ slug }) => slug)).size).toBe(3);
      expect(projectsInCategory(project.category).length).toBeGreaterThan(3);
    }
  });

  it("gives nothing for an unknown project", () => {
    expect(relatedProjects("nope")).toEqual([]);
  });
});

describe("relatedPosts", () => {
  const post = (slug: string): PostSummary => ({
    title: slug,
    slug,
    publishedAt: "2026-05-06",
    excerpt: "Excerpt",
    draft: false,
  });
  const posts = ["newest", "newer", "older", "oldest", "first"].map(post);

  it("follows the newest-first list and wraps to the newest", () => {
    expect(relatedPosts(posts, "newest").map(({ slug }) => slug)).toEqual([
      "newer",
      "older",
      "oldest",
    ]);
    expect(relatedPosts(posts, "oldest").map(({ slug }) => slug)).toEqual([
      "first",
      "newest",
      "newer",
    ]);
  });

  it("gives nothing for an unknown slug", () => {
    expect(relatedPosts(posts, "nope")).toEqual([]);
  });
});
