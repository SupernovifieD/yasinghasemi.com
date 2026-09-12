import { describe, expect, it } from "vitest";

import { resolvePublicPath } from "@/lib/terminal/resolve-path";
import { createPublicRouteRegistry } from "@/lib/terminal/routes";

const registry = createPublicRouteRegistry(["known-post"]);

describe("resolvePublicPath", () => {
  it.each([
    ["/", "blog", "/blog"],
    ["/about", "/blog", "/blog"],
    ["/about", "../blog", "/blog"],
    ["/blog", "known-post", "/blog/known-post"],
    ["/blog/known-post", "..", "/blog"],
    ["/about", "..", "/"],
    ["/", "..", "/"],
    ["/about", ".", "/about"],
    ["/about", "~", "/"],
    ["/about", "~/blog", "/blog"],
    ["/", "blog/../about", "/about"],
    ["/", "../../../about", "/about"],
    ["/", "///about", null],
    ["/", "/blog//known-post/", "/blog/known-post"],
    ["/", "/blog/%6bnown-post", "/blog/known-post"],
  ])("resolves %s + %s", (cwd, input, expected) => {
    const result = resolvePublicPath(registry, cwd, input);
    if (expected === null) {
      expect(result.ok).toBe(false);
    } else {
      expect(result).toEqual({
        ok: true,
        path: expected,
        changed: expected !== cwd,
      });
    }
  });

  it("fails immediately on a missing intermediate segment", () => {
    expect(resolvePublicPath(registry, "/", "missing/../about")).toEqual({
      ok: false,
      message: "no such directory: /missing",
    });
  });

  it("allows absolute recovery from an unknown browser route", () => {
    expect(resolvePublicPath(registry, "/unknown", "/")).toEqual({
      ok: true,
      path: "/",
      changed: true,
    });
    expect(resolvePublicPath(registry, "/unknown", "blog").ok).toBe(false);
  });

  it.each([
    "//external.example",
    "https://external.example",
    "javascript:alert(1)",
    "/blog\\..\\about",
    "/blog?next=/about",
    "/blog#heading",
    "/blog%252Fknown-post",
    "%E0%A4%A",
    "/blog\u0000/about",
  ])("rejects unsafe path %s", (input) => {
    expect(resolvePublicPath(registry, "/", input).ok).toBe(false);
  });

  it("does not expose utility routes or server paths", () => {
    expect(resolvePublicPath(registry, "/", "/api/visitor").ok).toBe(false);
    expect(resolvePublicPath(registry, "/", "/etc/passwd").ok).toBe(false);
  });

  it("does not infer children beneath public leaf routes", () => {
    expect(resolvePublicPath(registry, "/about", "child")).toEqual({
      ok: false,
      message: "no such directory: /about/child",
    });
  });
});
