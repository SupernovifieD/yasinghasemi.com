const ICON_FOLDER_URL = new URL("../assets/icons/16/folder.png", import.meta.url).href;
const ICON_DOC_URL = new URL("../assets/icons/16/x-office-document.png", import.meta.url).href;
const ICON_NOTEPAD_URL = new URL("../assets/icons/48/w98_notepad.ico", import.meta.url).href;

const UNSUPPORTED_TREE_TYPES = new Set(["jpeg", "png", "mpeg", "mp3", "file"]);

function getNodeIconUrl(node) {
  if (!node) return ICON_DOC_URL;
  if (node.type === "folder") return ICON_FOLDER_URL;
  if (node.type === "txt") return ICON_NOTEPAD_URL;
  return ICON_DOC_URL;
}

function isNodeOpenable(node) {
  if (!node) return false;
  if (node.type === "folder") return true;
  if (node.type === "doc") return true;
  if (node.type === "txt") return true;
  return !UNSUPPORTED_TREE_TYPES.has(node.type);
}

function getFolderChildren(node) {
  if (!node || node.type !== "folder") return [];
  return Array.isArray(node.children) ? node.children : [];
}

function isExpandableFolder(node) {
  if (!node || node.type !== "folder") return false;
  if (node.page) return false;
  return getFolderChildren(node).length > 0;
}

