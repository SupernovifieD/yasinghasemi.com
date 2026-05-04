const DEFAULT_SHELL_URL = new URL("../partials/desktop-shell.html", import.meta.url);

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
}
