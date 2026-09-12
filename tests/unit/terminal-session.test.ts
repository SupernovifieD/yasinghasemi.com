import { describe, expect, it } from "vitest";

import {
  appendCommandHistory,
  appendTranscript,
  MAX_COMMAND_HISTORY,
  MAX_TRANSCRIPT_LINES,
  type TranscriptEntry,
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

  it("bounds transcript command and output lines", () => {
    const entries = Array.from({ length: 120 }, (_, id) => ({
      id,
      command: `command-${id}`,
      tone: "output" as const,
      lines: [{ text: "one" }, { text: "two" }],
    }));
    const bounded = entries.reduce<TranscriptEntry[]>(appendTranscript, []);
    const lineCount = bounded.reduce(
      (total, entry) => total + 1 + entry.lines.length,
      0,
    );

    expect(lineCount).toBeLessThanOrEqual(MAX_TRANSCRIPT_LINES);
    expect(bounded.at(-1)?.id).toBe(119);
    expect(bounded[0].id).toBeGreaterThan(0);
  });
});
