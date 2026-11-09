import { primaryNavigation } from "@/lib/site-config";

type StripSlash<Href extends string> = Href extends `/${infer Id}` ? Id : never;

/**
 * One preview per primary navigation entry. Deriving the id from the nav
 * config means adding a nav item fails type-checking until it gets a preview.
 */
export type PreviewId = StripSlash<(typeof primaryNavigation)[number]["href"]>;

export function previewIdForHref(href: string) {
  return href.slice(1) as PreviewId;
}
