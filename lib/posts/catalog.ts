import matter from "gray-matter";

import { parsePostFrontmatter, type PostFrontmatter } from "@/lib/posts/schema";

export type Post = PostFrontmatter & {
  body: string;
};

export type PostSummary = Omit<Post, "body">;

export function parsePostSource(source: string, filename: string): Post {
  const { data, content } = matter(source);
  const frontmatter = parsePostFrontmatter(data);
  const expectedFilename = `${frontmatter.slug}.md`;

  if (filename !== expectedFilename) {
    throw new Error(
      `Post filename mismatch: expected ${expectedFilename}, received ${filename}`,
    );
  }

  return { ...frontmatter, body: content.trim() };
}

export function comparePostsNewestFirst(a: PostSummary, b: PostSummary) {
  return (
    b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug)
  );
}

function toPostSummary(post: Post): PostSummary {
  return {
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt,
    updatedAt: post.updatedAt,
    draft: post.draft,
  };
}

export function publishedSummaries(posts: Post[]) {
  return posts
    .filter((post) => !post.draft)
    .map(toPostSummary)
    .sort(comparePostsNewestFirst);
}
