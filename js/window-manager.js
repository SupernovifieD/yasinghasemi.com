export function createWindowManager({ windowsLayerId = "windows-layer", taskButtonsId = "task-buttons" } = {}) {
  const ICON_MINIMIZE_URL = new URL("../assets/icons/16/window-minimize.png", import.meta.url).href;
  const ICON_MAXIMIZE_URL = new URL("../assets/icons/16/window-maximize.png", import.meta.url).href;
  const ICON_RESTORE_URL = new URL("../assets/icons/16/window-restore.png", import.meta.url).href;
  const ICON_CLOSE_URL = new URL("../assets/icons/16/window-close.png", import.meta.url).href;
  const ICON_OFFICE_DOC_URL = new URL("../assets/icons/16/x-office-document.png", import.meta.url).href;
  const ICON_OFFICE_DOC_32_URL = new URL("../assets/icons/32/x-office-document.png", import.meta.url).href;
  const ICON_NOTEPAD_URL = new URL("../assets/icons/48/w98_notepad.ico", import.meta.url).href;
  const ICON_FOLDER_16_URL = new URL("../assets/icons/16/folder.png", import.meta.url).href;
  const ICON_FOLDER_32_URL = new URL("../assets/icons/32/folder.png", import.meta.url).href;

  const UNSUPPORTED_EXPLORER_TYPES = new Set(["jpeg", "png", "mpeg", "mp3", "file"]);

  const windowsLayer = document.getElementById(windowsLayerId);
  const taskButtonsContainer = document.getElementById(taskButtonsId);

  if (!windowsLayer || !taskButtonsContainer) {
    throw new Error("Window manager could not find required DOM containers.");
  }

  let topZ = 10;
  let winCounter = 0;
  const windowsMap = new Map();

  function normalizeFolderPath(value = "") {
    return String(value)
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
  }

  function fillWindowToDesktop(el) {
    const layerBounds = windowsLayer.getBoundingClientRect();
    el.style.left = "0";
    el.style.top = "0";
    el.style.width = `${Math.max(0, Math.floor(layerBounds.width))}px`;
    el.style.height = `${Math.max(0, Math.floor(layerBounds.height))}px`;
  }

  function shouldRenderWord(state) {
    return state.kind === "document" && state.app === "word";
  }

  function getWordPageMetrics(state) {
    const documentArea = state.el.querySelector(".document-area");
    if (!documentArea) {
      return {
        width: 620,
        height: Math.round(620 * 1.4142),
        gap: 24
      };
    }

    if (state.locked && state.fullscreen) {
      return {
        width: Math.max(280, Math.floor(documentArea.clientWidth - 20)),
        height: Math.max(220, Math.floor(documentArea.clientHeight - 20)),
        gap: 0
      };
    }

    const areaWidth = Math.max(320, Math.floor(documentArea.clientWidth));
    const targetWidth = state.maximized
      ? Math.round(areaWidth * 0.8)
      : Math.min(660, Math.round(areaWidth * 0.92));
    const pageWidth = Math.max(440, targetWidth);

    return {
      width: pageWidth,
      height: Math.round(pageWidth * 1.4142),
      gap: 24
    };
  }

  function createWordPage(metrics) {
    const page = document.createElement("section");
    page.className = "paper word-page";
    page.style.width = `${metrics.width}px`;
    page.style.height = `${metrics.height}px`;

    const body = document.createElement("div");
    body.className = "word-page-body";
    page.appendChild(body);

    return { page, body };
  }

  function sanitizeWordNodes(rawHtml) {
    const template = document.createElement("template");
    template.innerHTML = rawHtml;

    const nodes = [];
    template.content.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const p = document.createElement("p");
        p.textContent = text;
        nodes.push(p);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        nodes.push(node.cloneNode(true));
      }
    });

    return nodes;
  }

  function splitNodeByWords(node, testBody) {
    const text = (node.textContent || "").trim();
    if (!text) return { headNode: null, tailNode: null };

    const words = text.split(/\s+/);
    if (words.length < 2) return { headNode: node, tailNode: null };

    const head = node.cloneNode(false);
    let low = 1;
    let high = words.length;
    let fitCount = 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      head.textContent = words.slice(0, mid).join(" ");
      testBody.appendChild(head);
      const fits = testBody.scrollHeight <= testBody.clientHeight;
      testBody.removeChild(head);

      if (fits) {
        fitCount = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    head.textContent = words.slice(0, fitCount).join(" ");
    const tailText = words.slice(fitCount).join(" ");
    if (!tailText) {
      return { headNode: head, tailNode: null };
    }

    const tail = node.cloneNode(false);
    tail.textContent = tailText;
    return { headNode: head, tailNode: tail };
  }

  function appendNodeToPagedWord(node, pagesContainer, currentBody, metrics) {
    const candidate = node.cloneNode(true);
    currentBody.appendChild(candidate);

    if (currentBody.scrollHeight <= currentBody.clientHeight) {
      return currentBody;
    }

    currentBody.removeChild(candidate);

    if (currentBody.children.length === 0) {
      const { headNode, tailNode } = splitNodeByWords(candidate, currentBody);
      if (headNode) {
        currentBody.appendChild(headNode);
      }

      if (tailNode) {
        const next = createWordPage(metrics);
        pagesContainer.appendChild(next.page);
        next.body.appendChild(tailNode);
        return next.body;
      }

      return currentBody;
    }

    const next = createWordPage(metrics);
    pagesContainer.appendChild(next.page);
    next.body.appendChild(candidate);

    if (next.body.scrollHeight > next.body.clientHeight && next.body.children.length === 1) {
      next.body.removeChild(candidate);
      const { headNode, tailNode } = splitNodeByWords(candidate, next.body);
      if (headNode) {
        next.body.appendChild(headNode);
      }
      if (tailNode) {
        const extra = createWordPage(metrics);
        pagesContainer.appendChild(extra.page);
        extra.body.appendChild(tailNode);
        return extra.body;
      }
    }

    return next.body;
  }

  function updateWordPageIndicator(state) {
    const indicator = state.el.querySelector(".page-indicator");
    if (!indicator) return;

    const pages = state.el.querySelectorAll(".word-page");
    const totalPages = pages.length || 1;
    const documentArea = state.el.querySelector(".document-area");

    let currentPage = 1;
    if (documentArea && state.wordLayout) {
      const step = state.wordLayout.height + state.wordLayout.gap;
      currentPage = Math.floor((documentArea.scrollTop + 8) / step) + 1;
      currentPage = Math.max(1, Math.min(totalPages, currentPage));
    }

    indicator.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  function renderWordDocument(state) {
    if (!state.wordSourceHtml) return;

    const pagesContainer = state.el.querySelector(".word-pages");
    const documentArea = state.el.querySelector(".document-area");
    if (!pagesContainer || !documentArea) return;

    const metrics = getWordPageMetrics(state);
    state.wordLayout = metrics;

    const nodes = sanitizeWordNodes(state.wordSourceHtml);
    pagesContainer.innerHTML = "";

    const firstPage = createWordPage(metrics);
    pagesContainer.appendChild(firstPage.page);

    let cursor = firstPage.body;
    nodes.forEach((node) => {
      cursor = appendNodeToPagedWord(node, pagesContainer, cursor, metrics);
    });

    if (!state.wordScrollHandler) {
      state.wordScrollHandler = () => updateWordPageIndicator(state);
      documentArea.addEventListener("scroll", state.wordScrollHandler);
    }

    updateWordPageIndicator(state);
  }

  function setWordZoomClass(state) {
    if (!shouldRenderWord(state)) return;
    state.el.classList.toggle("word-maximized", Boolean(state.maximized));
  }

  function bringToFront(winId) {
    const state = windowsMap.get(winId);
    if (!state || !state.el) return;

    topZ += 1;
    state.el.style.zIndex = topZ;

    windowsMap.forEach((winState) => {
      if (winState.taskBtn) {
        winState.taskBtn.classList.remove("active-task");
      }
    });

    if (state.taskBtn) {
      state.taskBtn.classList.add("active-task");
    }
  }

  function setWindowPosition(el) {
    const offset = (winCounter % 8) * 24;
    el.style.left = `${220 + offset}px`;
    el.style.top = `${70 + offset}px`;
  }

  function buildDocumentShell({ id, title, app, locked = false }) {
    const isNotepad = app === "notepad";
    const titleIcon = isNotepad
      ? `<img class="title-icon title-app-icon small" src="${ICON_NOTEPAD_URL}" alt="" aria-hidden="true" />`
      : `<img class="title-icon title-app-icon small" src="${ICON_OFFICE_DOC_URL}" alt="" aria-hidden="true" />`;

    const contentMarkup = isNotepad
      ? `<pre class="document-content notepad-content">Loading...</pre>`
      : `<div class="document-content word-pages"></div>`;

    const statusMarkup = isNotepad
      ? `<div class="status-panel">Ln 1, Col 1</div>`
      : `<div class="status-panel page-indicator">Page 1 of 1</div><div class="status-panel">Sec 1</div><div class="status-panel">At 1&quot;</div>`;

    const win = document.createElement("section");
    win.className = `win98-window ${isNotepad ? "notepad" : "word"}${locked ? " locked-window" : ""}`;
    win.dataset.winId = id;

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-left">
          ${titleIcon}
          <span class="window-title-text">${title}</span>
        </div>
        <div class="title-buttons">
          <button class="title-btn min-btn" aria-label="Minimize">
            <img class="title-btn-icon" src="${ICON_MINIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn max-btn" aria-label="Maximize">
            <img class="title-btn-icon" src="${ICON_MAXIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn close-btn" aria-label="Close">
            <img class="title-btn-icon" src="${ICON_CLOSE_URL}" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="menu-bar">
        ${
          isNotepad
            ? `<span>File</span><span>Edit</span><span>Search</span><span>Help</span>`
            : `<span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Table</span><span>Window</span><span>Help</span>`
        }
      </div>

      ${
        isNotepad
          ? ""
          : `<div class="toolbar-row">
              <div class="toolbar-icon placeholder-icon tiny"></div>
              <div class="toolbar-icon placeholder-icon tiny"></div>
              <div class="toolbar-icon placeholder-icon tiny"></div>
              <div class="toolbar-icon placeholder-icon tiny"></div>
            </div>`
      }

      <div class="document-area">${contentMarkup}</div>

      <div class="status-bar">${statusMarkup}</div>
    `;

    return win;
  }

  function buildExplorerShell({ id, title }) {
    const win = document.createElement("section");
    win.className = "win98-window explorer";
    win.dataset.winId = id;

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-left">
          <img class="title-icon title-app-icon small" src="${ICON_FOLDER_16_URL}" alt="" aria-hidden="true" />
          <span class="window-title-text">${title}</span>
        </div>
        <div class="title-buttons">
          <button class="title-btn min-btn" aria-label="Minimize">
            <img class="title-btn-icon" src="${ICON_MINIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn max-btn" aria-label="Maximize">
            <img class="title-btn-icon" src="${ICON_MAXIMIZE_URL}" alt="" aria-hidden="true" />
          </button>
          <button class="title-btn close-btn" aria-label="Close">
            <img class="title-btn-icon" src="${ICON_CLOSE_URL}" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="menu-bar">
        <span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Favorites</span><span>Help</span>
      </div>

      <div class="toolbar-row explorer-toolbar">
        <span class="explorer-toolbar-label">Address:</span>
        <div class="explorer-address"></div>
      </div>

      <div class="document-area explorer-area">
        <div class="explorer-grid" role="list"></div>
      </div>

      <div class="status-bar">
        <div class="status-panel explorer-status">0 item(s)</div>
      </div>
    `;

    return win;
  }

  function createTaskButton(name, winId) {
    const btn = document.createElement("button");
    btn.className = "task-button";
    btn.textContent = name;
    btn.dataset.winId = winId;
    taskButtonsContainer.appendChild(btn);
    return btn;
  }

  function minimizeWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    state.el.style.display = "none";
    state.minimized = true;
    if (state.taskBtn) {
      state.taskBtn.classList.remove("active-task");
    }
  }

  function restoreWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    state.el.style.display = "flex";
    state.minimized = false;
  }

  function setMaxButtonState(state, isMaximized) {
    const maxBtn = state.el.querySelector(".max-btn");
    if (!maxBtn) return;
    const iconEl = maxBtn.querySelector(".title-btn-icon");

    if (isMaximized) {
      maxBtn.setAttribute("aria-label", "Restore");
      if (iconEl) iconEl.setAttribute("src", ICON_RESTORE_URL);
      return;
    }

    maxBtn.setAttribute("aria-label", "Maximize");
    if (iconEl) iconEl.setAttribute("src", ICON_MAXIMIZE_URL);
  }

  function maximizeWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state || state.maximized) return;

    state.restoreBounds = {
      left: state.el.style.left,
      top: state.el.style.top,
      width: state.el.style.width,
      height: state.el.style.height
    };

    fillWindowToDesktop(state.el);
    state.maximized = true;
    setMaxButtonState(state, true);
    setWordZoomClass(state);
    if (shouldRenderWord(state)) {
      renderWordDocument(state);
    }
  }

  function restoreFromMaximized(winId) {
    const state = windowsMap.get(winId);
    if (!state || !state.maximized) return;

    const bounds = state.restoreBounds || {};
    state.el.style.left = bounds.left || "";
    state.el.style.top = bounds.top || "";
    state.el.style.width = bounds.width || "";
    state.el.style.height = bounds.height || "";
    state.maximized = false;
    state.restoreBounds = null;
    setMaxButtonState(state, false);
    setWordZoomClass(state);
    if (shouldRenderWord(state)) {
      renderWordDocument(state);
    }
  }

  function toggleMaximized(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    if (state.maximized) {
      restoreFromMaximized(winId);
      return;
    }

    maximizeWindow(winId);
  }

  function closeWindow(winId) {
    const state = windowsMap.get(winId);
    if (!state) return;

    state.el.remove();
    if (state.taskBtn) {
      state.taskBtn.remove();
    }
    windowsMap.delete(winId);

    let topState = null;
    windowsMap.forEach((winState) => {
      if (winState.minimized) return;
      if (!topState || Number(winState.el.style.zIndex) > Number(topState.el.style.zIndex)) {
        topState = winState;
      }
    });

    if (topState && topState.taskBtn) {
      topState.taskBtn.classList.add("active-task");
    }
  }

  function attachWindowEvents(state) {
    const { id, el, locked, taskBtn } = state;

    bringToFront(id);
    el.addEventListener("mousedown", () => bringToFront(id));

    const minBtn = el.querySelector(".min-btn");
    const maxBtn = el.querySelector(".max-btn");
    const closeBtn = el.querySelector(".close-btn");
    const titleBar = el.querySelector(".title-bar");

    if (!locked) {
      minBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        minimizeWindow(id);
      });

      maxBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMaximized(id);
        bringToFront(id);
      });

      closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        closeWindow(id);
      });

      titleBar.addEventListener("dblclick", () => {
        toggleMaximized(id);
        bringToFront(id);
      });
    }

    if (taskBtn) {
      taskBtn.addEventListener("click", () => {
        const windowState = windowsMap.get(id);
        if (!windowState || windowState.locked) return;

        if (windowState.minimized) {
          restoreWindow(id);
          bringToFront(id);
          return;
        }

        const isActive = taskBtn.classList.contains("active-task");
        if (isActive) {
          minimizeWindow(id);
        } else {
          bringToFront(id);
        }
      });
    }
  }

  function applyFullscreen(state) {
    fillWindowToDesktop(state.el);
    state.maximized = true;
    setMaxButtonState(state, true);
    setWordZoomClass(state);
    if (shouldRenderWord(state)) {
      renderWordDocument(state);
    }
  }

  function restoreAndFocus(state) {
    if (state.minimized) {
      restoreWindow(state.id);
    }
    bringToFront(state.id);
  }

  function findExistingDocument(file, app) {
    for (const state of windowsMap.values()) {
      if (state.kind !== "document") continue;
      if (state.file === file && state.app === app) {
        return state;
      }
    }
    return null;
  }

  function getExplorerIconUrl(type) {
    if (type === "folder") return ICON_FOLDER_32_URL;
    if (type === "doc") return ICON_OFFICE_DOC_32_URL;
    if (type === "txt") return ICON_NOTEPAD_URL;
    if (type === "jpeg" || type === "png" || type === "mpeg" || type === "mp3") {
      return ICON_OFFICE_DOC_32_URL;
    }
    return ICON_OFFICE_DOC_32_URL;
  }

  function isExplorerItemOpenable(item) {
    if (!item) return false;
    if (item.type === "folder") return true;
    if (item.type === "doc") return true;
    if (item.type === "txt") return true;
    return !UNSUPPORTED_EXPLORER_TYPES.has(item.type);
  }

  function renderExplorerItems(state) {
    const grid = state.el.querySelector(".explorer-grid");
    const status = state.el.querySelector(".explorer-status");
    const addressEl = state.el.querySelector(".explorer-address");
    if (!grid || !status || !addressEl) return;

    const items = Array.isArray(state.items) ? state.items : [];

    grid.innerHTML = "";
    addressEl.textContent = state.folderPath ? `My Documents\\${state.folderPath.replaceAll("/", "\\")}` : "My Documents";

    items.forEach((item) => {
      const entryBtn = document.createElement("button");
      const openable = isExplorerItemOpenable(item);
      entryBtn.type = "button";
      entryBtn.className = `explorer-item${openable ? "" : " is-disabled"}`;
      entryBtn.dataset.entryPath = item.path || "";
      entryBtn.dataset.entryType = item.type || "file";

      const icon = document.createElement("img");
      icon.className = "icon-image explorer-item-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("alt", "");
      icon.setAttribute("src", getExplorerIconUrl(item.type));

      const label = document.createElement("span");
      label.className = "explorer-item-label";
      label.textContent = item.title || "Item";

      entryBtn.appendChild(icon);
      entryBtn.appendChild(label);

      entryBtn.addEventListener("click", () => {
        state.selectedEntryPath = item.path || "";
        const allEntries = grid.querySelectorAll(".explorer-item");
        allEntries.forEach((el) => el.classList.remove("is-selected"));
        entryBtn.classList.add("is-selected");
      });

      entryBtn.addEventListener("dblclick", () => {
        if (!openable) return;
        if (typeof state.onOpenItem !== "function") return;
        state.onOpenItem(item);
      });

      grid.appendChild(entryBtn);
    });

    if (items.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "explorer-empty";
      emptyState.textContent = "This folder is empty.";
      grid.appendChild(emptyState);
    }

    status.textContent = `${items.length} item(s)`;
  }

  function findExistingExplorer(folderPath) {
    const normalizedFolderPath = normalizeFolderPath(folderPath);

    for (const state of windowsMap.values()) {
      if (state.kind !== "explorer") continue;
      if (normalizeFolderPath(state.folderPath) === normalizedFolderPath) {
        return state;
      }
    }

    return null;
  }

  async function openDocument({
    name,
    title,
    file,
    app,
    fullscreen = false,
    locked = false,
    createTaskbarButton = true
  }) {
    const existing = findExistingDocument(file, app);
    if (existing) {
      restoreAndFocus(existing);
      return existing.id;
    }

    const id = `win-${++winCounter}`;

    const winEl = buildDocumentShell({ id, title, app, locked });
    setWindowPosition(winEl);
    windowsLayer.appendChild(winEl);

    const taskBtn = createTaskbarButton ? createTaskButton(name, id) : null;

    const state = {
      id,
      kind: "document",
      name,
      title,
      file,
      app,
      fullscreen,
      el: winEl,
      taskBtn,
      locked,
      minimized: false,
      maximized: false,
      restoreBounds: null,
      wordSourceHtml: null,
      wordLayout: null,
      wordScrollHandler: null
    };
    windowsMap.set(id, state);

    const contentEl = winEl.querySelector(".document-content");
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      const raw = await response.text();

      if (app === "notepad") {
        contentEl.textContent = raw;
      } else {
        state.wordSourceHtml = raw;
        renderWordDocument(state);
      }
    } catch (error) {
      if (app === "notepad") {
        contentEl.textContent = `Error\n\nCould not load ${file}\n${error.message}`;
      } else {
        state.wordSourceHtml = `
          <h1>Error</h1>
          <p>Could not load <strong>${file}</strong>.</p>
          <p>${error.message}</p>
        `;
        renderWordDocument(state);
      }
    }

    attachWindowEvents(state);

    if (fullscreen) {
      applyFullscreen(state);
    }

    return id;
  }

  function openExplorer({
    name,
    title,
    folderPath = "",
    items = [],
    onOpenItem,
    createTaskbarButton = true
  }) {
    const normalizedFolderPath = normalizeFolderPath(folderPath);
    const existing = findExistingExplorer(normalizedFolderPath);

    if (existing) {
      existing.items = Array.isArray(items) ? items : [];
      existing.onOpenItem = onOpenItem;
      existing.title = title;
      existing.name = name;
      const titleEl = existing.el.querySelector(".window-title-text");
      if (titleEl) {
        titleEl.textContent = title;
      }
      if (existing.taskBtn) {
        existing.taskBtn.textContent = name;
      }
      renderExplorerItems(existing);
      restoreAndFocus(existing);
      return existing.id;
    }

    const id = `win-${++winCounter}`;

    const winEl = buildExplorerShell({ id, title });
    setWindowPosition(winEl);
    windowsLayer.appendChild(winEl);

    const taskBtn = createTaskbarButton ? createTaskButton(name, id) : null;

    const state = {
      id,
      kind: "explorer",
      name,
      title,
      app: "explorer",
      folderPath: normalizedFolderPath,
      items: Array.isArray(items) ? items : [],
      onOpenItem,
      el: winEl,
      taskBtn,
      locked: false,
      minimized: false,
      maximized: false,
      restoreBounds: null,
      selectedEntryPath: ""
    };

    windowsMap.set(id, state);
    renderExplorerItems(state);
    attachWindowEvents(state);

    return id;
  }

  window.addEventListener("resize", () => {
    windowsMap.forEach((state) => {
      if (state.maximized) {
        fillWindowToDesktop(state.el);
      }

      if (shouldRenderWord(state) && state.wordSourceHtml) {
        renderWordDocument(state);
      }
    });
  });

  return {
    openDocument,
    openExplorer
  };
}
