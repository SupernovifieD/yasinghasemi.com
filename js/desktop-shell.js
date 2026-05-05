const DEFAULT_SHELL_URL = new URL("../partials/desktop-shell.html", import.meta.url);
const START_ICON_URL = new URL("../assets/icons/16/start-here.png", import.meta.url);
const ICON_BY_ID = {
  "my-computer": new URL("../assets/icons/64/computer_win98.png", import.meta.url).href,
  "my-documents": new URL("../assets/icons/64/folder-documents.png", import.meta.url).href,
  "office-doc": new URL("../assets/icons/64/x-office-document.png", import.meta.url).href
};

function getShellUrl(shellPath) {
  if (!shellPath) return DEFAULT_SHELL_URL;
  return new URL(shellPath, window.location.href);
}

export async function loadDesktopShell({ mountId = "app-root", shellPath } = {}) {
  const mountEl = document.getElementById(mountId);
  if (!mountEl) {
    throw new Error(`Desktop shell mount element '#${mountId}' was not found.`);
  }

  const shellUrl = getShellUrl(shellPath);
  const response = await fetch(shellUrl);
  if (!response.ok) {
    throw new Error(`Failed to load desktop shell from '${shellUrl.pathname}'.`);
  }

  mountEl.innerHTML = await response.text();

  const startLogo = mountEl.querySelector(".start-logo");
  if (startLogo) {
    startLogo.setAttribute("src", START_ICON_URL.href);
  }

  mountEl.querySelectorAll("[data-icon-id]").forEach((iconEl) => {
    const iconId = iconEl.getAttribute("data-icon-id");
    const iconUrl = iconId ? ICON_BY_ID[iconId] : null;
    if (iconUrl) {
      iconEl.setAttribute("src", iconUrl);
    }
  });
}
