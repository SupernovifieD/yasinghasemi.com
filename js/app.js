import { initClock } from "./clock.js";
import { initStartMenu } from "./start-menu.js";
import { createWindowManager } from "./window-manager.js";
import { initDesktopIcons } from "./desktop-icons.js";

export function initApp() {
  initClock();
  initStartMenu();

  const windowManager = createWindowManager();

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
