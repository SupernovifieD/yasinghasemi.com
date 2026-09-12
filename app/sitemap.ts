import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

const publicPagePaths = [
  "/",
  "/about",
  "/contact",
  "/blog",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = publicPagePaths.map((path) => ({
    url: new URL(path, siteConfig.origin).toString(),
  }));
  const posts = getPublishedPosts().map((post) => ({
    url: new URL(`/blog/${post.slug}`, siteConfig.origin).toString(),
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  return [...pages, ...posts];
}
