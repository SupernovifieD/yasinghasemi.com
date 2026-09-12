import { z } from "zod";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isCalendarDate(value: string) {
  if (!dateOnlyPattern.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const dateOnly = z
  .string()
  .refine(isCalendarDate, "Expected a real YYYY-MM-DD date");

export const postFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    slug: z.string().regex(slugPattern),
    publishedAt: dateOnly,
    excerpt: z.string().trim().min(1),
    updatedAt: dateOnly.optional(),
    draft: z.boolean(),
  })
  .strict()
  .refine(
    ({ publishedAt, updatedAt }) => !updatedAt || updatedAt >= publishedAt,
    {
      message: "updatedAt cannot precede publishedAt",
      path: ["updatedAt"],
    },
  );

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export function parsePostFrontmatter(value: unknown) {
  return postFrontmatterSchema.parse(value);
}

export function validatePostCollection(values: unknown[]) {
  const posts = values.map(parsePostFrontmatter);
  const seen = new Set<string>();

  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`Duplicate post slug: ${post.slug}`);
    }

    seen.add(post.slug);
  }

  return posts;
}
