import { describe, expect, it } from "vitest";

import {
  appendCommandHistory,
  createTerminalOutput,
  MAX_COMMAND_HISTORY,
  MAX_OUTPUT_LINES,
} from "@/lib/terminal/session";

describe("terminal session bounds", () => {
  it("keeps only the newest recalled commands", () => {
    const commands = Array.from(
      { length: MAX_COMMAND_HISTORY + 5 },
      (_, index) => `command-${index}`,
    );
    const history = commands.reduce(appendCommandHistory, []);

    expect(history).toHaveLength(MAX_COMMAND_HISTORY);
    expect(history[0]).toBe("command-5");
  });

  it("bounds a single result without storing command echoes", () => {
    const lines = Array.from({ length: MAX_OUTPUT_LINES + 5 }, (_, index) => ({
      text: `line-${index}`,
    }));
    const output = createTerminalOutput("output", lines);
    expect(output?.lines).toEqual(lines.slice(0, MAX_OUTPUT_LINES));
    expect(Object.keys(output!)).toEqual(["tone", "lines"]);
    expect(lines).toHaveLength(MAX_OUTPUT_LINES + 5);
  });

  it("collapses empty output", () => {
    expect(createTerminalOutput("output", [])).toBeNull();
  });

  it("preserves result links and error tone", () => {
    const lines = [{ text: "about/", href: "/about" }];
    expect(createTerminalOutput("output", lines)).toEqual({
      tone: "output",
      lines,
    });
    expect(createTerminalOutput("error", [{ text: "Try help." }])).toEqual({
      tone: "error",
      lines: [{ text: "Try help." }],
    });
  });
});
