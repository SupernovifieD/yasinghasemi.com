import { initClock } from "./clock.js";
import { initStartMenu } from "./start-menu.js";
import { createWindowManager } from "./window-manager.js";
import { initDesktopIcons } from "./desktop-icons.js";
import {
  findNodeByPath,
  findSingleDocInFolder,
  getFolderChildren,
  loadFsManifest,
  normalizeManifestPath
} from "./fs-manifest.js";
import { parseDocsRoute, setDocsRoute } from "./docs-router.js";

function isMobileClient() {
  const compactViewport = window.matchMedia("(max-width: 900px)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const touchCapable = navigator.maxTouchPoints > 0;

  return compactViewport && (coarsePointer || touchCapable);
}

function createFallbackManifest() {
  return {
    title: "My Documents",
    type: "folder",
    url: "/#/docs",
    path: "",
    page: false,
    children: []
  };
}

function isOpenableFileType(type) {
  return type === "doc" || type === "txt";
}

function collectSearchableNodes(rootNode) {
  if (!rootNode) return [];

  const nodes = [];
  const stack = Array.isArray(rootNode.children) ? [...rootNode.children] : [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;

    nodes.push(node);

    if (Array.isArray(node.children) && node.children.length > 0) {
      stack.push(...node.children);
    }
  }

  return nodes;
}

export async function initApp() {
  initClock();
  const windowManager = createWindowManager();

  if (isMobileClient()) {
    document.body.classList.add("mobile-gated");
    windowManager.openDocument({
      name: "Desktop Notice",
      title: "Welcome - Desktop Version Required",
      file: "desktop/welcome-mobile.html",
      app: "word",
      fullscreen: true,
      locked: true,
      createTaskbarButton: false
    });
    return;
  }

  let manifestRoot = createFallbackManifest();
  try {
    manifestRoot = await loadFsManifest();
  } catch (error) {
    console.error("Failed to load fs.json. Falling back to an empty Documents tree.", error);
  }
  const searchableNodes = collectSearchableNodes(manifestRoot);

  const openFileNode = (fileNode) => {
    if (!fileNode || !isOpenableFileType(fileNode.type)) return;

    if (fileNode.type === "doc") {
      windowManager.openDocument({
        name: fileNode.title,
        title: `${fileNode.title} - Microsoft Word`,
        file: fileNode.url,
        app: "word"
      });
      return;
    }

    if (fileNode.type === "txt") {
      windowManager.openDocument({
        name: fileNode.title,
        title: `${fileNode.title} - Notepad`,
        file: fileNode.url,
        app: "notepad"
      });
    }
  };

  const openExplorerForFolder = (folderNode) => {
    if (!folderNode || folderNode.type !== "folder") return;

    windowManager.openExplorer({
      name: folderNode.title,
      title: `${folderNode.title} - My Documents`,
      folderPath: folderNode.path,
      items: getFolderChildren(folderNode),
      onOpenItem: handleManifestNodeOpen
    });
  };

  function handleDocsRoute(folderPath) {
    const normalizedPath = normalizeManifestPath(folderPath);
    const target = findNodeByPath(manifestRoot, normalizedPath);

    if (!target || target.type !== "folder") {
      const changed = setDocsRoute("");
      if (!changed) {
        openExplorerForFolder(manifestRoot);
      }
      return true;
    }

    openExplorerForFolder(target);

    if (target.page) {
      const singleDoc = findSingleDocInFolder(target);
      if (singleDoc) {
        openFileNode(singleDoc);
      }
    }

    return true;
  }

  function handleManifestNodeOpen(node) {
    if (!node) return;

    if (node.type === "folder") {
      if (node.page) {
        const changed = setDocsRoute(node.path);
        if (!changed) {
          handleDocsRoute(node.path);
        }
        return;
      }

      openExplorerForFolder(node);
      return;
    }

    openFileNode(node);
  }

  const openRootDocuments = () => {
    openExplorerForFolder(manifestRoot);
  };

  const runManifestSearch = (query) => {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    if (!normalizedQuery) return [];

    return searchableNodes.filter((node) => {
      const titleMatch = String(node.title || "").toLowerCase().includes(normalizedQuery);
      const typeMatch = String(node.type || "").toLowerCase().includes(normalizedQuery);
      return titleMatch || typeMatch;
    });
  };

  initStartMenu({
    manifestRoot,
    onOpenNode: handleManifestNodeOpen,
    onAction: (action) => {
      if (action !== "find") return;

      windowManager.openFind({
        name: "Find",
        title: "Find - My Documents",
        onSearch: runManifestSearch,
        onOpenResult: handleManifestNodeOpen
      });
    }
  });

  initDesktopIcons({
    onOpenDocument: windowManager.openDocument,
    onOpenFolderPath: (folderPath) => {
      const target = findNodeByPath(manifestRoot, normalizeManifestPath(folderPath));
      if (!target || target.type !== "folder") return;
      openExplorerForFolder(target);
    },
    onDownloadFile: ({ file, downloadName }) => {
      if (!file) return;

      const link = document.createElement("a");
      link.href = file;
      link.download = downloadName || file.split("/").pop() || "download";
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onOpenSystemIcon: ({ name }) => {
      if (name === "My Documents") {
        openRootDocuments();
        return;
      }

      alert(`${name} will open later.`);
    }
  });

  window.addEventListener("hashchange", () => {
    const route = parseDocsRoute();
    if (!route.matched) return;
    handleDocsRoute(route.folderPath);
  });

  const initialRoute = parseDocsRoute();
  if (initialRoute.matched) {
    handleDocsRoute(initialRoute.folderPath);
    return;
  }

  windowManager.openDocument({
    name: "Welcome.doc",
    title: "Welcome.doc - Microsoft Word",
    file: "desktop/welcome.html",
    app: "word"
  });
}
