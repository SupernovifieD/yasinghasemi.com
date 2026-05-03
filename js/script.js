// =========================
// Clock
// =========================
function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  if (!clock) return;

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  clock.textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// =========================
// Start menu
// =========================
const startBtn = document.getElementById("start-btn");
const startMenu = document.getElementById("start-menu");

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.classList.toggle("hidden");
  startBtn.classList.toggle("pressed");
});

document.addEventListener("click", (e) => {
  if (!startMenu.classList.contains("hidden")) {
    const clickedInsideMenu = startMenu.contains(e.target);
    const clickedStart = startBtn.contains(e.target);
    if (!clickedInsideMenu && !clickedStart) {
      startMenu.classList.add("hidden");
      startBtn.classList.remove("pressed");
    }
  }
});

// =========================
// Multi-window manager
// =========================
const windowsLayer = document.getElementById("windows-layer");
const taskButtonsContainer = document.getElementById("task-buttons");

let topZ = 10;
let winCounter = 0;

// id -> state
const windowsMap = new Map();

/*
state = {
  id, name, title, file, app,
  el, taskBtn, minimized
}
*/

function bringToFront(winId) {
  const state = windowsMap.get(winId);
  if (!state || !state.el) return;
  topZ++;
  state.el.style.zIndex = topZ;

  // mark active task button
  windowsMap.forEach((w) => w.taskBtn.classList.remove("active-task"));
  state.taskBtn.classList.add("active-task");
}

function setWindowPosition(el) {
  // stagger windows
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
        ? ``
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
    minimized: false
  };
  windowsMap.set(id, state);

  // Load file content
  const contentEl = winEl.querySelector(".document-content");
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    const html = await response.text();
    contentEl.innerHTML = html;
  } catch (err) {
    contentEl.innerHTML = `
      <h1>Error</h1>
      <p>Could not load <strong>${file}</strong>.</p>
      <p>${err.message}</p>
    `;
  }

  // Bring to front initially
  bringToFront(id);

  // Clicking anywhere on window brings to front
  winEl.addEventListener("mousedown", () => bringToFront(id));

  // Window controls
  const minBtn = winEl.querySelector(".min-btn");
  const closeBtn = winEl.querySelector(".close-btn");

  minBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    minimizeWindow(id);
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeWindow(id);
  });

  // Task button behavior
  taskBtn.addEventListener("click", () => {
    const w = windowsMap.get(id);
    if (!w) return;

    if (w.minimized) {
      restoreWindow(id);
      bringToFront(id);
      return;
    }

    // If already active and visible, minimize (Windows-like)
    const isActive = taskBtn.classList.contains("active-task");
    if (isActive) {
      minimizeWindow(id);
    } else {
      bringToFront(id);
    }
  });
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

function closeWindow(winId) {
  const state = windowsMap.get(winId);
  if (!state) return;

  state.el.remove();
  state.taskBtn.remove();
  windowsMap.delete(winId);

  // Activate top-most visible window if any
  let topState = null;
  windowsMap.forEach((w) => {
    if (w.minimized) return;
    if (!topState || Number(w.el.style.zIndex) > Number(topState.el.style.zIndex)) {
      topState = w;
    }
  });

  if (topState) topState.taskBtn.classList.add("active-task");
}

// Desktop icon double-click
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("dblclick", async () => {
    const type = icon.dataset.type;
    const name = icon.dataset.name || "Item";

    if (type !== "doc") {
      alert(`${name} will open later.`);
      return;
    }

    const file = icon.dataset.file;
    const title = icon.dataset.title || `${name} - Document`;
    const app = icon.dataset.app || "word";

    await openDocument({ name, title, file, app });
  });
});

// Open Welcome.doc by default on page load
openDocument({
  name: "Welcome.doc",
  title: "Welcome.doc - Microsoft Word",
  file: "desktop/welcome.html",
  app: "word"
});
