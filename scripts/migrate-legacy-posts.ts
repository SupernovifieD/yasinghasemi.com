import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import JSZip, { type JSZipObject } from "jszip";

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

export async function inventoryLegacyArchive(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer, { createFolders: false });
  const entries = Object.values(zip.files);

  if (entries.length > MAX_ENTRIES) {
    throw new Error(`Archive contains too many entries: ${entries.length}`);
  }

  for (const entry of entries) {
    assertSafeArchivePath(entry.name);
    if (isSymlink(entry))
      throw new Error(`Archive symlink rejected: ${entry.name}`);
  }

  const articleEntries = entries.filter((entry) => {
    const path = relativeMemberPath(entry.name);
    return (
      !entry.dir && path.startsWith("mydocuments/") && path.endsWith(".html")
    );
  });
  const articles: LegacyArticleInventory[] = [];
  let totalBytes = 0;

  for (const entry of articleEntries) {
    const source = await entry.async("nodebuffer");
    totalBytes += source.byteLength;

    if (source.byteLength > MAX_ENTRY_BYTES || totalBytes > MAX_TOTAL_BYTES) {
      throw new Error("Archive expansion limit exceeded");
    }

    const $ = load(source.toString("utf8"));
    const article = $("article[data-published][data-subtitle]");
    if (article.length !== 1) continue;

    articles.push({
      sourcePath: relativeMemberPath(entry.name),
      title: article.find("h1").first().text().trim(),
      publishedAt: article.attr("data-published")?.trim() ?? "",
      excerpt: article.attr("data-subtitle")?.trim() ?? "",
      headings: article
        .find("h2, h3")
        .toArray()
        .map((heading) => $(heading).text().trim()),
      paragraphCount: article.find("p").length,
      links: article
        .find("a[href]")
        .toArray()
        .map((link) => $(link).attr("href") ?? ""),
    });
  }

  return {
    entryCount: entries.length,
    articleCount: articles.length,
    articles: articles.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath)),
  };
}

function readArchiveArgument(args: string[]) {
  let archivePath: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dry-run") continue;
    if (argument === "--archive") {
      archivePath = args[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unsupported argument: ${argument}`);
  }

  if (!archivePath) {
    throw new Error("Usage: pnpm migrate:legacy --archive <zip> --dry-run");
  }

  return archivePath;
}

async function main() {
  const archivePath = readArchiveArgument(process.argv.slice(2));
  const buffer = await readFile(archivePath);
  const inventory = await inventoryLegacyArchive(buffer);

  process.stdout.write(
    `${JSON.stringify(
      {
        archivePath,
        sha256: createHash("sha256").update(buffer).digest("hex"),
        dryRun: true,
        ...inventory,
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
