const MANIFEST_URL = new URL("../fs.json", import.meta.url).href;

let manifestPromise = null;

export async function loadFsManifest({ force = false } = {}) {
  if (!manifestPromise || force) {
    manifestPromise = fetch(MANIFEST_URL, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load fs.json (${response.status}).`);
      }

      return response.json();
    });
  }

  return manifestPromise;
}

export function normalizeManifestPath(value = "") {
  return String(value)
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function walkTree(node, callback) {
  const shouldContinue = callback(node);
  if (shouldContinue === false) return;

  if (!Array.isArray(node.children)) return;
  node.children.forEach((child) => walkTree(child, callback));
}

export function findNodeByPath(manifestRoot, pathValue) {
  if (!manifestRoot) return null;

  const normalizedPath = normalizeManifestPath(pathValue);
  let found = null;

  walkTree(manifestRoot, (node) => {
    if (normalizeManifestPath(node.path) === normalizedPath) {
      found = node;
      return false;
    }
    return true;
  });

  return found;
}

export function getFolderChildren(folderNode) {
  if (!folderNode || folderNode.type !== "folder") return [];
  return Array.isArray(folderNode.children) ? folderNode.children : [];
}

export function findSingleDocInFolder(folderNode) {
  if (!folderNode || folderNode.type !== "folder") return null;

  const docFiles = getFolderChildren(folderNode).filter((child) => child.type === "doc");
  return docFiles.length === 1 ? docFiles[0] : null;
}

export function getNodeTitle(node) {
  if (!node) return "Item";
  return node.title || "Item";
}
