import type { TerminalOutputLine } from "@/lib/terminal/evaluate";

export const MAX_COMMAND_HISTORY = 100;
export const MAX_TRANSCRIPT_LINES = 200;

export type TranscriptEntry = {
  id: number;
  command: string;
  tone: "output" | "error";
  lines: TerminalOutputLine[];
};

export function appendTranscript(
  entries: TranscriptEntry[],
  entry: TranscriptEntry,
) {
  const combined = [...entries, entry];
  const bounded: TranscriptEntry[] = [];
  let remaining = MAX_TRANSCRIPT_LINES;

  for (
    let index = combined.length - 1;
    index >= 0 && remaining > 0;
    index -= 1
  ) {
    const current = combined[index];
    const lineBudget = Math.max(remaining - 1, 0);
    const lines =
      current.lines.length > lineBudget
        ? current.lines.slice(current.lines.length - lineBudget)
        : current.lines;
    bounded.unshift({ ...current, lines });
    remaining -= 1 + lines.length;
  }

  return bounded;
}

export function appendCommandHistory(history: string[], command: string) {
  return [...history, command].slice(-MAX_COMMAND_HISTORY);
}
