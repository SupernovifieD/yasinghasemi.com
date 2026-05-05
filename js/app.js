import { initClock } from "./clock.js";
import { initStartMenu } from "./start-menu.js";
import { createWindowManager } from "./window-manager.js";
import { initDesktopIcons } from "./desktop-icons.js";

function isMobileClient() {
  const compactViewport = window.matchMedia("(max-width: 900px)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const touchCapable = navigator.maxTouchPoints > 0;

  return compactViewport && (coarsePointer || touchCapable);
}

export function initApp() {
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

  initStartMenu();

  initDesktopIcons({
    onOpenDocument: windowManager.openDocument
  });

  windowManager.openDocument({
    name: "Welcome.doc",
    title: "Welcome.doc - Microsoft Word",
    file: "desktop/welcome.html",
    app: "word"
  });
}
