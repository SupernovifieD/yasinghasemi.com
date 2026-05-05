const DOCS_PREFIX = "#/docs";

function cleanHash(hashValue = "") {
  return String(hashValue || "").trim();
}

export function decodeRoutePath(encodedPath = "") {
  if (!encodedPath) return "";

  return encodedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

export function encodeRoutePath(pathValue = "") {
  if (!pathValue) return "";

  return pathValue
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function parseDocsRoute(hashValue = window.location.hash) {
  const hash = cleanHash(hashValue);
  if (!hash.startsWith(DOCS_PREFIX)) {
    return {
      matched: false,
      folderPath: ""
    };
  }

  const remainder = hash.slice(DOCS_PREFIX.length).replace(/^\/+/, "");

  return {
    matched: true,
    folderPath: decodeRoutePath(remainder)
  };
}

export function buildDocsRoute(folderPath = "") {
  const encodedPath = encodeRoutePath(folderPath);
  return encodedPath ? `${DOCS_PREFIX}/${encodedPath}` : DOCS_PREFIX;
}

export function setDocsRoute(folderPath = "") {
  const nextHash = buildDocsRoute(folderPath);
  if (window.location.hash === nextHash) {
    return false;
  }

  window.location.hash = nextHash;
  return true;
}
