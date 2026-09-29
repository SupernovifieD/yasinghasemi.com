import type { TerminalOutputLine } from "@/lib/terminal/evaluate";

export const MAX_COMMAND_HISTORY = 100;
export const MAX_OUTPUT_LINES = 200;

export type TerminalOutput = {
  tone: "output" | "error";
  lines: TerminalOutputLine[];
};

export function createTerminalOutput(
  tone: TerminalOutput["tone"],
  lines: TerminalOutput["lines"],
): TerminalOutput | null {
  return lines.length
    ? { tone, lines: lines.slice(0, MAX_OUTPUT_LINES) }
    : null;
}

export function appendCommandHistory(history: string[], command: string) {
  return [...history, command].slice(-MAX_COMMAND_HISTORY);
}
