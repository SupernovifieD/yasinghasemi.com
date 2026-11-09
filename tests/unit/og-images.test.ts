import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { parsePostSource } from "@/lib/posts/catalog";
import { postCards } from "@/lib/og-images";

const root = process.cwd();
const postsDirectory = join(root, "content", "posts");
const cardsDirectory = join(root, "assets", "og", "posts");

const publishedSlugs = readdirSync(postsDirectory)
  .filter((name) => name.endsWith(".md"))
  .map((name) =>
    parsePostSource(readFileSync(join(postsDirectory, name), "utf8"), name),
  )
  .filter(({ draft }) => !draft)
  .map(({ slug }) => slug)
  .toSorted();

describe("social cards", () => {
  it("exist for every published post, and only those", () => {
    expect(Object.keys(postCards).toSorted()).toEqual(publishedSlugs);
  });

  it("have a file per registered post and no orphan files", () => {
    const files = readdirSync(cardsDirectory).filter((name) =>
      name.endsWith(".png"),
    );
    expect(files.map((name) => name.replace(/\.png$/, "")).toSorted()).toEqual(
      publishedSlugs,
    );
  });

  it("are 1200 by 630 PNGs, including the landing card", async () => {
    const files = [
      join(root, "assets", "og", "default.png"),
      ...publishedSlugs.map((slug) => join(cardsDirectory, `${slug}.png`)),
    ];

    for (const file of files) {
      const { width, height, format } = await sharp(file).metadata();
      expect({ file, width, height, format }).toEqual({
        file,
        width: 1200,
        height: 630,
        format: "png",
      });
    }
  });
});
