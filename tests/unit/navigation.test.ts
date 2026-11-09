import { describe, expect, it } from "vitest";

import { isActivePath } from "@/lib/navigation";
import { primaryNavigation } from "@/lib/site-config";

describe("primary navigation", () => {
  it("lists the four sections in order with slash-prefixed labels", () => {
    expect(primaryNavigation.map(({ href }) => href)).toEqual([
      "/projects",
      "/blog",
      "/about",
      "/contact",
    ]);
    for (const { href, label } of primaryNavigation) {
      expect(label).toBe(href);
    }
  });

  it("marks a route active on its own path and nested paths only", () => {
    expect(isActivePath("/blog", "/blog")).toBe(true);
    expect(isActivePath("/blog/a-post", "/blog")).toBe(true);
    expect(isActivePath("/about", "/blog")).toBe(false);
    expect(isActivePath("/blogger", "/blog")).toBe(false);
    expect(isActivePath("/", "/blog")).toBe(false);
  });
});
