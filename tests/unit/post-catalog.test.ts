import { describe, expect, it } from "vitest";

import {
  parsePostSource,
  publishedSummaries,
  type Post,
} from "@/lib/posts/catalog";

function post(overrides: Partial<Post> = {}): Post {
  return {
    title: "Post",
    slug: "post",
    publishedAt: "2026-05-06",
    excerpt: "Excerpt",
    draft: false,
    body: "Body",
    ...overrides,
  };
}

describe("post catalog", () => {
  it("parses validated Markdown without exposing frontmatter in the body", () => {
    const parsed = parsePostSource(
      `---
title: Post
slug: post
publishedAt: "2026-05-06"
excerpt: Excerpt
draft: false
---
Body text.
`,
      "post.md",
    );

    expect(parsed.body).toBe("Body text.");
  });

  it("requires the filename and validated slug to agree", () => {
    expect(() =>
      parsePostSource(
        `---
title: Post
slug: post
publishedAt: "2026-05-06"
excerpt: Excerpt
draft: false
---
Body`,
        "different.md",
      ),
    ).toThrow("Post filename mismatch");
  });

  it("excludes drafts and sorts newest first with a slug tie-breaker", () => {
    expect(
      publishedSummaries([
        post({ slug: "older", publishedAt: "2026-05-01" }),
        post({ slug: "z-last", publishedAt: "2026-06-09" }),
        post({ slug: "a-first", publishedAt: "2026-06-09" }),
        post({ slug: "draft", publishedAt: "2026-07-01", draft: true }),
      ]).map(({ slug }) => slug),
    ).toEqual(["a-first", "z-last", "older"]);
  });

  it("omits post bodies from public summaries", () => {
    expect(publishedSummaries([post()])[0]).not.toHaveProperty("body");
  });
});
