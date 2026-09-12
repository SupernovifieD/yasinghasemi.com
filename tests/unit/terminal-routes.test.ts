import { describe, expect, it } from "vitest";

import {
  createPublicRouteRegistry,
  isPublicPath,
  listPublicChildren,
} from "@/lib/terminal/routes";

describe("public terminal route registry", () => {
  const registry = createPublicRouteRegistry(["second-post", "first-post"]);

  it("lists only the six public root routes", () => {
    expect(listPublicChildren(registry, "/")).toEqual([
      { label: "about/", href: "/about" },
      { label: "blog/", href: "/blog" },
      { label: "contact/", href: "/contact" },
      { label: "cookies/", href: "/cookies" },
      { label: "privacy/", href: "/privacy" },
      { label: "terms/", href: "/terms" },
    ]);
  });

  it("derives sorted blog children from published slugs", () => {
    expect(listPublicChildren(registry, "/blog")).toEqual([
      { label: "first-post/", href: "/blog/first-post" },
      { label: "second-post/", href: "/blog/second-post" },
    ]);
    expect(listPublicChildren(registry, "/blog/first-post")).toEqual([]);
  });

  it("never exposes an API or source path", () => {
    expect(isPublicPath(registry, "/api/visitor")).toBe(false);
    expect(isPublicPath(registry, "/content/posts/first-post.md")).toBe(false);
  });

  it.each(["../escape", "draft/post", "UPPERCASE", "", "post.html"])(
    "rejects unsafe slug %s",
    (slug) => {
      expect(() => createPublicRouteRegistry([slug])).toThrow();
    },
  );

  it("rejects duplicate slugs", () => {
    expect(() => createPublicRouteRegistry(["same", "same"])).toThrow(
      "Duplicate public post slug",
    );
  });
});
