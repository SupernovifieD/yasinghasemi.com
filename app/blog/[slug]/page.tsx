import Link from "next/link";
import { notFound } from "next/navigation";

import { PostBody } from "@/components/post-body";
import { ReadingLayout } from "@/components/reading-layout";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/posts";

import styles from "./post.module.css";

export const dynamicParams = false;

const publicationDate = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

export function generateStaticParams() {
  return getPublishedPosts().map(({ slug }) => ({ slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);

  if (!post) notFound();

  return (
    <ReadingLayout>
      <article>
        <Link href="/blog" className={styles.backLink}>
          ← Back to /blog
        </Link>
        <h1>{post.title}</h1>
        <time className={styles.date} dateTime={post.publishedAt}>
          {publicationDate.format(new Date(`${post.publishedAt}T00:00:00Z`))}
        </time>
        <div className={styles.body}>
          <PostBody>{post.body}</PostBody>
        </div>
      </article>
    </ReadingLayout>
  );
}
