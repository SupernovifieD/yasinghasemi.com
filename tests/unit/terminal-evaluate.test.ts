import { describe, expect, it } from "vitest";

import { evaluateCommand } from "@/lib/terminal/evaluate";
import { createPublicRouteRegistry } from "@/lib/terminal/routes";

const registry = createPublicRouteRegistry(["known-post"]);
const run = (input: string) =>
  evaluateCommand({
    input,
    cwd: "/",
    previousDirectory: null,
    registry,
  });

describe("terminal command evaluation", () => {
  it("treats blank input as a no-op", () => {
    expect(run("   ")).toEqual({ kind: "noop" });
  });

  it("clears output without returning a navigation intent", () => {
    expect(run("clear")).toEqual({ kind: "clear" });
    expect(run("clear now")).toEqual({
      kind: "error",
      message: "usage: clear",
    });
  });

  it("returns exact safe unknown-command feedback", () => {
    expect(run("unknown argument")).toEqual({
      kind: "error",
      message: "unknown: command not found. Type help for available commands.",
    });
    expect(run("HELP")).toEqual({
      kind: "error",
      message: "HELP: command not found. Type help for available commands.",
    });
  });

  it.each([
    "cd /blog; ls",
    "cd /blog && pwd",
    "cd /blog || pwd",
    "pwd | less",
    "pwd > output",
    "pwd < input",
    "echo $(pwd)",
    "echo \x60pwd\x60",
    "echo $HOME",
    "ls *.md",
    "cd /blog\npwd",
    "<img src=x onerror=alert(1)>",
  ])("never partially evaluates dangerous syntax: %s", (input) => {
    expect(run(input)).toMatchObject({ kind: "error" });
    expect(run(input).kind).not.toBe("navigate");
  });

  it("rejects URL schemes and protocol-relative paths", () => {
    expect(run("cd javascript:alert(1)")).toMatchObject({ kind: "error" });
    expect(run("cd https://external.example")).toMatchObject({ kind: "error" });
    expect(run("cd //external.example")).toMatchObject({ kind: "error" });
  });
});
