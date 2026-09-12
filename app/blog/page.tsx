import Link from "next/link";

import { getPublishedPosts } from "@/lib/posts";

import styles from "./blog.module.css";

const publicationDate = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <main id="main-content" className={styles.blog}>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p className={styles.empty}>No posts have been published yet.</p>
      ) : (
        <ol className={styles.results}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.result}>
              <article>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <time dateTime={post.publishedAt}>
                  {publicationDate.format(
                    new Date(`${post.publishedAt}T00:00:00Z`),
                  )}
                </time>
              </article>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
