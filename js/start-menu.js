export function initStartMenu({ startButtonId = "start-btn", startMenuId = "start-menu" } = {}) {
  const startBtn = document.getElementById(startButtonId);
  const startMenu = document.getElementById(startMenuId);

  if (!startBtn || !startMenu) return;

  startBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    startMenu.classList.toggle("hidden");
    startBtn.classList.toggle("pressed");
  });

  document.addEventListener("click", (event) => {
    if (startMenu.classList.contains("hidden")) return;

    const clickedInsideMenu = startMenu.contains(event.target);
    const clickedStart = startBtn.contains(event.target);

    if (!clickedInsideMenu && !clickedStart) {
      startMenu.classList.add("hidden");
      startBtn.classList.remove("pressed");
    }
  });
}
