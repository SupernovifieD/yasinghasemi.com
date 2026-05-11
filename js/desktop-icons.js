export function initDesktopIcons({ onOpenDocument, onOpenSystemIcon, onOpenFolderPath }) {
  if (typeof onOpenDocument !== "function") {
    throw new Error("initDesktopIcons requires an onOpenDocument callback.");
  }

  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    icon.addEventListener("dblclick", async () => {
      const type = icon.dataset.type;
      const name = icon.dataset.name || "Item";

      if (type === "doc") {
        const file = icon.dataset.file;
        const title = icon.dataset.title || `${name} - Document`;
        const app = icon.dataset.app || "word";
        await onOpenDocument({ name, title, file, app });
        return;
      }

      if (type === "folder" && typeof onOpenFolderPath === "function") {
        await onOpenFolderPath(icon.dataset.folderPath || "", { name, icon });
        return;
      }

      if (type === "system" && typeof onOpenSystemIcon === "function") {
        onOpenSystemIcon({ name, icon });
        return;
      }

      alert(`${name} will open later.`);
    });
  });
}
