import { describe, expect, it } from "vitest";

import { createBodyExcerpt } from "@/lib/posts/excerpt";

describe("createBodyExcerpt", () => {
  it("returns short plain text unchanged", () => {
    expect(createBodyExcerpt("A short opening.")).toBe("A short opening.");
  });

  it("strips emphasis, links, inline code, and quote markers", () => {
    const markdown =
      "> This is *very* **important** and uses `code` with a [link](https://example.com).";
    expect(createBodyExcerpt(markdown)).toBe(
      "This is very important and uses code with a link.",
    );
  });

  it("skips headings, images, rules, tables, and fenced code", () => {
    const markdown = [
      "## A heading",
      "",
      "![alt text](/image.png)",
      "",
      "```ts",
      "const hidden = true;",
      "```",
      "",
      "---",
      "",
      "| a | b |",
      "",
      "First real sentence.",
    ].join("\n");
    expect(createBodyExcerpt(markdown)).toBe("First real sentence.");
  });

  it("removes list markers and joins lines", () => {
    expect(createBodyExcerpt("- one\n- two\n1. three")).toBe("one two three");
  });

  it("cuts at a word boundary within the limit and trims trailing punctuation", () => {
    const excerpt = createBodyExcerpt("alpha beta, gamma delta epsilon", 17);
    expect(excerpt).toBe("alpha beta, gamma");
    expect(excerpt.length).toBeLessThanOrEqual(17);
    expect(createBodyExcerpt("alpha beta, gamma delta", 11)).toBe("alpha beta");
  });

  it("hard-cuts a single word longer than the limit", () => {
    expect(createBodyExcerpt("abcdefghij", 4)).toBe("abcd");
  });

  it("returns an empty string when nothing readable remains", () => {
    expect(createBodyExcerpt("## Only a heading")).toBe("");
  });
});
