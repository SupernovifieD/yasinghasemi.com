const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublicRouteEntry = {
  label: string;
  href: string;
};

export type PublicRouteRegistry = {
  paths: string[];
  children: Record<string, PublicRouteEntry[]>;
};

const rootEntries: PublicRouteEntry[] = [
  { label: "about/", href: "/about" },
  { label: "blog/", href: "/blog" },
  { label: "contact/", href: "/contact" },
  { label: "cookies/", href: "/cookies" },
  { label: "privacy/", href: "/privacy" },
  { label: "terms/", href: "/terms" },
];

export function createPublicRouteRegistry(
  publishedPostSlugs: readonly string[],
): PublicRouteRegistry {
  const uniqueSlugs = new Set<string>();

  for (const slug of publishedPostSlugs) {
    if (!postSlugPattern.test(slug)) {
      throw new Error(`Invalid public post slug: ${slug}`);
    }
    if (uniqueSlugs.has(slug)) {
      throw new Error(`Duplicate public post slug: ${slug}`);
    }
    uniqueSlugs.add(slug);
  }

  const blogEntries = [...uniqueSlugs].sort().map((slug) => ({
    label: `${slug}/`,
    href: `/blog/${slug}`,
  }));
  const paths = [
    "/",
    ...rootEntries.map(({ href }) => href),
    ...blogEntries.map(({ href }) => href),
  ];
  const children: Record<string, PublicRouteEntry[]> = Object.fromEntries(
    paths.map((path) => [path, []]),
  );
  children["/"] = rootEntries;
  children["/blog"] = blogEntries;

  return { paths, children };
}

export function isPublicPath(
  registry: PublicRouteRegistry,
  path: string,
): boolean {
  return registry.paths.includes(path);
}

export function listPublicChildren(
  registry: PublicRouteRegistry,
  path: string,
) {
  return registry.children[path];
}
