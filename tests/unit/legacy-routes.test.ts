import { describe, expect, it } from "vitest";

import {
  getLegacyStaticRedirects,
  legacyArticleRoutes,
  matchLegacyHash,
} from "@/lib/legacy-routes";
import {
  getStaticRedirectOutputs,
  renderStaticRedirect,
} from "@/lib/static-redirects";

describe("legacy routes", () => {
  it("maps every old article URL to one unique canonical post", () => {
    expect(legacyArticleRoutes).toHaveLength(5);
    expect(
      new Set(legacyArticleRoutes.map((route) => route.directPath)).size,
    ).toBe(5);
    expect(
      new Set(legacyArticleRoutes.map((route) => route.canonicalPath)).size,
    ).toBe(5);
    expect(getLegacyStaticRedirects()).toHaveLength(5);
  });

  it("generates one safe static redirect document per old html route", () => {
    const outputs = getStaticRedirectOutputs();

    expect(outputs).toHaveLength(5);
    for (const output of outputs) {
      expect(output.outputPath).toMatch(/^mydocuments\/.+\.html$/);
      expect(output.content).toContain(
        `<link rel="canonical" href="https://yasinghasemi.com${output.canonicalPath}">`,
      );
      expect(output.content).toContain(
        `window.location.replace(${JSON.stringify(output.canonicalPath)})`,
      );
      expect(output.content).not.toContain("javascript:");
    }
  });

  it.each([
    "javascript:alert(1)",
    "//example.com",
    "/blog/../admin",
    "/blog/<script>",
  ])("rejects unsafe static redirect target %s", (target) => {
    expect(() => renderStaticRedirect(target)).toThrow(
      "Unsafe canonical redirect path",
    );
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
