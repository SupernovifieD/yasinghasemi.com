import { PreviewContent } from "@/components/home/previews";
import styles from "@/components/home/preview-panel.module.css";
import type { PreviewId } from "@/lib/home/previews";
import type { BlogPreviewPost } from "@/lib/posts/excerpt";

/**
 * The right-hand column of the home page. One gray radial glow, the same size
 * for every link, appears on the first hover and then stays. Previews mount
 * lazily on first activation and stay mounted; inactive ones fade out and are
 * made inert while they pause themselves.
 */
export function PreviewPanel({
  active,
  mounted,
  blogPost,
}: {
  active: PreviewId | null;
  mounted: readonly PreviewId[];
  blogPost: BlogPreviewPost | null;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.stage}>
        <div className={styles.glow} data-armed={active ? "" : undefined} />
        {mounted.map((id) => (
          <div
            key={id}
            className={styles.layer}
            data-preview={id}
            data-active={active === id ? "" : undefined}
            inert={active !== id}
          >
            <PreviewContent
              id={id}
              active={active === id}
              blogPost={blogPost}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
