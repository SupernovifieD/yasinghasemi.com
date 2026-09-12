export const MAX_COMMAND_LENGTH = 1_024;

export type TokenizeResult =
  { ok: true; tokens: string[] } | { ok: false; message: string };

const unsupportedShellSyntax = new RegExp("[;&|<>$\\x60\\\\*?[\\]{}]");

export function tokenizeCommand(input: string): TokenizeResult {
  if (input.length > MAX_COMMAND_LENGTH) {
    return { ok: false, message: "command exceeds 1024 characters" };
  }
  if (/[\r\n]/.test(input)) {
    return { ok: false, message: "submit one single-line command" };
  }
  if (/[\u0000-\u001f\u007f]/.test(input)) {
    return { ok: false, message: "control characters are not supported" };
  }
  if (unsupportedShellSyntax.test(input)) {
    return {
      ok: false,
      message: "shell operators and expansion are not supported",
    };
  }

  const tokens: string[] = [];
  let token = "";
  let tokenStarted = false;
  let quote: "'" | '"' | null = null;

  for (const character of input.trim()) {
    if (quote) {
      if (character === quote) {
        quote = null;
      } else {
        token += character;
      }
      tokenStarted = true;
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      tokenStarted = true;
      continue;
    }

    if (/\s/.test(character)) {
      if (tokenStarted) {
        tokens.push(token);
        token = "";
        tokenStarted = false;
      }
      continue;
    }

    token += character;
    tokenStarted = true;
  }

  if (quote) {
    return { ok: false, message: "unclosed quote" };
  }
  if (tokenStarted) tokens.push(token);

  return { ok: true, tokens };
}
