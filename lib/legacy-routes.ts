import { legacyPostSources } from "./posts/legacy-sources";

export type CanonicalBlogPath = `/blog/${string}`;

export const legacyArticleRoutes = legacyPostSources.map((source) => ({
  directPath: `/${source.sourcePath}`,
  hashPath: source.oldHashPath,
  canonicalPath: `/blog/${source.slug}` as CanonicalBlogPath,
}));

export const legacyFolderHashPaths = [
  "/docs",
  "/docs/1-NetRadar",
  "/docs/1-NetRadar/2026-05-03",
  "/docs/2-MineralProspectivityMapping",
  "/docs/Journal",
] as const;

const hashDestinations = new Map<string, string>([
  ...legacyArticleRoutes.map(
    ({ hashPath, canonicalPath }) => [hashPath, canonicalPath] as const,
  ),
  ...legacyFolderHashPaths.map((path) => [path, "/blog"] as const),
]);

function normalizeLegacyHash(hash: string) {
  const encoded = hash.startsWith("#") ? hash.slice(1) : hash;
  let decoded: string;

  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    return null;
  }

  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    decoded.includes("?") ||
    decoded.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return null;
  }

  const normalized = decoded.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
}

export type LegacyHashMatch =
  { kind: "redirect"; href: string } | { kind: "unknown" } | null;

export function matchLegacyHash(hash: string): LegacyHashMatch {
  const path = normalizeLegacyHash(hash);
  if (!path || (path !== "/docs" && !path.startsWith("/docs/"))) {
    return null;
  }

  const href = hashDestinations.get(path);
  return href ? { kind: "redirect", href } : { kind: "unknown" };
}

export function getLegacyDirectRedirects() {
  return legacyArticleRoutes.map(({ directPath, canonicalPath }) => ({
    source: directPath,
    destination: canonicalPath,
    permanent: true,
  }));
}
