export function initDesktopIcons({ onOpenDocument }) {
  if (typeof onOpenDocument !== "function") {
    throw new Error("initDesktopIcons requires an onOpenDocument callback.");
  }

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

      await onOpenDocument({ name, title, file, app });
    });
  });
}
