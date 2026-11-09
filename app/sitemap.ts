import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

const publicPagePaths = [
  "/",
  "/about",
  "/contact",
  "/blog",
  "/projects",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = publicPagePaths.map((path) => ({
    url: new URL(path, siteConfig.origin).toString(),
  }));
  const posts = getPublishedPosts().map((post) => ({
    url: new URL(`/blog/${post.slug}`, siteConfig.origin).toString(),
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  const projectPages = projects.map(({ slug }) => ({
    url: new URL(`/projects/${slug}`, siteConfig.origin).toString(),
  }));

  return [...pages, ...projectPages, ...posts];
}
