import Link from "next/link";

import styles from "@/components/home/previews/blog-preview.module.css";
import type { BlogPreviewProps } from "@/components/home/previews/types";

/**
 * One randomly chosen post (picked once by the home stage). The excerpt fades
 * into the black background to invite the click; title, excerpt and the
 * "Read more" label are a single link to the post page.
 */
export default function BlogPreview({ post }: BlogPreviewProps) {
  if (!post) return null;

  return (
    <div className={styles.frame}>
      <Link className={styles.post} href={`/blog/${post.slug}`}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <span className={styles.more}>
          Read more <span aria-hidden="true">→</span>
        </span>
      </Link>
    </div>
  );
}
