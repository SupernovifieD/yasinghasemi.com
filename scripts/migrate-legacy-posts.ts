import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import JSZip, { type JSZipObject } from "jszip";
import { marked } from "marked";
import TurndownService from "turndown";

import { parsePostSource } from "@/lib/posts/catalog";
import {
  legacyPostSources,
  type LegacyPostSource,
} from "@/lib/posts/legacy-sources";

const MAX_ENTRIES = 1_000;
const MAX_ENTRY_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

export type LegacyArticleInventory = {
  sourcePath: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  headings: string[];
  paragraphCount: number;
  links: string[];
};

export function assertSafeArchivePath(path: string) {
  if (
    path.startsWith("/") ||
    path.startsWith("\\") ||
    /^[a-zA-Z]:/.test(path) ||
    path.split("/").some((segment) => segment === "..") ||
    path.includes("\\") ||
    path.includes("\0")
  ) {
    throw new Error(`Unsafe archive member path: ${path}`);
  }
}

function isSymlink(entry: JSZipObject) {
  const permissions = entry.unixPermissions;
  const mode =
    typeof permissions === "string"
      ? Number.parseInt(permissions, 8)
      : permissions;

  return typeof mode === "number" && (mode & 0o170000) === 0o120000;
}

function relativeMemberPath(path: string) {
  const separator = path.indexOf("/");
  return separator === -1 ? path : path.slice(separator + 1);
}

async function openArchive(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer, { createFolders: false });
  const entries = Object.values(zip.files);

  if (entries.length > MAX_ENTRIES) {
    throw new Error(`Archive contains too many entries: ${entries.length}`);
  }

  for (const entry of entries) {
    assertSafeArchivePath(entry.name);
    if (isSymlink(entry)) {
      throw new Error(`Archive symlink rejected: ${entry.name}`);
    }
  }

  return { entries };
}

function isArticleEntry(entry: JSZipObject) {
  const path = relativeMemberPath(entry.name);
  return (
    !entry.dir && path.startsWith("mydocuments/") && path.endsWith(".html")
  );
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isSafeLink(value: string) {
  if (value.startsWith("//")) return false;
  if (value.startsWith("/") || value.startsWith("#")) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function readArticleEntries(buffer: Buffer) {
  const { entries } = await openArchive(buffer);
  const articles = new Map<string, string>();
  let totalBytes = 0;

  for (const entry of entries.filter(isArticleEntry)) {
    const source = await entry.async("nodebuffer");
    totalBytes += source.byteLength;

    if (source.byteLength > MAX_ENTRY_BYTES || totalBytes > MAX_TOTAL_BYTES) {
      throw new Error("Archive expansion limit exceeded");
    }

    articles.set(relativeMemberPath(entry.name), source.toString("utf8"));
  }

  return { entryCount: entries.length, articles };
}

function inventoryArticle(sourcePath: string, html: string) {
  const $ = load(html);
  const article = $("article[data-published][data-subtitle]");
  if (article.length !== 1) return null;

  return {
    sourcePath,
    title: article.find("h1").first().text().trim(),
    publishedAt: article.attr("data-published")?.trim() ?? "",
    excerpt: article.attr("data-subtitle")?.trim() ?? "",
    headings: article
      .find("h2, h3")
      .toArray()
      .map((heading) => normalizeText($(heading).text())),
    paragraphCount: article.find("p").length,
    links: article
      .find("a[href]")
      .toArray()
      .map((link) => $(link).attr("href") ?? ""),
  } satisfies LegacyArticleInventory;
}

export async function inventoryLegacyArchive(buffer: Buffer) {
  const { entryCount, articles: articleFiles } =
    await readArticleEntries(buffer);
  const articles = [...articleFiles]
    .map(([sourcePath, html]) => inventoryArticle(sourcePath, html))
    .filter((article): article is LegacyArticleInventory => article !== null)
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));

  return { entryCount, articleCount: articles.length, articles };
}

