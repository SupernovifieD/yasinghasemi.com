function formatTime(now) {
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours || 12;

  return `${hours}:${minutes} ${ampm}`;
}

function updateClock(clockEl) {
  clockEl.textContent = formatTime(new Date());
}

export function initClock(clockId = "clock") {
  const clockEl = document.getElementById(clockId);
  if (!clockEl) return;

  updateClock(clockEl);
  setInterval(() => updateClock(clockEl), 1000);
}
