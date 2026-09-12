import { describe, expect, it } from "vitest";

import { evaluateCdCommand } from "@/lib/terminal/evaluate";
import { createPublicRouteRegistry } from "@/lib/terminal/routes";

const registry = createPublicRouteRegistry(["known-post"]);

describe("terminal cd command", () => {
  it.each([
    ["/", ["cd", "about"], null, "/about", true],
    ["/about", ["cd", "/blog"], "/", "/blog", true],
    ["/about", ["cd", "../blog"], "/", "/blog", true],
    ["/blog", ["cd", "known-post"], "/", "/blog/known-post", true],
    ["/blog/known-post", ["cd", ".."], "/blog", "/blog", true],
    ["/about", ["cd", ".."], null, "/", true],
    ["/", ["cd", ".."], null, "/", false],
    ["/blog", ["cd"], "/about", "/", true],
    ["/blog", ["cd", "~"], "/about", "/", true],
    ["/about", ["cd", "~/blog"], "/", "/blog", true],
    ["/about", ["cd", "."], "/", "/about", false],
    ["/", ["cd", "blog/../about"], null, "/about", true],
    ["/unknown", ["cd", "/"], null, "/", true],
  ])("navigates from %s using %j", (cwd, tokens, previous, href, changed) => {
    expect(evaluateCdCommand(tokens, cwd, previous, registry)).toEqual({
      kind: "navigate",
      href,
      changed,
      lines: [],
    });
  });

  it("prints and returns to the previous directory", () => {
    expect(evaluateCdCommand(["cd", "-"], "/blog", "/about", registry)).toEqual(
      {
        kind: "navigate",
        href: "/about",
        changed: true,
        lines: [{ text: "/about" }],
      },
    );
  });

  it("supports predictable cd - toggling when the adapter swaps cwd", () => {
    const first = evaluateCdCommand(["cd", "-"], "/blog", "/about", registry);
    expect(first).toMatchObject({ kind: "navigate", href: "/about" });
    const second = evaluateCdCommand(["cd", "-"], "/about", "/blog", registry);
    expect(second).toMatchObject({ kind: "navigate", href: "/blog" });
  });

  it("keeps state unchanged on failures", () => {
    expect(evaluateCdCommand(["cd", "-"], "/", null, registry)).toEqual({
      kind: "error",
      message: "cd: previous directory not set",
    });
    expect(
      evaluateCdCommand(["cd", "missing/../about"], "/", null, registry),
    ).toMatchObject({
      kind: "error",
    });
    expect(evaluateCdCommand(["cd", "blog"], "/about", "/", registry)).toEqual({
      kind: "error",
      message: "cd: no such directory: /about/blog. Try cd /blog.",
    });
  });

  it("rejects excessive arguments, unsupported flags, and empty quoted paths", () => {
    expect(
      evaluateCdCommand(["cd", "one", "two"], "/", null, registry),
    ).toEqual({
      kind: "error",
      message: "usage: cd [path]",
    });
    expect(evaluateCdCommand(["cd", "--help"], "/", null, registry)).toEqual({
      kind: "error",
      message: "cd: flags are not supported",
    });
    expect(evaluateCdCommand(["cd", ""], "/", null, registry)).toEqual({
      kind: "error",
      message: "cd: no such directory",
    });
  });
});
