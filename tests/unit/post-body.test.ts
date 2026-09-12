import { describe, expect, it } from "vitest";

import { safeMarkdownUrl } from "@/components/post-body";

describe("safeMarkdownUrl", () => {
  it.each([
    ["https://example.com/path", "https://example.com/path"],
    ["mailto:reader@example.com", "mailto:reader@example.com"],
    ["/blog", "/blog"],
    ["#section", "#section"],
    ["relative-page", "relative-page"],
  ])("allows safe link %s", (input, expected) => {
    expect(safeMarkdownUrl(input)).toBe(expected);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///etc/passwd",
    "ftp://external.example/file",
    "//external.example",
    "https:\\external.example",
    "https://example.com\u0000bad",
  ])("rejects unsafe link %s", (input) => {
    expect(safeMarkdownUrl(input)).toBe("");
  });
});
