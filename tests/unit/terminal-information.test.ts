import { describe, expect, it } from "vitest";

import { evaluateInformationCommand } from "@/lib/terminal/evaluate";
import { createPublicRouteRegistry } from "@/lib/terminal/routes";

const registry = createPublicRouteRegistry(["another-post", "known-post"]);

describe("terminal information commands", () => {
  it("prints cwd without navigation", () => {
    expect(evaluateInformationCommand(["pwd"], "/about", registry)).toEqual({
      kind: "output",
      lines: [{ text: "/about" }],
    });
  });

  it("lists root, blog, and leaf routes", () => {
    expect(evaluateInformationCommand(["ls"], "/", registry)).toMatchObject({
      kind: "output",
      lines: [
        { text: "about/", href: "/about" },
        { text: "blog/", href: "/blog" },
        { text: "contact/", href: "/contact" },
        { text: "cookies/", href: "/cookies" },
        { text: "privacy/", href: "/privacy" },
        { text: "terms/", href: "/terms" },
      ],
    });
    expect(
      evaluateInformationCommand(["ls", "/blog"], "/about", registry),
    ).toMatchObject({
      kind: "output",
      lines: [
        { text: "another-post/", href: "/blog/another-post" },
        { text: "known-post/", href: "/blog/known-post" },
      ],
    });
    expect(
      evaluateInformationCommand(["ls"], "/blog/known-post", registry),
    ).toEqual({ kind: "output", lines: [] });
  });

  it("reports invalid paths, flags, and argument counts", () => {
    expect(evaluateInformationCommand(["ls", "--all"], "/", registry)).toEqual({
      kind: "error",
      message: "ls: flags are not supported",
    });
    expect(
      evaluateInformationCommand(["ls", "/missing"], "/about", registry),
    ).toMatchObject({ kind: "error" });
    expect(evaluateInformationCommand(["pwd", "extra"], "/", registry)).toEqual(
      { kind: "error", message: "usage: pwd" },
    );
    expect(
      evaluateInformationCommand(["ls", "one", "two"], "/", registry),
    ).toEqual({ kind: "error", message: "usage: ls [path]" });
  });

  it("describes only the supported navigation shell", () => {
    const result = evaluateInformationCommand(["help"], "/", registry);
    expect(result).toMatchObject({ kind: "output" });
    expect(JSON.stringify(result)).toContain("not a server terminal");
    expect(JSON.stringify(result)).toContain("cd blog is relative");
  });

  it("returns null for commands handled by another evaluator", () => {
    expect(evaluateInformationCommand(["cd", "/"], "/", registry)).toBeNull();
  });
});
