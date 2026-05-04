export function createWindowManager({ windowsLayerId = "windows-layer", taskButtonsId = "task-buttons" } = {}) {
  const windowsLayer = document.getElementById(windowsLayerId);
  const taskButtonsContainer = document.getElementById(taskButtonsId);

  if (!windowsLayer || !taskButtonsContainer) {
    throw new Error("Window manager could not find required DOM containers.");
  }

  let topZ = 10;
  let winCounter = 0;
  const windowsMap = new Map();

  function bringToFront(winId) {
    const state = windowsMap.get(winId);
    if (!state || !state.el) return;

    topZ += 1;
    state.el.style.zIndex = topZ;

    windowsMap.forEach((winState) => {
      winState.taskBtn.classList.remove("active-task");
    });

    state.taskBtn.classList.add("active-task");
  }

  function setWindowPosition(el) {
    const offset = (winCounter % 8) * 24;
    el.style.left = `${220 + offset}px`;
    el.style.top = `${70 + offset}px`;
  }

  function buildWindowShell({ id, title, app }) {
    const isNotepad = app === "notepad";

    const win = document.createElement("section");
    win.className = `win98-window ${isNotepad ? "notepad" : "word"}`;
    win.dataset.winId = id;

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-left">
          <div class="title-icon placeholder-icon small"></div>
          <span class="window-title-text">${title}</span>
        </div>
        <div class="title-buttons">
          <button class="title-btn min-btn" aria-label="Minimize">_</button>
          <button class="title-btn max-btn" aria-label="Maximize">□</button>
          <button class="title-btn close-btn" aria-label="Close">×</button>
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

      <div class="document-area">
        <article class="paper document-content">Loading...</article>
      </div>

      <div class="status-bar">
        ${
          isNotepad
            ? `<div class="status-panel">Ln 1, Col 1</div>`
            : `<div class="status-panel">Page 1</div><div class="status-panel">Sec 1</div><div class="status-panel">At 1"</div>`
        }
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
    state.taskBtn.classList.remove("active-task");
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

    if (isMaximized) {
      maxBtn.setAttribute("aria-label", "Restore");
      maxBtn.textContent = "❐";
      return;
    }

    maxBtn.setAttribute("aria-label", "Maximize");
    maxBtn.textContent = "□";
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

    const layerBounds = windowsLayer.getBoundingClientRect();

    state.el.style.left = "0";
    state.el.style.top = "0";
    state.el.style.width = `${Math.max(0, Math.floor(layerBounds.width))}px`;
    state.el.style.height = `${Math.max(0, Math.floor(layerBounds.height))}px`;
    state.maximized = true;
    setMaxButtonState(state, true);
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
    state.taskBtn.remove();
    windowsMap.delete(winId);

    let topState = null;
    windowsMap.forEach((winState) => {
      if (winState.minimized) return;
      if (!topState || Number(winState.el.style.zIndex) > Number(topState.el.style.zIndex)) {
        topState = winState;
      }
    });

    if (topState) {
      topState.taskBtn.classList.add("active-task");
    }
  }

  async function openDocument({ name, title, file, app }) {
    const id = `win-${++winCounter}`;

    const winEl = buildWindowShell({ id, title, app });
    setWindowPosition(winEl);
    windowsLayer.appendChild(winEl);

    const taskBtn = createTaskButton(name, id);

    const state = {
      id,
      name,
      title,
      file,
      app,
      el: winEl,
      taskBtn,
      minimized: false,
      maximized: false,
      restoreBounds: null
    };
    windowsMap.set(id, state);

    const contentEl = winEl.querySelector(".document-content");
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      contentEl.innerHTML = await response.text();
    } catch (error) {
      contentEl.innerHTML = `
        <h1>Error</h1>
        <p>Could not load <strong>${file}</strong>.</p>
        <p>${error.message}</p>
      `;
    }

    bringToFront(id);

    winEl.addEventListener("mousedown", () => bringToFront(id));

    const minBtn = winEl.querySelector(".min-btn");
    const maxBtn = winEl.querySelector(".max-btn");
    const closeBtn = winEl.querySelector(".close-btn");
    const titleBar = winEl.querySelector(".title-bar");

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

    taskBtn.addEventListener("click", () => {
      const windowState = windowsMap.get(id);
      if (!windowState) return;

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

  return {
    openDocument
  };
}
