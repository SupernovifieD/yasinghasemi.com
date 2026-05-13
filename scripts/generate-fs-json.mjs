#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const documentsRoot = path.join(rootDir, "mydocuments");
const outputFile = path.join(rootDir, "fs.json");
const readmeFile = path.join(rootDir, "README.md");
const welcomeFile = path.join(rootDir, "desktop", "welcome.html");
const siteUrl = "https://yasinghasemi.com";
const latestPostsStartMarker = "<!-- LATEST_POSTS:START -->";
const latestPostsEndMarker = "<!-- LATEST_POSTS:END -->";
const tocStartMarker = "<!-- DOCS_TOC:START -->";
const tocEndMarker = "<!-- DOCS_TOC:END -->";

const FILE_TYPE_MAP = Object.freeze({
  html: "doc",
  txt: "txt",
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  mp3: "mp3",
  mpg: "mpeg",
  mpeg: "mpeg"
});

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function compareNames(a, b) {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

function encodePathSegments(relativePath) {
  if (!relativePath) return "";
  return toPosixPath(relativePath)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildFolderUrl(relativePath) {
  const encodedPath = encodePathSegments(relativePath);
  return encodedPath ? `/#/docs/${encodedPath}` : "/#/docs";
}

function getParentFolderPath(relativeFilePath) {
  const parentPath = path.posix.dirname(toPosixPath(relativeFilePath));
  return parentPath === "." ? "" : parentPath;
}

function buildFileTitle(fileName, type) {
  if (type === "doc") {
    return `${path.parse(fileName).name}.doc`;
  }

  return fileName;
}

function buildFileNode({ fileName, relativeFolderPath }) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  const type = FILE_TYPE_MAP[extension] || "file";
  const relativeFilePath = relativeFolderPath
    ? `${toPosixPath(relativeFolderPath)}/${fileName}`
    : fileName;

  return {
    title: buildFileTitle(fileName, type),
    type,
    url: `mydocuments/${relativeFilePath}`,
    path: relativeFilePath,
    page: false,
    children: []
  };
}

function getNodeIcon(type) {
  if (type === "folder") return "📁";
  if (type === "doc") return "📄";
  if (type === "txt") return "📝";
  if (type === "jpeg" || type === "png") return "🖼️";
  if (type === "mp3") return "🎵";
  if (type === "mpeg") return "🎬";
  return "📦";
}

function buildNodeHref(node) {
  if (node.type === "folder") {
    return `${siteUrl}${node.url}`;
  }

  return `${siteUrl}/${node.url}`.replace(/([^:]\/)\/+/g, "$1");
}

function buildDocsTocLines(node, depth = 0) {
  const lines = [];
  const indent = "  ".repeat(depth);
  const icon = getNodeIcon(node.type);
  const href = buildNodeHref(node);
  lines.push(`${indent}- ${icon} [${node.title}](${href})`);

  if (Array.isArray(node.children) && node.children.length > 0) {
    for (const child of node.children) {
      lines.push(...buildDocsTocLines(child, depth + 1));
    }
  }

  return lines;
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function decodeHtmlEntities(value = "") {
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    "#39": "'"
  };

  return String(value).replace(/&([a-zA-Z0-9#]+);/g, (match, entity) => {
    return entities[entity] || match;
  });
}

function stripHtmlTags(value = "") {
  return decodeHtmlEntities(String(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function escapeMarkdownText(value = "") {
  return String(value).replace(/([\\[\]])/g, "\\$1");
}

function formatPublishedDate(value = "") {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function extractAttribute(html, attributeName) {
  const pattern = new RegExp(`\\b${escapeForRegExp(attributeName)}\\s*=\\s*(['"])([\\s\\S]*?)\\1`, "i");
  const match = html.match(pattern);
  return match ? stripHtmlTags(match[2]) : "";
}

function extractH1Title(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripHtmlTags(match[1]) : "";
}

async function listDocumentHtmlFiles(absoluteFolderPath, relativeFolderPath = "") {
  const entries = await fs.readdir(absoluteFolderPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const absoluteEntryPath = path.join(absoluteFolderPath, entry.name);
    const relativeEntryPath = relativeFolderPath
      ? path.posix.join(toPosixPath(relativeFolderPath), entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      files.push(...await listDocumentHtmlFiles(absoluteEntryPath, relativeEntryPath));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".html") {
      files.push({
        absolutePath: absoluteEntryPath,
        relativePath: relativeEntryPath
      });
    }
  }

  return files;
}

async function collectLatestPosts(limit = 3) {
  const htmlFiles = await listDocumentHtmlFiles(documentsRoot);
  const posts = [];

  for (const file of htmlFiles) {
    const html = await fs.readFile(file.absolutePath, "utf8");
    const published = extractAttribute(html, "data-published");
    const title = extractH1Title(html);
    if (!published || !title) continue;

    const folderPath = getParentFolderPath(file.relativePath);
    posts.push({
      title,
      published,
      formattedPublished: formatPublishedDate(published),
      routeUrl: buildFolderUrl(folderPath),
      absoluteRouteUrl: `${siteUrl}${buildFolderUrl(folderPath)}`,
      relativeFilePath: file.relativePath
    });
  }

  return posts
    .sort((a, b) => {
      const dateCompare = b.published.localeCompare(a.published);
      if (dateCompare !== 0) return dateCompare;
      return compareNames(a.title, b.title);
    })
    .slice(0, limit);
}

function buildLatestPostsMarkdown(posts) {
  if (posts.length === 0) return "- No posts yet.";

  return posts
    .map((post) => {
      return `- [${escapeMarkdownText(post.title)}](${post.absoluteRouteUrl}) - ${post.formattedPublished}`;
    })
    .join("\n");
}

function buildLatestPostsWelcomeHtml(posts) {
  const listMarkup = posts.length > 0
    ? posts
        .map((post) => {
          return `    <li><a href="${escapeHtml(post.routeUrl)}">${escapeHtml(post.title)}</a> <span class="latest-post-date">${escapeHtml(post.formattedPublished)}</span></li>`;
        })
        .join("\n")
    : "    <li>No posts yet.</li>";

  return `<section class="welcome-latest-posts">
  <h2>Latest Posts</h2>
  <p>
    Here are the latest notes from My Documents. Open one if you want to start reading right away.
  </p>
  <ul>
${listMarkup}
  </ul>
</section>`;
}

function replaceMarkedBlock(content, startMarker, endMarker, replacementBlock) {
  const replacePattern = new RegExp(
    `(${escapeForRegExp(startMarker)})([\\s\\S]*?)(${escapeForRegExp(endMarker)})`
  );

  if (!replacePattern.test(content)) return null;

  return content.replace(
    replacePattern,
    `${startMarker}\n${replacementBlock}\n${endMarker}`
  );
}

async function updateReadmeToc(rootNode) {
  let readmeContent = "";

  try {
    readmeContent = await fs.readFile(readmeFile, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  const tocLines = buildDocsTocLines(rootNode);
  const tocBlock = tocLines.length > 0 ? tocLines.join("\n") : "- (empty)";
  const replacePattern = new RegExp(
    `(${escapeForRegExp(tocStartMarker)})([\\s\\S]*?)(${escapeForRegExp(tocEndMarker)})`
  );

  let nextReadme = "";
  if (replacePattern.test(readmeContent)) {
    nextReadme = readmeContent.replace(
      replacePattern,
      `${tocStartMarker}\n${tocBlock}\n${tocEndMarker}`
    );
  } else {
    nextReadme = `${readmeContent.trimEnd()}\n\n## My Documents Table of Contents\n${tocStartMarker}\n${tocBlock}\n${tocEndMarker}\n`;
  }

  if (nextReadme !== readmeContent) {
    await fs.writeFile(readmeFile, nextReadme, "utf8");
    return true;
  }

  return false;
}

async function updateReadmeLatestPosts(posts) {
  let readmeContent = "";

  try {
    readmeContent = await fs.readFile(readmeFile, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  const latestPostsBlock = `## Latest Posts\n\nThis section is auto-generated from published posts in \`mydocuments/\`.\n\n${latestPostsStartMarker}\n${buildLatestPostsMarkdown(posts)}\n${latestPostsEndMarker}`;
  const replacedReadme = replaceMarkedBlock(
    readmeContent,
    latestPostsStartMarker,
    latestPostsEndMarker,
    buildLatestPostsMarkdown(posts)
  );

  let nextReadme = "";
  if (replacedReadme !== null) {
    nextReadme = replacedReadme;
  } else if (readmeContent.includes("## Run Locally")) {
    nextReadme = readmeContent.replace(
      /\n## Run Locally/,
      `\n${latestPostsBlock}\n\n## Run Locally`
    );
  } else {
    nextReadme = `${readmeContent.trimEnd()}\n\n${latestPostsBlock}\n`;
  }

  if (nextReadme !== readmeContent) {
    await fs.writeFile(readmeFile, nextReadme, "utf8");
    return true;
  }

  return false;
}

async function updateWelcomeLatestPosts(posts) {
  let welcomeContent = "";

  try {
    welcomeContent = await fs.readFile(welcomeFile, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  const latestPostsBlock = buildLatestPostsWelcomeHtml(posts);
  const replacedWelcome = replaceMarkedBlock(
    welcomeContent,
    latestPostsStartMarker,
    latestPostsEndMarker,
    latestPostsBlock
  );

  let nextWelcome = "";
  if (replacedWelcome !== null) {
    nextWelcome = replacedWelcome;
  } else {
    const firstParagraphEndIndex = welcomeContent.indexOf("</p>");
    if (firstParagraphEndIndex !== -1) {
      const insertIndex = firstParagraphEndIndex + "</p>".length;
      nextWelcome = `${welcomeContent.slice(0, insertIndex)}\n\n${latestPostsStartMarker}\n${latestPostsBlock}\n${latestPostsEndMarker}${welcomeContent.slice(insertIndex)}`;
    } else {
      nextWelcome = `${welcomeContent.trimEnd()}\n\n${latestPostsStartMarker}\n${latestPostsBlock}\n${latestPostsEndMarker}\n`;
    }
  }

  if (nextWelcome !== welcomeContent) {
    await fs.writeFile(welcomeFile, nextWelcome, "utf8");
    return true;
  }

  return false;
}

async function buildFolderNode(absoluteFolderPath, relativeFolderPath) {
  const entries = await fs.readdir(absoluteFolderPath, { withFileTypes: true });
  const visibleEntries = entries.filter((entry) => !entry.name.startsWith("."));

  const childDirectories = visibleEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareNames);

  const childFiles = visibleEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort(compareNames);

  const children = [];

  for (const dirName of childDirectories) {
    const childRelativePath = relativeFolderPath ? path.join(relativeFolderPath, dirName) : dirName;
    const childAbsolutePath = path.join(absoluteFolderPath, dirName);
    children.push(await buildFolderNode(childAbsolutePath, childRelativePath));
  }

  for (const fileName of childFiles) {
    children.push(
      buildFileNode({
        fileName,
        relativeFolderPath: toPosixPath(relativeFolderPath)
      })
    );
  }

  const hasFiles = childFiles.length > 0;
  const hasSubfolders = childDirectories.length > 0;
  const folderTitle = relativeFolderPath ? path.basename(relativeFolderPath) : "My Documents";

  return {
    title: folderTitle,
    type: "folder",
    url: buildFolderUrl(toPosixPath(relativeFolderPath)),
    path: toPosixPath(relativeFolderPath),
    page: !hasSubfolders && hasFiles,
    children
  };
}

async function generateManifest() {
  try {
    const stats = await fs.stat(documentsRoot);
    if (!stats.isDirectory()) {
      throw new Error(`Expected a directory at '${documentsRoot}'.`);
    }
  } catch (error) {
    throw new Error(`Could not read mydocuments directory: ${error.message}`);
  }

  const rootNode = await buildFolderNode(documentsRoot, "");
  const latestPosts = await collectLatestPosts(3);
  const serialized = `${JSON.stringify(rootNode, null, 2)}\n`;
  await fs.writeFile(outputFile, serialized, "utf8");
  const readmeLatestUpdated = await updateReadmeLatestPosts(latestPosts);
  const readmeUpdated = await updateReadmeToc(rootNode);
  const welcomeUpdated = await updateWelcomeLatestPosts(latestPosts);

  console.log(`Generated ${path.relative(rootDir, outputFile)} from mydocuments/.`);
  if (readmeLatestUpdated) {
    console.log(`Updated Latest Posts in ${path.relative(rootDir, readmeFile)}.`);
  }
  if (readmeUpdated) {
    console.log(`Updated My Documents TOC in ${path.relative(rootDir, readmeFile)}.`);
  }
  if (welcomeUpdated) {
    console.log(`Updated Latest Posts in ${path.relative(rootDir, welcomeFile)}.`);
  }
}

generateManifest().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
