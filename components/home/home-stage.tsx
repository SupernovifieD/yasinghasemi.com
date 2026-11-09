"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "@/components/home/home-stage.module.css";
import { PreviewPanel } from "@/components/home/preview-panel";
import { prefetchPreviews } from "@/components/home/previews";
import { previewIdForHref, type PreviewId } from "@/lib/home/previews";
import { whenIdle } from "@/lib/idle";
import { HOVER_PREVIEW_QUERY } from "@/lib/layout";
import type { BlogPreviewPost } from "@/lib/posts/excerpt";
import { pickRandomIndex } from "@/lib/random";
import { primaryNavigation } from "@/lib/site-config";

/**
 * Home page body: the welcome note and navigation on the left, a hover
 * preview on the right (fine-pointer desktop only). The last hovered or
 * focused link stays selected until another one is, or the page reloads.
 */
export function HomeStage({
  children,
  posts,
}: {
  children: ReactNode;
  posts: BlogPreviewPost[];
}) {
  const [active, setActive] = useState<PreviewId | null>(null);
  const [mounted, setMounted] = useState<PreviewId[]>([]);
  const [blogIndex, setBlogIndex] = useState<number | null>(null);
  const blogPick = useRef<number | null>(null);

  useEffect(() => {
    if (!window.matchMedia(HOVER_PREVIEW_QUERY).matches) return;
    return whenIdle(prefetchPreviews);
  }, []);

  function activate(id: PreviewId) {
    if (!window.matchMedia(HOVER_PREVIEW_QUERY).matches) return;

    // Chosen once, in the event handler: rendering at build time would fix the
    // pick for every visitor, and Math.random() during render would mismatch
    // hydration.
    if (id === "blog" && blogPick.current === null && posts.length > 0) {
      blogPick.current = pickRandomIndex(posts.length);
      setBlogIndex(blogPick.current);
    }
    setMounted((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setActive(id);
  }

  const blogPost = blogIndex === null ? null : (posts[blogIndex] ?? null);

  return (
    <div className={styles.layout}>
      <div className={styles.intro}>
        {children}
        <nav aria-label="Sections">
          <ul className={styles.links}>
            {primaryNavigation.map(({ href, label }) => {
              const id = previewIdForHref(href);

              return (
                <li key={href}>
                  <Link
                    className={styles.link}
                    href={href}
                    data-active={active === id ? "" : undefined}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "touch") activate(id);
                    }}
                    onFocus={() => activate(id)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <PreviewPanel active={active} mounted={mounted} blogPost={blogPost} />
    </div>
  );
}
