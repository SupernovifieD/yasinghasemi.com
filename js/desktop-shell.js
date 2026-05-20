const DEFAULT_SHELL_URL = new URL("../partials/desktop-shell.html", import.meta.url);
const START_ICON_URL = new URL("../assets/icons/16/start-here.png", import.meta.url);
const ICON_BY_ID = {
  "my-computer": new URL("../assets/icons/64/computer_win98.png", import.meta.url).href,
  "my-documents": new URL("../assets/icons/64/folder-documents.png", import.meta.url).href,
  "project-folder": new URL("../assets/icons/64/folder.png", import.meta.url).href,
  find: new URL("../assets/icons/48/w2k_find.ico", import.meta.url).href,
  "office-doc": new URL("../assets/icons/32/x-office-document.png", import.meta.url).href,
  "desktop-home": new URL("../assets/icons/16/emblem-desktop.png", import.meta.url).href,
  "github-account": new URL("../assets/icons/16/github-pixel.svg", import.meta.url).href,
  "linkedin-account": new URL("../assets/icons/16/linkedin-pixel.svg", import.meta.url).href,
  notepad: new URL("../assets/icons/48/w98_notepad.ico", import.meta.url).href,
  "recycle-bin": new URL("../assets/icons/48/w98_recycle_bin_empty_cool.ico", import.meta.url).href,
  "network-neighborhood": new URL("../assets/icons/48/w98_network_television.ico", import.meta.url).href,
  "dial-up-networking": new URL("../assets/icons/48/w2k_dial-up_networking.ico", import.meta.url).href,
  internet: new URL("../assets/icons/48/w2k_globe.ico", import.meta.url).href,
  globe: new URL("../assets/icons/48/w2k_globe.ico", import.meta.url).href,
  "network-monitor": new URL("../assets/icons/48/w98_monitor_gear.ico", import.meta.url).href,
  radar: new URL("../assets/icons/48/w98_network_television.ico", import.meta.url).href,
  "control-panel": new URL("../assets/icons/48/w2k_control_panel.ico", import.meta.url).href,
  programs: new URL("../assets/icons/48/w2k_programs.ico", import.meta.url).href,
  help: new URL("../assets/icons/48/w2k_control_panel.ico", import.meta.url).href,
  run: new URL("../assets/icons/48/w2k_run.ico", import.meta.url).href,
  shutdown: new URL("../assets/icons/48/w2k_shutdown.ico", import.meta.url).href,
  volume: new URL("../assets/icons/48/w98_monitor_gear.ico", import.meta.url).href,
  "network-status": new URL("../assets/icons/48/w98_network_television.ico", import.meta.url).href,
  "new-document": new URL("../assets/icons/32/x-office-document.png", import.meta.url).href,
  "open-folder": new URL("../assets/icons/16/folder.png", import.meta.url).href,
  save: new URL("../assets/icons/48/w98_write_file.ico", import.meta.url).href,
  print: new URL("../assets/icons/48/w2k_printer.ico", import.meta.url).href,
  "image-file": new URL("../assets/icons/48/w2k_unknown_filetype.ico", import.meta.url).href,
  "audio-file": new URL("../assets/icons/48/w2k_unknown_filetype.ico", import.meta.url).href,
  "video-file": new URL("../assets/icons/48/w2k_unknown_filetype.ico", import.meta.url).href,
  "generic-file": new URL("../assets/icons/48/w2k_unknown_filetype.ico", import.meta.url).href
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
