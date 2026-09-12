import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  parsePostSource,
  publishedSummaries,
  type Post,
} from "@/lib/posts/catalog";
import { validatePostCollection } from "@/lib/posts/schema";

const postsDirectory = join(process.cwd(), "content", "posts");

function loadPostFiles(): Post[] {
  if (!existsSync(postsDirectory)) return [];

  const posts = readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) =>
      parsePostSource(
        readFileSync(join(postsDirectory, entry.name), "utf8"),
        entry.name,
      ),
    );

  validatePostCollection(
    posts.map(({ title, slug, publishedAt, excerpt, updatedAt, draft }) => ({
      title,
      slug,
      publishedAt,
      excerpt,
      updatedAt,
      draft,
    })),
  );
  return posts;
}

export function getPublishedPosts() {
  return publishedSummaries(loadPostFiles());
}

export function getPublishedPostBySlug(slug: string) {
  return loadPostFiles().find((post) => !post.draft && post.slug === slug);
}
