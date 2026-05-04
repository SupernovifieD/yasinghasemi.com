function runWhenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }

  callback();
}

runWhenReady(async () => {
  try {
    const { initApp } = await import("./app.js");
    initApp();
  } catch (error) {
    console.error("Failed to bootstrap app.", error);
  }
});
