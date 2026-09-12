import { describe, expect, it } from "vitest";

import {
  getLegacyDirectRedirects,
  legacyArticleRoutes,
  matchLegacyHash,
} from "@/lib/legacy-routes";

describe("legacy routes", () => {
  it("maps every old article URL to one unique canonical post", () => {
    expect(legacyArticleRoutes).toHaveLength(5);
    expect(
      new Set(legacyArticleRoutes.map((route) => route.directPath)).size,
    ).toBe(5);
    expect(
      new Set(legacyArticleRoutes.map((route) => route.canonicalPath)).size,
    ).toBe(5);
    expect(getLegacyDirectRedirects()).toHaveLength(5);
  });

  it("matches known post and folder hashes", () => {
    expect(matchLegacyHash("#/docs/0-thebeginning")).toEqual({
      kind: "redirect",
      href: "/blog/the-story-of-this-blog",
    });
    expect(matchLegacyHash("#%2Fdocs%2FJournal%2F06-09-2026%2F")).toEqual({
      kind: "redirect",
      href: "/blog/three-fast-weeks-and-a-first-taste-of-paid-programming",
    });
    expect(matchLegacyHash("#/docs/1-NetRadar/2026-05-03")).toEqual({
      kind: "redirect",
      href: "/blog",
    });
  });

  it("distinguishes unknown document hashes from normal anchors", () => {
    expect(matchLegacyHash("#/docs/missing")).toEqual({ kind: "unknown" });
    expect(matchLegacyHash("#heading")).toBeNull();
    expect(matchLegacyHash("#https://external.example")).toBeNull();
  });

  it.each([
    "#%E0%A4%A",
    "#//external.example",
    "#/docs\\post",
    "#/docs/post?next=https://external.example",
    "#%252Fdocs%252F0-thebeginning",
  ])("rejects malformed or unsafe hash %s", (hash) => {
    expect(matchLegacyHash(hash)).toBeNull();
  });
});
