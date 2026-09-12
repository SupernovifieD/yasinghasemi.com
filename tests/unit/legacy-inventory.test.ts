import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import {
  assertSafeArchivePath,
  inventoryLegacyArchive,
} from "@/scripts/migrate-legacy-posts";

describe("legacy archive inventory", () => {
  it.each([
    "/absolute",
    "../escape",
    "root/../escape",
    "C:/escape",
    "root\\file",
  ])("rejects unsafe member path %s", (path) => {
    expect(() => assertSafeArchivePath(path)).toThrow("Unsafe archive member");
  });

  it("parses authoritative article metadata without executing content", async () => {
    const zip = new JSZip();
    zip.file(
      "archive/mydocuments/post/post.html",
      `<article data-published="2026-06-09" data-subtitle="Excerpt">
        <h1>Title</h1><h2>Heading</h2><p>One</p><p>Two</p>
        <a href="https://example.com">Link</a><script>throw new Error("no")</script>
      </article>`,
    );
    zip.file("archive/desktop/about.html", "<h1>Not a post</h1>");

    const inventory = await inventoryLegacyArchive(
      await zip.generateAsync({ type: "nodebuffer" }),
    );

    expect(inventory.articleCount).toBe(1);
    expect(inventory.articles[0]).toEqual({
      sourcePath: "mydocuments/post/post.html",
      title: "Title",
      publishedAt: "2026-06-09",
      excerpt: "Excerpt",
      headings: ["Heading"],
      paragraphCount: 2,
      links: ["https://example.com"],
    });
  });
});
