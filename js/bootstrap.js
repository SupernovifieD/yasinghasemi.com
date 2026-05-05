function runWhenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }

  callback();
}

runWhenReady(async () => {
  try {
    const [{ loadDesktopShell }, { initApp }] = await Promise.all([
      import("./desktop-shell.js"),
      import("./app.js")
    ]);

    await loadDesktopShell();
    await initApp();
  } catch (error) {
    console.error("Failed to bootstrap app.", error);
  }
});
