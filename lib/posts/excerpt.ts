/** The slice of a published post that the home blog preview needs. */
export type BlogPreviewPost = {
  slug: string;
  title: string;
  excerpt: string;
};

const DEFAULT_MAX_LENGTH = 240;

/**
 * Plain-text opening of a post body for the home preview. Markdown syntax is
 * stripped, headings, code blocks, and images are skipped, and the text is cut
 * at a word boundary (no ellipsis: the preview fades it out visually).
 */
export function createBodyExcerpt(
  markdown: string,
  maxLength = DEFAULT_MAX_LENGTH,
) {
  const text = markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, " ")
    .split("\n")
    .filter((line) => !/^\s*(#{1,6}\s|[-*_]{3,}\s*$|\|)/.test(line))
    .join("\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|\*|_|~~|`)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, maxLength))
    .replace(/[\s,;:\-–—]+$/, "")
    .trim();
}
