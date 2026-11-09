"use client";

import dynamic from "next/dynamic";

import type { PreviewId } from "@/lib/home/previews";
import type { BlogPreviewPost } from "@/lib/posts/excerpt";

// Each preview is its own chunk. `ssr: false` is only allowed in a Client
// Component, which is why the registry lives in this file.
const loaders = {
  projects: () => import("@/components/home/previews/projects-preview"),
  blog: () => import("@/components/home/previews/blog-preview"),
  about: () => import("@/components/home/previews/about-preview"),
  contact: () => import("@/components/home/previews/contact-preview"),
} satisfies Record<PreviewId, () => Promise<unknown>>;

const ProjectsPreview = dynamic(loaders.projects, { ssr: false });
const BlogPreview = dynamic(loaders.blog, { ssr: false });
const AboutPreview = dynamic(loaders.about, { ssr: false });
const ContactPreview = dynamic(loaders.contact, { ssr: false });

/**
 * Idle-time warm-up so the first hover is instant. The contact preview's shell
 * is tiny and does not import three.js (the scene is a separate chunk loaded
 * only once the preview mounts), so warming it keeps the heavy code out of the
 * initial and idle loads.
 */
export function prefetchPreviews() {
  void loaders.projects().then((module) => module.preloadProjectImages());
  void loaders.blog();
  void loaders.about().then((module) => module.preloadPortrait());
  void loaders.contact();
}

export function PreviewContent({
  id,
  active,
  blogPost,
}: {
  id: PreviewId;
  active: boolean;
  blogPost: BlogPreviewPost | null;
}) {
  switch (id) {
    case "projects":
      return <ProjectsPreview active={active} />;
    case "blog":
      return <BlogPreview active={active} post={blogPost} />;
    case "about":
      return <AboutPreview active={active} />;
    case "contact":
      return <ContactPreview active={active} />;
  }
}