export function convertLegacyArticle(html: string, source: LegacyPostSource) {
  const $ = load(html);
  const article = $("article[data-published][data-subtitle]");
  if (article.length !== 1) {
    throw new Error(`Expected one published article in ${source.sourcePath}`);
  }

  const actual = inventoryArticle(source.sourcePath, html);
  if (
    !actual ||
    actual.title !== source.title ||
    actual.publishedAt !== source.publishedAt ||
    actual.excerpt !== source.excerpt
  ) {
    throw new Error(`Authoritative metadata mismatch in ${source.sourcePath}`);
  }

  const sourceParagraphs = article
    .find("p")
    .toArray()
    .map((paragraph) => normalizeText($(paragraph).text()));
  const sourceHeadings = article
    .find("h2, h3")
    .toArray()
    .map((heading) => normalizeText($(heading).text()));
  const sourceEmphasisCount = article.find("em, strong, i, b").length;

  article.find("h1").first().remove();
  article.find("script, style, noscript").remove();
  article.find("a[href]").each((_index, link) => {
    const href = $(link).attr("href") ?? "";
    if (!isSafeLink(href)) $(link).replaceWith($(link).contents());
  });

  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });
  const body = turndown.turndown(article.html() ?? "").trim();
  const markdown = `---
title: ${JSON.stringify(source.title)}
slug: ${JSON.stringify(source.slug)}
publishedAt: ${JSON.stringify(source.publishedAt)}
excerpt: ${JSON.stringify(source.excerpt)}
draft: false
---

${body}
`;
  const parsed = parsePostSource(markdown, `${source.slug}.md`);
  const rendered = load(marked.parse(parsed.body, { async: false }) as string);
  const renderedParagraphs = rendered("p")
    .toArray()
    .map((paragraph) => normalizeText(rendered(paragraph).text()));
  const renderedHeadings = rendered("h2, h3")
    .toArray()
    .map((heading) => normalizeText(rendered(heading).text()));
  const renderedLinks = rendered("a[href]")
    .toArray()
    .map((link) => rendered(link).attr("href") ?? "");

  if (
    JSON.stringify(sourceParagraphs) !== JSON.stringify(renderedParagraphs) ||
    JSON.stringify(sourceHeadings) !== JSON.stringify(renderedHeadings) ||
    JSON.stringify(actual.links.filter(isSafeLink)) !==
      JSON.stringify(renderedLinks) ||
    sourceEmphasisCount !== rendered("em, strong").length
  ) {
    throw new Error(`Semantic parity check failed for ${source.sourcePath}`);
  }

  return {
    markdown,
    report: {
      sourcePath: source.sourcePath,
      slug: source.slug,
      publishedAt: source.publishedAt,
      paragraphCount: sourceParagraphs.length,
      headings: sourceHeadings,
      links: renderedLinks,
      emphasisCount: sourceEmphasisCount,
      contentSha256: createHash("sha256").update(markdown).digest("hex"),
      semanticParity: true,
    },
  };
}

export async function convertLegacyArchive(buffer: Buffer) {
  const { articles } = await readArticleEntries(buffer);
  const publishedPaths = [...articles]
    .filter(([, html]) => inventoryArticle("", html) !== null)
    .map(([path]) => path)
    .sort();
  const expectedPaths = legacyPostSources
    .map(({ sourcePath }) => sourcePath)
    .sort();

  if (JSON.stringify(publishedPaths) !== JSON.stringify(expectedPaths)) {
    throw new Error(
      "Published source inventory differs from the audited mapping",
    );
  }

  return legacyPostSources.map((source) => {
    const html = articles.get(source.sourcePath);
    if (!html) throw new Error(`Missing legacy source: ${source.sourcePath}`);
    return convertLegacyArticle(html, source);
  });
}

function readArguments(args: string[]) {
  let archivePath: string | undefined;
  let emitSlug: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dry-run") continue;
    if (argument === "--archive") {
      archivePath = args[index + 1];
      index += 1;
      continue;
    }
    if (argument === "--emit") {
      emitSlug = args[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unsupported argument: ${argument}`);
  }

  if (!archivePath) {
    throw new Error(
      "Usage: pnpm migrate:legacy --archive <zip> --dry-run [--emit <slug>]",
    );
  }

  return { archivePath, emitSlug };
}

async function main() {
  const { archivePath, emitSlug } = readArguments(process.argv.slice(2));
  const buffer = await readFile(archivePath);
  const inventory = await inventoryLegacyArchive(buffer);
  const conversions = await convertLegacyArchive(buffer);

  if (emitSlug) {
    const conversion = conversions.find(
      ({ report }) => report.slug === emitSlug,
    );
    if (!conversion) throw new Error(`Unknown mapped slug: ${emitSlug}`);
    process.stdout.write(conversion.markdown);
    return;
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        archivePath,
        sha256: createHash("sha256").update(buffer).digest("hex"),
        dryRun: true,
        ...inventory,
        conversions: conversions.map(({ report }) => report),
      },
      null,
      2,
    )}\n`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Migration failed";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