export function initStartMenu({
  startButtonId = "start-btn",
  startMenuId = "start-menu",
  documentsButtonId = "start-documents-btn",
  manifestRoot = null,
  onOpenNode,
  onAction
} = {}) {
  const startBtn = document.getElementById(startButtonId);
  const startMenu = document.getElementById(startMenuId);
  const documentsButton = document.getElementById(documentsButtonId);

  if (!startBtn || !startMenu) return;

  const cascadeRoot = document.createElement("div");
  cascadeRoot.className = "start-cascade-root hidden";
  document.body.appendChild(cascadeRoot);

  const panelStates = [];
  const activeRowsByLevel = new Map();

  function clearActiveRowsFrom(level) {
    Array.from(activeRowsByLevel.keys())
      .filter((rowLevel) => rowLevel >= level)
      .forEach((rowLevel) => {
        const rowBtn = activeRowsByLevel.get(rowLevel);
        if (rowBtn) {
          rowBtn.classList.remove("is-open");
        }
        activeRowsByLevel.delete(rowLevel);
      });
  }

  function setActiveRow(level, rowBtn) {
    const prev = activeRowsByLevel.get(level);
    if (prev && prev !== rowBtn) {
      prev.classList.remove("is-open");
    }
    activeRowsByLevel.set(level, rowBtn);
    rowBtn.classList.add("is-open");
  }

  function clearPanelsFrom(level) {
    while (panelStates.length > 0) {
      const top = panelStates[panelStates.length - 1];
      if (top.level < level) break;
      top.el.remove();
      panelStates.pop();
    }
    clearActiveRowsFrom(level);

    if (panelStates.length === 0) {
      cascadeRoot.classList.add("hidden");
      if (documentsButton) {
        documentsButton.setAttribute("aria-expanded", "false");
      }
    }
  }

  function closeMenu() {
    startMenu.classList.add("hidden");
    startBtn.classList.remove("pressed");
    clearPanelsFrom(0);
  }

  function isMenuOpen() {
    return !startMenu.classList.contains("hidden");
  }

  function positionPanel(panelEl, anchorRect, level) {
    const margin = 4;
    const taskbarHeight = 34;
    const { offsetWidth, offsetHeight } = panelEl;

    let left = Math.floor(anchorRect.right - 2);
    let top = Math.floor(anchorRect.top - 2);

    if (left + offsetWidth > window.innerWidth - margin) {
      left = Math.floor(anchorRect.left - offsetWidth + 2);
    }

    if (left < margin) {
      left = margin;
    }

    const maxTop = Math.max(margin, window.innerHeight - taskbarHeight - offsetHeight);
    if (top > maxTop) {
      top = maxTop;
    }
    if (top < margin) {
      top = margin;
    }

    panelEl.style.left = `${left}px`;
    panelEl.style.top = `${top}px`;
    panelEl.dataset.level = String(level);
  }

  function buildCascadePanel(nodes, level) {
    const panel = document.createElement("div");
    panel.className = "start-cascade-panel";

    const list = document.createElement("ul");
    list.className = "start-cascade-list";

    nodes.forEach((node) => {
      const listItem = document.createElement("li");
      listItem.className = "start-cascade-row";

      const itemBtn = document.createElement("button");
      const openable = isNodeOpenable(node);
      const expandable = isExpandableFolder(node);

      itemBtn.type = "button";
      itemBtn.className = `start-cascade-item${openable ? "" : " is-disabled"}`;

      const icon = document.createElement("img");
      icon.className = "start-item-icon small";
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      icon.src = getNodeIconUrl(node);

      const label = document.createElement("span");
      label.textContent = node.title || "Item";

      itemBtn.appendChild(icon);
      itemBtn.appendChild(label);

      if (expandable) {
        const arrow = document.createElement("span");
        arrow.className = "start-cascade-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "▶";
        itemBtn.appendChild(arrow);
      }

      itemBtn.addEventListener("mouseenter", () => {
        if (!expandable) {
          clearPanelsFrom(level + 1);
          return;
        }

        setActiveRow(level, itemBtn);
        const children = getFolderChildren(node);
        openPanel(children, level + 1, itemBtn.getBoundingClientRect());
      });

      itemBtn.addEventListener("click", async (event) => {
        event.stopPropagation();

        if (expandable) {
          setActiveRow(level, itemBtn);
          const children = getFolderChildren(node);
          openPanel(children, level + 1, itemBtn.getBoundingClientRect());
          return;
        }

        if (!openable || typeof onOpenNode !== "function") return;

        await onOpenNode(node);
        closeMenu();
      });

      listItem.appendChild(itemBtn);
      list.appendChild(listItem);
    });

    if (nodes.length === 0) {
      const empty = document.createElement("p");
      empty.className = "start-tree-empty";
      empty.textContent = "No documents";
      panel.appendChild(empty);
    } else {
      panel.appendChild(list);
    }

    return panel;
  }

  function openPanel(nodes, level, anchorRect) {
    clearPanelsFrom(level);

    const panel = buildCascadePanel(nodes, level);
    cascadeRoot.appendChild(panel);
    cascadeRoot.classList.remove("hidden");

    positionPanel(panel, anchorRect, level);

    panelStates.push({ level, el: panel });
    if (documentsButton) {
      documentsButton.setAttribute("aria-expanded", "true");
    }
  }

  function openDocumentsPanel() {
    const children = getFolderChildren(manifestRoot);
    const anchorRect = documentsButton.getBoundingClientRect();
    openPanel(children, 0, anchorRect);
  }

  startBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !isMenuOpen();

    startMenu.classList.toggle("hidden", !willOpen);
    startBtn.classList.toggle("pressed", willOpen);

    if (!willOpen) {
      clearPanelsFrom(0);
    }
  });

  if (documentsButton && manifestRoot) {
    documentsButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const isExpanded = documentsButton.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        clearPanelsFrom(0);
        return;
      }

      openDocumentsPanel();
    });

    documentsButton.addEventListener("mouseenter", () => {
      if (!isMenuOpen()) return;
      if (documentsButton.getAttribute("aria-expanded") === "true") return;
      openDocumentsPanel();
    });
  }

  startMenu.addEventListener("click", async (event) => {
    const rowButton = event.target.closest("[data-start-item]");
    if (!rowButton) return;

    const action = rowButton.getAttribute("data-start-item");
    if (action !== "documents") {
      if (typeof onAction === "function") {
        await onAction(action);
      }
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen()) return;

    const clickedInsideMenu = startMenu.contains(event.target);
    const clickedInsidePanels = cascadeRoot.contains(event.target);
    const clickedStart = startBtn.contains(event.target);

    if (!clickedInsideMenu && !clickedInsidePanels && !clickedStart) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMenuOpen()) return;
    clearPanelsFrom(0);
  });
}
