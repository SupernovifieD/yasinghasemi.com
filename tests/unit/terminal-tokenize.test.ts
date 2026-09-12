import { describe, expect, it } from "vitest";

import { MAX_COMMAND_LENGTH, tokenizeCommand } from "@/lib/terminal/tokenize";

describe("tokenizeCommand", () => {
  it.each([
    ["  pwd  ", ["pwd"]],
    ["cd about", ["cd", "about"]],
    ['cd "about"', ["cd", "about"]],
    ["cd 'path with spaces'", ["cd", "path with spaces"]],
    ['ls "/blog"', ["ls", "/blog"]],
    ["   ", []],
  ])("tokenizes %s", (input, tokens) => {
    expect(tokenizeCommand(input)).toEqual({ ok: true, tokens });
  });

  it("preserves an explicitly empty quoted argument", () => {
    expect(tokenizeCommand('cd ""')).toEqual({
      ok: true,
      tokens: ["cd", ""],
    });
  });

  it.each([
    ['cd "unclosed', "unclosed quote"],
    ["pwd\nls", "submit one single-line command"],
    ["pwd\rls", "submit one single-line command"],
    ["pwd\u0000", "control characters are not supported"],
    ["pwd\u007f", "control characters are not supported"],
    ["cd /blog; ls", "shell operators and expansion are not supported"],
    ["cd /blog && pwd", "shell operators and expansion are not supported"],
    ["pwd | less", "shell operators and expansion are not supported"],
    ["pwd > output", "shell operators and expansion are not supported"],
    ["echo $(pwd)", "shell operators and expansion are not supported"],
    ["echo \x60pwd\x60", "shell operators and expansion are not supported"],
    ["echo $HOME", "shell operators and expansion are not supported"],
    ["ls *.md", "shell operators and expansion are not supported"],
    ["cd ..\\about", "shell operators and expansion are not supported"],
    ["ls [ab]", "shell operators and expansion are not supported"],
    ["<script>", "shell operators and expansion are not supported"],
  ])("rejects %s", (input, message) => {
    expect(tokenizeCommand(input)).toEqual({ ok: false, message });
  });

  it("enforces the input bound", () => {
    expect(tokenizeCommand("a".repeat(MAX_COMMAND_LENGTH + 1))).toEqual({
      ok: false,
      message: "command exceeds 1024 characters",
    });
  });
});
