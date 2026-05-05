#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const documentsRoot = path.join(rootDir, "mydocuments");
const outputFile = path.join(rootDir, "fs.json");

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
  const serialized = `${JSON.stringify(rootNode, null, 2)}\n`;
  await fs.writeFile(outputFile, serialized, "utf8");

  console.log(`Generated ${path.relative(rootDir, outputFile)} from mydocuments/.`);
}

generateManifest().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
